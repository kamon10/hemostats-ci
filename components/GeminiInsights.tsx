
import React, { useState, useEffect, useCallback } from 'react';
import { BrainCircuit, Loader2, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { generateInsights } from '../services/geminiService';
import { DistributionData, Insight } from '../types';

interface Props {
  data: DistributionData;
  currentView: string;
  darkMode: boolean;
}

const GeminiInsights: React.FC<Props> = ({ data, currentView, darkMode }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!data || (data.monthlySite?.length === 0 && data.dailySite?.length === 0)) return;
    
    setLoading(true);
    try {
      const results = await generateInsights(data, currentView);
      setInsights(results);
    } catch (err) {
      console.error("Failed to fetch insights", err);
    } finally {
      setLoading(false);
    }
  }, [data, currentView]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div className={`p-6 rounded-[32px] border transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <BrainCircuit className="text-purple-500" size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest">Assistant Analytique</h3>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} disabled:opacity-50`}
        >
          {loading ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <RefreshCw size={18} className="text-slate-400" />}
        </button>
      </div>

      <div className="space-y-4 min-h-[200px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <Loader2 size={32} className="animate-spin text-purple-500" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Analyse {currentView} en cours...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
            {insights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border-l-4 transition-all hover:translate-x-1 ${
                  insight.type === 'warning' 
                    ? 'bg-amber-500/5 border-amber-500' 
                    : insight.type === 'success'
                    ? 'bg-green-500/5 border-green-500'
                    : 'bg-blue-500/5 border-blue-500'
                }`}
              >
                <h4 className="text-xs font-black uppercase tracking-tight mb-1 flex items-center gap-2">
                  <Sparkles size={12} className="text-purple-500" />
                  {insight.title}
                </h4>
                <p className="text-[11px] leading-relaxed font-medium opacity-80">{insight.content}</p>
              </div>
            ))}
            
            {insights.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                <MessageSquare size={32} className="mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Prêt pour analyser vos données de distribution</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-center">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">IA de confiance - Flux CNTSCI</span>
      </div>
    </div>
  );
};

export default GeminiInsights;
