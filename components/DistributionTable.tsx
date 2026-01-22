
import React from 'react';
import { DistributionRow, BloodGroup } from '../types';
import { BLOOD_GROUPS } from '../constants';

interface Props {
  data: DistributionRow[];
  darkMode: boolean;
}

const DistributionTable: React.FC<Props> = ({ data, darkMode }) => {
  return (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-tl-xl">Structure</th>
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em]">Produit</th>
            {BLOOD_GROUPS.map(group => (
              <th key={group} className="px-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-center">{group}</th>
            ))}
            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-right rounded-tr-xl">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <td className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px]">
                {row.facility || 'Secteur'}
              </td>
              <td className="px-4 py-4 text-xs font-bold whitespace-nowrap uppercase tracking-tighter">
                {row.productType}
              </td>
              {BLOOD_GROUPS.map(group => (
                <td key={group} className={`px-2 py-4 text-xs text-center tabular-nums ${row.counts[group] > 0 ? 'font-bold text-red-500' : 'text-slate-300 dark:text-slate-600'}`}>
                  {row.counts[group] || 0}
                </td>
              ))}
              <td className="px-4 py-4 text-xs font-black text-right tabular-nums bg-slate-50/50 dark:bg-slate-800/50">
                {row.total}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-10 text-center text-xs italic text-slate-400 uppercase tracking-[0.3em]">Aucune distribution enregistrée</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DistributionTable;
