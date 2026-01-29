
import { DistributionRowExtended } from '../types';
import { BLOOD_GROUPS, MONTHS, GET_PRES_FOR_SITE } from '../constants';

const CSV_SOURCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvWxbSrjoG4XC2svVnGtLwYDEomCtuwW2Ap_vHKP0M6ONojDQU5LKTJj8Srel5k1d1mD9UI3F5R6r_/pub?gid=237684642&single=true&output=csv";

export const fetchSheetData = async (): Promise<DistributionRowExtended[]> => {
  try {
    const response = await fetch(CSV_SOURCE_URL, {
      method: 'GET',
      cache: 'no-store',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    if (!csvText || csvText.trim().toLowerCase().startsWith("<!doctype html") || csvText.includes("login")) {
      console.warn("Le flux retourné n'est pas un CSV valide.");
      return [];
    }
    
    return parseCSV(csvText);
  } catch (error) {
    console.error("Erreur critique lors de la synchronisation des données:", error);
    return [];
  }
};

const parseCSV = (csv: string): DistributionRowExtended[] => {
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length < 2) return [];

  const delimiter = ',';
  
  const splitLine = (text: string) => {
    const parts = [];
    let current = "";
    let inQuotes = false;
    for (let char of text) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === delimiter && !inQuotes) {
        parts.push(current.trim());
        current = "";
      } else current += char;
    }
    parts.push(current.trim());
    return parts.map(v => v.replace(/^"|"$/g, '').trim());
  };

  const rawHeaders = splitLine(lines[0]);
  const headers = rawHeaders.map(h => 
    h.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9_+]/g, "_")
  );

  const getIdx = (keywords: string[]) => 
    headers.findIndex(h => keywords.some(k => h === k.toUpperCase() || h.includes(k.toUpperCase())));

  const colIndex = {
    site: getIdx(['SI_NOM_COMPLET', 'SI_NOM', 'SITE']),
    date: getIdx(['DATE_DISTRI', 'DATE', 'JOUR']),
    count: getIdx(['NOMBRE', 'QUANTITE', 'NB']),
    product: getIdx(['NA_LIBELLE', 'PRODUIT', 'TYPE']),
    group: getIdx(['SA_GROUPE', 'GROUPE', 'GS']),
    facility: getIdx(['FS_NOM', 'ETABLISSEMENT', 'STRUCTURE']),
    rendu: getIdx(['BD_RENDU', 'RENDU'])
  };

  const aggregationMap: Map<string, DistributionRowExtended> = new Map();

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    if (values.length < 5) continue;

    const site = values[colIndex.site] || "SITE INCONNU";
    const pres = GET_PRES_FOR_SITE(site); // Détection du PRES
    const rawDate = values[colIndex.date] || "";
    const count = parseInt((values[colIndex.count] || "0").replace(/\s/g, '')) || 0;
    const product = values[colIndex.product] || "PRODUIT SANGUIN";
    const rawGroup = (values[colIndex.group] || "").toUpperCase().replace(/\s/g, '');
    const facility = values[colIndex.facility] || "HÔPITAL NON SPÉCIFIÉ";
    const rendu = parseInt((values[colIndex.rendu] || "0").replace(/\s/g, '')) || 0;

    let day = 0, monthIdx = -1, year = 0, dateStr = "";
    if (rawDate) {
      const parts = rawDate.split(/[/ -]/);
      if (parts.length >= 3) {
        let d, m, y;
        if (parts[0].length === 4) { y = parseInt(parts[0]); m = parseInt(parts[1]); d = parseInt(parts[2]); } 
        else { d = parseInt(parts[0]); m = parseInt(parts[1]); y = parseInt(parts[2]); }
        
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          day = d; monthIdx = m - 1; year = y;
          dateStr = `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
        }
      }
    }

    if (year === 0) continue;

    const key = `${pres}|${site}|${facility}|${product}|${dateStr}`;
    
    if (!aggregationMap.has(key)) {
      aggregationMap.set(key, {
        site,
        pres,
        facility,
        productType: product,
        dateStr,
        day,
        monthIdx,
        year,
        monthName: MONTHS[monthIdx] || "Inconnu",
        counts: BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<string, number>),
        total: 0,
        Bd_rendu: 0
      } as any);
    }

    const entry = aggregationMap.get(key)!;
    const normalizedRawGroup = rawGroup.replace('POS', '+').replace('NEG', '-').replace(/\s/g, '');
    
    const matchedGroup = BLOOD_GROUPS.find(bg => 
      normalizedRawGroup === bg || normalizedRawGroup.includes(bg)
    );

    if (matchedGroup) {
      entry.counts[matchedGroup] += count;
      entry.total += count;
    }
    
    entry.Bd_rendu += rendu;
  }

  return Array.from(aggregationMap.values());
};
