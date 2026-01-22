
export type BloodGroup = 'A+' | 'A-' | 'AB+' | 'AB-' | 'B+' | 'B-' | 'O+' | 'O-';

export type ProductType = 
  | 'CGR ADULTE' 
  | 'CGR PEDIATRIQUE' 
  | 'CGR NOURRISON' 
  | 'CONCENTRE DE PLAQUETTES' 
  | 'PLASMA A USAGE THERAPEUTIQUE'
  | string;

export interface DistributionRow {
  productType: string;
  facility?: string;
  counts: Record<BloodGroup, number>;
  total: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  cgr: number;
  plasma: number;
  plaquettes: number;
}

export interface SiteInfo {
  id: string;
  name: string;
  region: string;
  facilities?: string[];
  /** Coordonnées X/Y (0-100) pour le positionnement sur la carte SVG */
  coords: { x: number; y: number };
}

export interface DistributionData {
  dailySite: DistributionRow[];
  monthlySite: DistributionRow[];
  monthlyNational: DistributionRow[];
  annualTrend: MonthlyTrend[]; // Nouvelle propriété pour la vue annuelle
  metadata: {
    date: string;
    month: string;
    site: string;
    siteId: string;
  };
}

export interface Insight {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
}