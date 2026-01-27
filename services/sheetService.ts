
import { DistributionRowExtended } from '../App';
import { BLOOD_GROUPS } from '../constants';

const SHEET_ID = "1iHaD6NfDQ0xKJP9lhhGdNn3eakmT1qUvu-YIL7kBXWg";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

export const fetchSheetData = async (): Promise<DistributionRowExtended[]> => {
  try {
    console.log("Fetching data from:", CSV_URL);
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("Impossible d'accéder au flux CSV du Google Sheet. Vérifiez qu'il est 'Publié sur le Web'.");
    
    const csvText = await response.text();
    console.log("CSV Received, length:", csvText.length);
    
    const rows = parseCSV(csvText);
    console.log("Parsed rows count:", rows.length);
    
    return rows;
  } catch (error) {
    console.error("Sheet Service Error:", error);
    throw error;
  }
};

/**
 * Parseur CSV robuste gérant les virgules dans les guillemets et les champs vides
 */
const parseCSV = (csv: string): DistributionRowExtended[] => {
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  // 1. Extraire et nettoyer les en-têtes
  const headers = splitCSVLine(lines[0]).map(h => h.trim().toUpperCase());
  console.log("Detected Headers:", headers);
  
  // 2. Trouver les indices des colonnes critiques
  const findIdx = (keywords: string[]) => 
    headers.findIndex(h => keywords.some(k => h.includes(k)));

  const colIndex = {
    site: findIdx(['SI_NOM', 'SITE']),
    facility: findIdx(['FS_NOM', 'STRUCTURE', 'ETABLISSEMENT']),
    product: findIdx(['NA_LIBELLE', 'PRODUIT', 'TYPE']),
    rendu: findIdx(['RENDU', 'BD_RENDU']),
    date: findIdx(['DATE', 'JOUR']),
    month: findIdx(['MOIS']),
    year: findIdx(['ANNEE', 'YEAR']),
    groups: BLOOD_GROUPS.reduce((acc, g) => {
      // Recherche exacte pour les groupes sanguins (A+, O-, etc.)
      acc[g] = headers.indexOf(g.toUpperCase());
      return acc;
    }, {} as Record<string, number>)
  };

  const results: DistributionRowExtended[] = [];

  // 3. Parser les lignes de données
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = splitCSVLine(line);
    if (values.length < headers.length / 2) continue; // Ligne malformée

    const counts: any = {};
    let rowTotal = 0;
    
    BLOOD_GROUPS.forEach(g => {
      const idx = colIndex.groups[g];
      const val = idx !== -1 ? (parseInt(values[idx].replace(/\s/g, '')) || 0) : 0;
      counts[g] = val;
      rowTotal += val;
    });

    results.push({
      site: values[colIndex.site] || 'SITE INCONNU',
      facility: values[colIndex.facility] || 'STRUCTURE INCONNUE',
      productType: values[colIndex.product] || 'PRODUIT SANS NOM',
      counts: counts,
      total: rowTotal,
      Bd_rendu: colIndex.rendu !== -1 ? (parseInt(values[colIndex.rendu].replace(/\s/g, '')) || 0) : 0,
      // On stocke les métadonnées temporelles si présentes pour le filtrage
      date: colIndex.date !== -1 ? values[colIndex.date] : undefined,
      month: colIndex.month !== -1 ? values[colIndex.month] : undefined,
      year: colIndex.year !== -1 ? values[colIndex.year] : undefined
    });
  }

  return results;
};

/**
 * Fonction utilitaire pour découper une ligne CSV en respectant les guillemets
 */
function splitCSVLine(line: string): string[] {
  const result = [];
  let curValue = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(curValue.trim().replace(/^"|"$/g, ''));
      curValue = "";
    } else {
      curValue += char;
    }
  }
  result.push(curValue.trim().replace(/^"|"$/g, ''));
  return result;
}
