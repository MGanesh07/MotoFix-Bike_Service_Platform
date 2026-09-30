import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bike as BikeIcon, Plus, Info, Wrench, Calendar, X, History, FileText, CheckCircle2 } from 'lucide-react';

export default function MyBikes() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Bike Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ brand: '', model: '', registrationNumber: '', year: new Date().getFullYear() });

  // Service History Modal
  const [historyBike, setHistoryBike] = useState(null);
  const [bikeHistory, setBikeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const { data } = await api.get('/bikes');
      setBikes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBike = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bikes', formData);
      setShowModal(false);
      setFormData({ brand: '', model: '', registrationNumber: '', year: new Date().getFullYear() });
      fetchBikes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add bike');
    }
  };

  const viewHistory = async (bike) => {
    setHistoryBike(bike);
    setHistoryLoading(true);
    try {
      const { data } = await api.get(`/bookings?bikeId=${bike._id}`);
      setBikeHistory(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Garage</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your registered motorcycles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 hover:shadow transition-all active:scale-95 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4"/> Add New Bike
        </button>
      </div>

      {bikes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-sm min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <BikeIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">Your garage is empty</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">Register your first motorcycle to start booking services and tracking maintenance history.</p>
          <button onClick={() => setShowModal(true)} className="bg-white border border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-600 px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 flex items-center gap-2 text-sm shadow-sm">
            <Plus className="w-4 h-4"/> Register Bike
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bikes.map(bike => (
            <div key={bike._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
              <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-3 border border-slate-200">
                    {bike.brand}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{bike.model}</h3>
                  <p className="text-sm font-mono text-slate-500">{bike.registrationNumber}</p>
                </div>
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm">
                  <BikeIcon className="w-5 h-5" />
                </div>
              </div>
              
              <div className="p-6 pt-4 bg-slate-50/50 flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5"/> Services
                  </p>
                  <p className="font-semibold text-slate-900">{bike.totalServices || 0}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5"/> Model Year
                  </p>
                  <p className="font-semibold text-slate-900">{bike.year || 'N/A'}</p>
                </div>
              </div>
              
              <div className="p-4 bg-white border-t border-slate-100">
                <button onClick={() => viewHistory(bike)} className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-teal-600 hover:border-teal-200 rounded-xl text-sm font-medium transition-colors">
                  View Service History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bike Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Register New Bike</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddBike} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-shadow" placeholder="e.g. Yamaha, Honda" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Model</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-shadow" placeholder="e.g. R15 V4" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Number</label>
                <input required type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-shadow" placeholder="e.g. TN 72 AB 1234" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Manufacturing Year</label>
                <input required type="number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-shadow" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
              </div>
              
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-sm transition-colors active:scale-95">Save Bike</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service History Modal */}
      {historyBike && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <History className="text-teal-600 w-6 h-6"/> Service History
                </h3>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{historyBike.brand} {historyBike.model}</span> &bull; <span className="font-mono">{historyBike.registrationNumber}</span> &bull; {historyBike.year || 'N/A'}
                </p>
              </div>
              <button onClick={() => setHistoryBike(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
              {historyLoading ? (
                <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : bikeHistory.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
                  <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No service records found for this bike.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bikeHistory.map(record => (
                    <div key={record._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-200 text-slate-700">{record.bookingCode}</span>
                          <span className="text-sm font-semibold text-slate-900">{record.date} <span className="text-slate-400 font-normal">at</span> {record.startTime}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                          ${record.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-teal-50 text-teal-700 border-teal-200'}
                        `}>
                          {record.status}
                        </span>
                      </div>
                      
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Service Type</p>
                            <p className="font-semibold text-slate-800 text-sm">{record.serviceType}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Problem Described</p>
                            <p className="text-sm text-slate-700">{record.problemDescription}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {record.bill ? (
                            <>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Parts & Labour</p>
                                <div className="text-sm text-slate-700">
                                  {record.bill.parts?.length > 0 ? (
                                    <ul className="list-disc list-inside mb-1 text-xs">
                                      {record.bill.parts.map((p, i) => <li key={i}>{p.name} (x{p.quantity})</li>)}
                                    </ul>
                                  ) : <p className="text-xs italic text-slate-500 mb-1">No parts used</p>}
                                  <p className="text-xs font-medium">Labour: ₹{record.bill.laborCharges}</p>
                                </div>
                              </div>
                              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bill Amount</span>
                                <span className="font-bold text-teal-600">₹{record.bill.totalAmount}</span>
                              </div>
                            </>
                          ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg p-4 text-center">
                              <p className="text-xs text-slate-400 font-medium">Bill details will appear here once the service is completed.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
