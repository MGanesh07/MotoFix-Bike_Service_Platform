import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, Check, Info, CheckCircle2 } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notif of unread) {
      await markAsRead(notif._id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Notifications {unreadCount > 0 && <span className="bg-teal-600 text-white text-xs py-0.5 px-2 rounded-full">{unreadCount} new</span>}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Stay updated on your service progress and account activity</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-sm min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">You're all caught up!</h3>
          <p className="text-sm text-slate-500">No new notifications at this time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <div 
                key={notif._id} 
                className={`p-6 transition-colors flex gap-5 ${notif.read ? 'bg-white hover:bg-slate-50/50' : 'bg-teal-50/30 hover:bg-teal-50/50'}`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${notif.read ? 'bg-white border-slate-200 text-slate-400' : 'bg-teal-600 border-teal-600 text-white'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h4>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md ml-4 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                    {notif.message}
                  </p>
                  
                  {!notif.read && (
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1.5 rounded-lg transition-colors border border-teal-100 w-max"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
