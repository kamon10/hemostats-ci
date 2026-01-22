
import React, { useState, useEffect, useCallback } from 'react';
import { BrainCircuit, Loader2, Sparkles, MessageSquare } from 'lucide-react';
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
    // Évite les appels si les données sont vides
    if (!data || (data.monthlySite.length === 0 && data.dailySite.length === 0)) return;
    
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
    <div className={`p-6 rounded-[32px] border transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <BrainCircuit className="text-purple-500" size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest">Analyse IA Gemini</h3>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} disabled:opacity-50`}
          title="Relancer l'analyse"
        >
          {loading ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <RefreshIcon size={18} darkMode={darkMode} />}
        </button>
      </div>

      <div className="space-y-4 min-h-[200px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 animate-in fade-in duration-300">
            <div className="relative">
              <Loader2 size={40} className="animate-spin text-purple-500" />
              <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Intelligence Artificielle</p>
              <p className="text-xs font-bold animate-pulse text-slate-500">Génération du rapport...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
            {insights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border-l-4 transition-all hover:translate-x-1 ${
                  insight.type === 'warning' 
                    ? 'bg-amber-500/5 dark:bg-amber-900/10 border-amber-500 text-amber-900 dark:text-amber-200' 
                    : insight.type === 'success'
                    ? 'bg-green-500/5 dark:bg-green-900/10 border-green-500 text-green-900 dark:text-green-200'
                    : 'bg-blue-500/5 dark:bg-blue-900/10 border-blue-500 text-blue-900 dark:text-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 opacity-50">
                    <MessageSquare size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight mb-1">{insight.title}</h4>
                    <p className="text-[11px] leading-relaxed font-medium opacity-80">{insight.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {insights.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30">
                <Sparkles size={32} className="mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Aucun insight généré</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && insights.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">IA de confiance - CNTSCI</span>
          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
        </div>
      )}
    </div>
  );
};

// Petit composant interne pour l'icône de rafraîchissement
const RefreshIcon = ({ size, darkMode }: { size: number, darkMode: boolean }) => (
  <div className="relative">
    <Sparkles size={size} className="text-amber-500" />
  </div>
);

export default GeminiInsights;
