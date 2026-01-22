
import React, { useState, useEffect } from 'react';
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

  const fetchInsights = async () => {
    setLoading(true);
    const results = await generateInsights(data, currentView);
    setInsights(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, [currentView]);

  return (
    <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-purple-500" size={22} />
          <h3 className="text-lg font-bold uppercase tracking-tight">Analyse IA Gemini</h3>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Rafraîchir l'analyse"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-amber-500" />}
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={32} className="animate-spin mb-4 text-purple-500" />
            <p className="text-sm font-medium animate-pulse">Gemini analyse les tendances...</p>
          </div>
        ) : (
          insights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border-l-4 transition-all hover:scale-[1.02] ${
                insight.type === 'warning' 
                  ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500 text-amber-900 dark:text-amber-200' 
                  : insight.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-500 text-green-900 dark:text-green-200'
                  : 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 text-blue-900 dark:text-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <MessageSquare size={16} className="opacity-70" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1">{insight.title}</h4>
                  <p className="text-xs leading-relaxed opacity-90">{insight.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && insights.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm italic">
          Cliquez sur l'éclair pour lancer une analyse.
        </div>
      )}
    </div>
  );
};

export default GeminiInsights;
