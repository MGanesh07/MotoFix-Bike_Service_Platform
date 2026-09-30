import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, CalendarDays, Wrench, PackageSearch, History } from 'lucide-react';

export default function MechanicLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/mechanic', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Schedule', path: '/mechanic/schedule', icon: <CalendarDays className="w-5 h-5" /> },
    { name: 'Active Repairs', path: '/mechanic/active-repairs', icon: <Wrench className="w-5 h-5" /> },
    { name: 'Inventory', path: '/mechanic/inventory', icon: <PackageSearch className="w-5 h-5" /> },
    { name: 'History', path: '/mechanic/history', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-red-500/30">
      {/* Sidebar - Dark theme */}
      <aside className="w-72 bg-dark-900 border-r border-dark-800 flex-shrink-0 flex flex-col shadow-2xl relative z-20">
        <div className="h-20 flex items-center px-6 border-b border-dark-800 bg-dark-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-500/50 transform -rotate-2">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight uppercase leading-none">MotoFix</span>
              <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase mt-0.5">Workshop Pro</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-8 bg-dark-800/50 p-4 rounded-2xl border border-dark-800">
            <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/30 text-red-500 font-bold text-lg shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 font-medium truncate">{user?.specialty || 'Lead Mechanic'}</p>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Main Menu</div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = window.location.pathname === item.path || (item.path !== '/mechanic' && window.location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 group ${
                    isActive 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20 border border-red-500/50' 
                    : 'text-slate-400 hover:bg-dark-800 hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-red-400'} transition-colors`}>
                    {item.icon}
                  </div>
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-dark-800 bg-dark-900/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 border border-transparent transition-all group"
          >
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-500 transition-colors" />
            Secure Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm relative z-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {navItems.find(item => item.path === window.location.pathname)?.name || 'Workshop Console'}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">MotoFix Operations</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</p>
              <div className="flex items-center gap-2 mt-0.5 justify-end">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <p className="text-sm font-bold text-slate-700">Online</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
