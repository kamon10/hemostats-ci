
import { DistributionData, BloodGroup, ProductType, SiteInfo, DistributionRow, MonthlyTrend } from './types';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'AB+', 'AB-' , 'B+' , 'B-', 'O+', 'O-'];
export const PRODUCT_TYPES: ProductType[] = [
  'CGR ADULTE',
  'CGR PEDIATRIQUE',
  'CGR NOURRISON',
  'CONCENTRE DE PLAQUETTES',
  'PLASMA A USAGE THERAPEUTIQUE'
];

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export const YEARS = ['2025', '2026', '2027', '2028'];

/**
 * Hiérarchie Officielle du CNTSCI
 * Un PRES supervise plusieurs Sites Techniques (CRTS/CDTS/SP)
 */
export const PRES_STRUCTURE: Record<string, string[]> = {
  "PRES ABIDJAN": [
    "01 CRTS TREICHVILLE", "09 CDTS BINGERVILLE", "02 SP YOPOUGON CHU", 
    "06 SP PORT BOUET", "04 SP ABOBO", "07 SP ANYAMA", 
    "05 SP CHU COCODY", "11 CDTS ABOISSO", "10 CDTS BONOUA", 
    "14 CDTS ADZOPE", "13 CDTS AGBOVILLE", "12 CDTS DABOU"
  ],
  "PRES BELIER": [
    "30 CRTS YAMOUSSOUKRO", "31 CDTS TOUMODI", "32 CDTS GAGNOA", 
    "36 CDTS DIVO", "26 CDTS BOUAFLE", "37 CDTS DIMBOKRO"
  ],
  "PRES GBEKE": ["33 CRTS BOUAKE"],
  "PRES PORO": ["34 CRTS KORHOGO", "35 CDTS FERKE"],
  "PRES INDENIE DJUABLIN": ["40 CRTS ABENGOUROU", "44 CDTS DAOUKRO", "43 CDTS BONGOUANOU"],
  "PRES GONTOUGO": ["41 CRTS BONDOUKOU", "42 CDTS BOUNA"],
  "PRES HAUT SASSANDRA": ["20 CRTS DALOA", "21 CDTS SEGUELA"],
  "PRES SAN-PEDRO": ["22 CRTS SAN-PEDRO"],
  "PRES TONPKI": ["23 CRTS MAN", "27 CDTS DUEKOUE"],
  "PRES KABADOUGOU": ["24 CRTS ODIENNE"]
};

/**
 * Détecte le PRES rattaché à un site donné.
 * Gère les codes (01, 23, etc.) et les noms de villes (Treichville, Man, etc.)
 */
export const GET_PRES_FOR_SITE = (siteName: string): string => {
  if (!siteName) return "HORS PRES";
  const normalizedInput = siteName.toUpperCase().trim();
  
  // 1. Extraction des codes numériques (ex: "23" dans "23 CRTS MAN")
  const codesInInput: string[] = normalizedInput.match(/\d+/g) || [];
  
  for (const [presName, sites] of Object.entries(PRES_STRUCTURE)) {
    for (const siteRef of sites) {
      const siteRefUpper = siteRef.toUpperCase();
      const refParts = siteRefUpper.split(' ');
      const refCode = refParts[0]; // Code (ex: 01, 23)
      
      // On cherche le mot significatif (souvent la ville, ex: "MAN" ou "TREICHVILLE")
      // On ignore "CRTS", "CDTS", "SP"
      const significantWords = refParts.filter(w => !['CRTS', 'CDTS', 'SP', 'CHU'].includes(w) && isNaN(parseInt(w)));
      
      // Match par code numérique exact
      if (codesInInput.includes(refCode) || (refCode.startsWith('0') && codesInInput.includes(refCode.substring(1)))) {
        return presName;
      }

      // Match par mot significatif (ex: "MAN")
      // Correction : >= 3 pour inclure "MAN" (3 lettres)
      for (const word of significantWords) {
        if (word.length >= 3 && normalizedInput.includes(word)) {
          return presName;
        }
      }
    }
  }
  
  return "HORS PRES / SIÈGE";
};

export const AVAILABLE_SITES: SiteInfo[] = [
  { id: 'treichville', name: '01 CRTS TREICHVILLE', region: 'Abidjan', facilities: [], coords: { x: 70, y: 85 } },
  { id: 'bouake', name: '33 CRTS BOUAKE', region: 'Gbêkê', facilities: [], coords: { x: 55, y: 45 } },
  { id: 'korhogo', name: '34 CRTS KORHOGO', region: 'Poro', facilities: [], coords: { x: 45, y: 15 } },
  { id: 'san-pedro', name: '22 CRTS SAN PEDRO', region: 'San-Pédro', facilities: [], coords: { x: 25, y: 88 } },
  { id: 'daloa', name: '20 CRTS DALOA', region: 'Haut-Sassandra', facilities: [], coords: { x: 35, y: 55 } },
  { id: 'yamoussoukro', name: '30 CRTS YAMOUSSOUKRO', region: 'Bélier', facilities: [], coords: { x: 50, y: 65 } },
  { id: 'man', name: '23 CRTS MAN', region: 'Tonpki', facilities: [], coords: { x: 15, y: 45 } }
];

export const INITIAL_DATA: DistributionData = {
  metadata: {
    date: '01/01/2025',
    month: 'JANVIER',
    site: 'CRTS TREICHVILLE',
    siteId: 'treichville'
  },
  dailySite: [],
  monthlySite: [],
  monthlyNational: [],
  annualTrend: []
};
