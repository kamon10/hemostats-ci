
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  UserMinus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter,
  ShieldAlert,
  Shield,
  UserCheck,
  X,
  Save,
  RotateCcw
} from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Supervisor' | 'Agent';
  status: 'Active' | 'Pending' | 'Suspended';
  lastLogin: string;
  site: string;
}

const INITIAL_MOCK_USERS: UserAccount[] = [
  { id: '1', name: 'Dr. Kouassi Yao', email: 'k.yao@cntsci.ci', role: 'Admin', status: 'Active', lastLogin: 'Il y a 10 min', site: 'Direction Générale' },
  { id: '2', name: 'Mme. Amenan Rose', email: 'a.rose@cntsci.ci', role: 'Supervisor', status: 'Active', lastLogin: 'Hier, 14:30', site: 'CRTS Treichville' },
  { id: '3', name: 'M. Touré Bakary', email: 't.bakary@cntsci.ci', role: 'Agent', status: 'Active', lastLogin: 'Il y a 3h', site: 'CRTS Bouaké' },
  { id: '4', name: 'Dr. N\'Goran Paul', email: 'p.ngoran@cntsci.ci', role: 'Supervisor', status: 'Suspended', lastLogin: 'Il y a 15 jours', site: 'CRTS Korhogo' },
  { id: '5', name: 'Mlle. Koné Fatoumata', email: 'f.kone@cntsci.ci', role: 'Agent', status: 'Pending', lastLogin: 'Jamais', site: 'CRTS Daloa' },
  { id: '6', name: 'M. Koffi Sylvain', email: 's.koffi@cntsci.ci', role: 'Agent', status: 'Active', lastLogin: 'Ce matin, 08:15', site: 'CRTS San Pédro' },
];

interface Props {
  darkMode: boolean;
}

