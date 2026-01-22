
import React, { useState } from 'react';
import { Droplets, Lock, User, ChevronRight, ShieldCheck, AlertCircle, UserPlus, UserCheck, ArrowLeft } from 'lucide-react';

interface Props {
  onLogin: (username: string) => void;
  darkMode: boolean;
}

const Login: React.FC<Props> = ({ onLogin, darkMode }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulation de traitement
    setTimeout(() => {
      if (mode === 'login') {
        if (username.length >= 4 && password.length >= 4) {
          onLogin(username);
        } else {
          setError('Identifiant ou mot de passe trop court (min. 4 car.).');
          setLoading(false);
        }
      } else {
        // Mode Inscription
        if (!fullName || !username || !password || !confirmPassword) {
          setError('Veuillez remplir tous les champs.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères.');
          setLoading(false);
          return;
        }
        // Simulation de succès d'inscription
        onLogin(username);
      }
    }, 1500);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <div className={`w-full max-w-[460px] z-10 p-8 lg:p-12 rounded-[40px] border shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95 ${darkMode ? 'bg-slate-900/80 border-slate-800 shadow-black' : 'bg-white/90 border-slate-100 shadow-slate-200'}`}>
        <div className="flex flex-col items-center mb-10">
          <div className="bg-red-600 p-4 rounded-3xl shadow-2xl shadow-red-600/30 mb-6 animate-bounce-slow">
            <Droplets className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase mb-2">
            {mode === 'login' ? 'Connexion' : 'Inscription'} <span className="text-red-600">HÉMOSTATS CI</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] text-center">
            {mode === 'login' ? 'Accès sécurisé au portail de distribution' : 'Création de votre compte agent de santé'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nom Complet</label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus-within:border-red-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-red-500/30'}`}>
                <UserCheck size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Jean Dupont" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm font-semibold"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Identifiant</label>
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus-within:border-red-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-red-500/30'}`}>
              <User size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Ex: agent_01" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-semibold"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mot de passe</label>
            <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus-within:border-red-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-red-500/30'}`}>
              <Lock size={18} className="text-slate-400" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Confirmer Mot de passe</label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus-within:border-red-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-red-500/30'}`}>
                <ShieldCheck size={18} className="text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold animate-shake">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="uppercase tracking-widest text-xs">
                  {mode === 'login' ? 'Se Connecter' : 'Créer mon compte'}
                </span>
                {mode === 'login' ? <ChevronRight size={18} /> : <UserPlus size={18} />}
              </>
            )}
          </button>
        </form>

        <div className="mt-8">
          <button 
            onClick={toggleMode}
            className={`w-full py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {mode === 'login' ? (
              <>Vous n'avez pas de compte ? <span className="text-red-600">S'inscrire</span></>
            ) : (
              <><ArrowLeft size={14} /> Retour à la <span className="text-red-600">connexion</span></>
            )}
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={12} className="text-green-500" /> Authentification sécurisée HÉMOSTATS CI
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
