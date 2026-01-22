
import React, { useMemo } from 'react';
import { DistributionRow, BloodGroup } from '../types';
import { BLOOD_GROUPS } from '../constants';

interface DistributionRowWithSite extends DistributionRow {
  site?: string;
  isSubtotal?: boolean;
}

interface Props {
  data: DistributionRowWithSite[];
  darkMode: boolean;
}

const DistributionTable: React.FC<Props> = ({ data, darkMode }) => {
  // Agrégation fine par Site + Structure + Type de Produit avec insertion de sous-totaux
  const rowsWithSubtotals = useMemo(() => {
    const map = new Map<string, DistributionRowWithSite>();

    // 1. Agrégation initiale
    data.forEach(row => {
      const facility = row.facility || 'NON SPÉCIFIÉ';
      const site = row.site || 'SITE INCONNU';
      const product = row.productType || 'PRODUIT INCONNU';
      const key = `${site}|${facility}|${product}`;
      
      if (!map.has(key)) {
        map.set(key, {
          site,
          facility,
          productType: product,
          counts: { ...row.counts },
          total: row.total
        });
      } else {
        const existing = map.get(key)!;
        BLOOD_GROUPS.forEach(group => {
          existing.counts[group] = (existing.counts[group] || 0) + (row.counts[group] || 0);
        });
        existing.total += row.total;
      }
    });

    // 2. Tri hiérarchique
    const sortedBase = Array.from(map.values()).sort((a, b) => {
      const siteComp = (a.site || '').localeCompare(b.site || '');
      if (siteComp !== 0) return siteComp;
      const facComp = (a.facility || '').localeCompare(b.facility || '');
      if (facComp !== 0) return facComp;
      return b.total - a.total;
    });

    // 3. Insertion des sous-totaux par site
    const finalRows: DistributionRowWithSite[] = [];
    let currentSite = '';
    let siteCounts: Record<BloodGroup, number> = BLOOD_GROUPS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<BloodGroup, number>);
    let siteTotal = 0;

    sortedBase.forEach((row, idx) => {
      const rowSite = row.site || '';
      
      // Si on change de site, on insère le sous-total du site précédent
      if (currentSite !== '' && currentSite !== rowSite) {
        finalRows.push({
          site: currentSite,
          facility: `SOUS-TOTAL ${currentSite}`,
          productType: 'TOTAL SITE',
          counts: { ...siteCounts },
          total: siteTotal,
          isSubtotal: true
        });
        // Reset pour le nouveau site
        siteTotal = 0;
        BLOOD_GROUPS.forEach(g => siteCounts[g] = 0);
      }

      currentSite = rowSite;
      siteTotal += row.total;
      BLOOD_GROUPS.forEach(g => {
        siteCounts[g] += (row.counts[g] || 0);
      });

      finalRows.push(row);
    });

    // Dernier sous-total
    if (currentSite !== '') {
      finalRows.push({
        site: currentSite,
        facility: `SOUS-TOTAL ${currentSite}`,
        productType: 'TOTAL SITE',
        counts: { ...siteCounts },
        total: siteTotal,
        isSubtotal: true
      });
    }

    return finalRows;
  }, [data]);

  const getProductStyle = (type: string, isSubtotal?: boolean) => {
    if (isSubtotal) return 'text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 font-black';
    const t = type.toUpperCase();
    if (t.includes('CGR')) return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800';
    if (t.includes('PLASMA')) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800';
    if (t.includes('PLAQUETTES')) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800';
    return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800';
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className={`${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-200/50 dark:border-slate-600/50">Site</th>
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-200/50 dark:border-slate-600/50">Structure (FS_NOM)</th>
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest">Type de Produit</th>
            {BLOOD_GROUPS.map(group => (
              <th key={group} className="px-2 py-4 text-[10px] font-black uppercase tracking-widest text-center">{group}</th>
            ))}
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-right bg-red-600/5 text-red-600">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rowsWithSubtotals.map((row, idx) => {
            const isSubtotal = row.isSubtotal;
            const showSite = !isSubtotal && (idx === 0 || rowsWithSubtotals[idx - 1].site !== row.site || rowsWithSubtotals[idx - 1].isSubtotal);
            const showFacility = !isSubtotal && (idx === 0 || rowsWithSubtotals[idx - 1].facility !== row.facility || showSite);
            
            return (
              <tr 
                key={idx} 
                className={`transition-colors group ${
                  isSubtotal 
                    ? (darkMode ? 'bg-slate-800/80 font-bold' : 'bg-slate-100/50 font-bold border-t-2 border-slate-200') 
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <td className={`px-4 py-4 text-[9px] font-black uppercase tracking-tighter border-r border-slate-100 dark:border-slate-800 align-top ${
                  isSubtotal 
                    ? 'text-transparent' 
                    : (showSite ? 'text-red-600 bg-red-50/10' : 'text-transparent pointer-events-none')
                }`}>
                  {row.site}
                </td>
                <td className={`px-4 py-4 text-[10px] uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 align-top max-w-[200px] truncate ${
                  isSubtotal 
                    ? 'font-black text-right text-slate-500' 
                    : (showFacility ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-transparent pointer-events-none')
                }`}>
                  {row.facility}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${getProductStyle(row.productType, isSubtotal)}`}>
                    {row.productType}
                  </span>
                </td>
                {BLOOD_GROUPS.map(group => (
                  <td key={group} className={`px-2 py-4 text-xs text-center tabular-nums ${
                    isSubtotal 
                      ? 'text-slate-900 dark:text-white font-black' 
                      : (row.counts[group] > 0 ? 'font-bold text-slate-700 dark:text-slate-200' : 'text-slate-200 dark:text-slate-700')
                  }`}>
                    {row.counts[group] || 0}
                  </td>
                ))}
                <td className={`px-4 py-4 text-xs font-black text-right tabular-nums border-l border-red-100/10 ${
                  isSubtotal 
                    ? 'bg-red-600 text-white text-sm' 
                    : 'bg-red-600/5 text-red-600'
                }`}>
                  {row.total}
                </td>
              </tr>
            );
          })}
          {rowsWithSubtotals.length === 0 && (
            <tr>
              <td colSpan={BLOOD_GROUPS.length + 4} className="px-4 py-12 text-center text-xs italic text-slate-400 uppercase tracking-[0.3em]">
                Aucun détail disponible pour cette sélection
              </td>
            </tr>
          )}
        </tbody>
        {rowsWithSubtotals.length > 0 && (
          <tfoot className="border-t-2 border-slate-200 dark:border-slate-700">
            <tr className={`${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'} font-black`}>
              <td colSpan={3} className="px-4 py-4 text-[10px] uppercase tracking-widest text-right">CUMUL GÉNÉRAL (SÉLECTION) :</td>
              {BLOOD_GROUPS.map(group => (
                <td key={group} className="px-2 py-4 text-xs text-center tabular-nums">
                  {rowsWithSubtotals.filter(r => !r.isSubtotal).reduce((sum, r) => sum + (r.counts[group] || 0), 0)}
                </td>
              ))}
              <td className="px-4 py-4 text-sm text-right tabular-nums text-red-600">
                {rowsWithSubtotals.filter(r => !r.isSubtotal).reduce((sum, r) => sum + r.total, 0)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default DistributionTable;