const AdminView: React.FC<Props> = ({ darkMode }) => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  
  // États pour le formulaire de création/édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState<Partial<UserAccount>>({
    name: '',
    email: '',
    role: 'Agent',
    site: '',
    status: 'Pending'
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.site.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole === 'ALL' || user.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [searchTerm, filterRole, users]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    pending: users.filter(u => u.status === 'Pending').length,
    suspended: users.filter(u => u.status === 'Suspended').length,
  }), [users]);

  // Actions
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'Agent', site: '', status: 'Pending' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleToggleStatus = (user: UserAccount) => {
    const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Mise à jour
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } as UserAccount : u));
    } else {
      // Création
      const newUser: UserAccount = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || '',
        email: formData.email || '',
        role: formData.role as any || 'Agent',
        site: formData.site || 'Non spécifié',
        status: formData.status as any || 'Pending',
        lastLogin: 'Jamais'
      };
      setUsers(prev => [newUser, ...prev]);
    }
    setIsModalOpen(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-500/20"><ShieldAlert size={10} /> {role}</span>;
      case 'Supervisor': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-500/20"><Shield size={10} /> {role}</span>;
      default: return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-500/20"><UserCheck size={10} /> {role}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[8px] font-bold uppercase tracking-widest"><CheckCircle2 size={10} /> {status}</span>;
      case 'Suspended': return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-bold uppercase tracking-widest"><XCircle size={10} /> {status}</span>;
      default: return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[8px] font-bold uppercase tracking-widest"><Clock size={10} /> {status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Utilisateurs', val: stats.total, icon: Users, color: 'text-slate-600', bg: 'bg-slate-500/10' },
          { label: 'Comptes Actifs', val: stats.active, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
          { label: 'En attente', val: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { label: 'Suspendus', val: stats.suspended, icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
        ].map((s, i) => (
          <div key={i} className={`p-6 rounded-[32px] border transition-all hover:scale-[1.02] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${s.bg} ${s.color}`}><s.icon size={20} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                <p className="text-2xl font-black tabular-nums">{s.val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Barre d'actions et filtres */}
      <div className={`p-8 rounded-[40px] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={16} className="text-red-600" />
              Répertoire des Utilisateurs
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gérez les permissions et surveillez les accès au portail national</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-700 focus-within:border-red-500/50' : 'bg-slate-50 border-slate-100 focus-within:border-red-500/30'}`}>
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-semibold w-48 xl:w-64"
              />
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <Filter size={14} className="text-slate-400" />
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
              >
                <option value="ALL">Tous les Rôles</option>
                <option value="Admin">Administrateur</option>
                <option value="Supervisor">Superviseur</option>
                <option value="Agent">Agent</option>
              </select>
            </div>

            <button 
              onClick={handleOpenAddModal}
              className="bg-red-600 text-white px-5 py-3 rounded-2xl flex items-center gap-3 hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-600/20"
            >
              <UserPlus size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Nouvel Utilisateur</span>
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Utilisateur</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Rôle & Site</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Statut Compte</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Dernière Connexion</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight group-hover:text-red-600 transition-colors">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      {getRoleBadge(user.role)}
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.site}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{user.lastLogin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(user)}
                        title="Modifier" 
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-all"
                      ><Edit3 size={16} /></button>
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        title={user.status === 'Suspended' ? "Réactiver" : "Suspendre"} 
                        className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${user.status === 'Suspended' ? 'text-green-500' : 'text-slate-400 hover:text-amber-500'}`}
                      >
                        {user.status === 'Suspended' ? <UserCheck size={16} /> : <UserMinus size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        title="Supprimer" 
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-all"
                      ><Trash2 size={16} /></button>
                      <button title="Plus" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Users size={40} className="mb-4" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">Aucun utilisateur trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affichage de {filteredUsers.length} sur {stats.total} collaborateurs</p>
           <div className="flex items-center gap-2">
             <button disabled className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest opacity-50">Précédent</button>
             <button disabled className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest opacity-50">Suivant</button>
           </div>
        </div>
      </div>

      {/* Modal de création/édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className={`relative w-full max-w-md rounded-[40px] border p-8 shadow-2xl animate-in zoom-in-95 duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600/10 text-red-600">
                  {editingUser ? <Edit3 size={20} /> : <UserPlus size={20} />}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">
                  {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nom Complet</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Dr. Kouassi Yao"
                  className={`w-full px-4 py-3 rounded-2xl border bg-transparent text-sm font-semibold outline-none transition-all ${darkMode ? 'border-slate-700 focus:border-red-500/50' : 'border-slate-100 focus:border-red-500/30'}`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Adresse Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="k.yao@cntsci.ci"
                  className={`w-full px-4 py-3 rounded-2xl border bg-transparent text-sm font-semibold outline-none transition-all ${darkMode ? 'border-slate-700 focus:border-red-500/50' : 'border-slate-100 focus:border-red-500/30'}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Rôle</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as any})}
                    className={`w-full px-4 py-3 rounded-2xl border bg-transparent text-xs font-black uppercase tracking-widest outline-none transition-all ${darkMode ? 'border-slate-700 focus:border-red-500/50' : 'border-slate-100 focus:border-red-500/30'}`}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Statut</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className={`w-full px-4 py-3 rounded-2xl border bg-transparent text-xs font-black uppercase tracking-widest outline-none transition-all ${darkMode ? 'border-slate-700 focus:border-red-500/50' : 'border-slate-100 focus:border-red-500/30'}`}
                  >
                    <option value="Active">Actif</option>
                    <option value="Pending">En attente</option>
                    <option value="Suspended">Suspendu</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Affectation (Site)</label>
                <input 
                  type="text" 
                  value={formData.site}
                  onChange={e => setFormData({...formData, site: e.target.value})}
                  placeholder="Ex: CRTS Treichville"
                  className={`w-full px-4 py-3 rounded-2xl border bg-transparent text-sm font-semibold outline-none transition-all ${darkMode ? 'border-slate-700 focus:border-red-500/50' : 'border-slate-100 focus:border-red-500/30'}`}
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all active:scale-95"
                >
                  <Save size={14} />
                  {editingUser ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
