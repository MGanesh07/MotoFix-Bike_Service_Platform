import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MechanicDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/mechanic/dashboard');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border-b-4 border-b-dark-900 shadow-sm flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Today's Jobs</p>
            <p className="text-4xl font-black text-slate-900 mt-1">{stats?.stats?.totalToday || 0}</p>
          </div>
          <div className="w-14 h-14 bg-dark-900 text-white rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-2xl border-b-4 border-b-red-900 shadow-[0_8px_16px_rgba(220,38,38,0.2)] flex items-center justify-between group hover:-translate-y-1 transition-all">
          <div>
            <p className="text-[11px] font-black text-red-200 uppercase tracking-widest">Active / Working</p>
            <p className="text-4xl font-black text-white mt-1">{stats?.stats?.activeJobsCount || 0}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform backdrop-blur-sm">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-b-4 border-b-amber-500 shadow-sm flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-1">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
            <p className="text-4xl font-black text-slate-900 mt-1">{stats?.stats?.pending || 0}</p>
          </div>
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-dark-900 p-6 rounded-2xl border-b-4 border-b-green-500 shadow-sm flex items-center justify-between group hover:-translate-y-1 transition-all">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-4xl font-black text-white mt-1">{stats?.stats?.completed || 0}</p>
          </div>
          <div className="w-14 h-14 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-dark-900 px-6 py-4 rounded-t-2xl">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Today's Schedule</h2>
            <button onClick={() => navigate('/mechanic/schedule')} className="text-red-400 text-xs font-bold uppercase tracking-wider hover:text-red-300">View Full Schedule</button>
          </div>
          
          <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm overflow-hidden mt-0">
            {stats?.todaysBookings?.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Clock className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium">No jobs scheduled for today.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats?.todaysBookings?.map(booking => (
                  <li key={booking._id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-20 text-center bg-slate-100 p-3 rounded-xl group-hover:bg-red-50 transition-colors">
                        <span className="block text-lg font-black text-slate-900 group-hover:text-red-600">{booking.startTime.split(' ')[0]}</span>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">{booking.startTime.split(' ')[1]}</span>
                      </div>
                      <div>
                        <p className="font-black text-lg text-slate-900 flex items-center gap-3">
                          {booking.bikeId?.brand} {booking.bikeId?.model} 
                          <span className="text-[10px] text-red-600 font-bold tracking-widest px-2 py-1 bg-red-50 rounded-md border border-red-100">
                            {booking.bikeId?.registrationNumber}
                          </span>
                        </p>
                        <p className="text-sm font-medium text-slate-500 mt-1">{booking.serviceType} <span className="mx-2">•</span> {booking.customerId?.name}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest
                        ${booking.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          ['Bike Received', 'Inspection', 'Repairing', 'Quality Check'].includes(booking.status) ? 'bg-red-600 text-white shadow-sm' : 
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }
                      `}>
                        {booking.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Alerts & Inventory */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-amber-500 px-6 py-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-white"/> 
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Low Stock Alerts</h2>
            </div>
            <div className="p-6">
              {stats?.lowStockItems?.length === 0 ? (
                <p className="text-sm text-slate-500 font-medium text-center py-4">All inventory items are sufficiently stocked.</p>
              ) : (
                <ul className="space-y-4">
                  {stats?.lowStockItems?.map(item => (
                    <li key={item._id} className="flex justify-between items-center p-4 bg-white rounded-xl border-l-4 border-l-amber-500 border border-slate-100 shadow-sm">
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.partNumber}</p>
                      </div>
                      <div className="text-right bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                        <p className="text-sm font-black text-amber-600">{item.quantity} <span className="text-[10px] uppercase text-amber-500">left</span></p>
                        <p className="text-[9px] font-bold text-amber-400/80 uppercase">Min {item.minQuantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
