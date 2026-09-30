import { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, Search, Calendar, Filter, FileText, CheckCircle, Clock, Info, ChevronRight, X } from 'lucide-react';

export default function MechanicHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [uniqueServiceTypes, setUniqueServiceTypes] = useState([]);

  // Detail Modal
  const [selectedService, setSelectedService] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Assuming getBookings returns all mechanic bookings
      const { data } = await api.get('/bookings');
      
      // Filter strictly completed
      const completed = data.filter(b => b.status === 'Completed');
      
      // Sort by completion timestamp (newest first)
      completed.sort((a, b) => {
        const timeA = a.completedAt || a.actualEndTime || a.updatedAt || a.createdAt;
        const timeB = b.completedAt || b.actualEndTime || b.updatedAt || b.createdAt;
        return new Date(timeB) - new Date(timeA);
      });
      
      setHistory(completed);
      setFilteredHistory(completed);
      
      // Extract unique service types for filter dropdown
      const types = [...new Set(completed.map(b => b.serviceType))];
      setUniqueServiceTypes(types);
      
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = history;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.bookingCode.toLowerCase().includes(lower) ||
        b.customerId?.name?.toLowerCase().includes(lower) ||
        b.bikeId?.registrationNumber?.toLowerCase().includes(lower) ||
        b.bikeId?.brand?.toLowerCase().includes(lower) ||
        b.bikeId?.model?.toLowerCase().includes(lower)
      );
    }

    if (dateFilter) {
      result = result.filter(b => b.date === dateFilter);
    }

    if (serviceTypeFilter) {
      result = result.filter(b => b.serviceType === serviceTypeFilter);
    }

    setFilteredHistory(result);
  }, [searchTerm, dateFilter, serviceTypeFilter, history]);

  const openFullDetails = async (service) => {
    setSelectedService(service);
    setLoadingDetails(true);
    try {
      const { data } = await api.get(`/bookings/${service._id}`);
      setDetailData(data);
    } catch (err) {
      console.error('Failed to fetch detailed data', err);
      alert('Could not load full service details.');
      setSelectedService(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getTimelineSteps = (booking) => {
    const steps = [
      { label: 'Booking Confirmed', status: 'Confirmed' },
      { label: 'Bike Received', status: 'Bike Received' },
      { label: 'Inspection', status: 'Inspection' },
      { label: 'Repairing', status: 'Repairing' },
      { label: 'Quality Check', status: 'Quality Check' },
      { label: 'Completed', status: 'Completed' }
    ];

    return steps.map(step => {
      const historyItem = booking?.statusHistory?.find(h => h.status === step.status);
      return {
        label: step.label,
        completed: !!historyItem,
        time: historyItem ? new Date(historyItem.updatedAt).toLocaleString() : null
      };
    });
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <History className="text-slate-600 w-7 h-7" /> Service History
        </h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search code, name, bike..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-slate-500 focus:border-slate-500 w-full sm:w-auto"
            />
          </div>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-sm focus:ring-slate-500 focus:border-slate-500 appearance-none bg-white"
            >
              <option value="">All Services</option>
              {uniqueServiceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          {(searchTerm || dateFilter || serviceTypeFilter) && (
            <button 
              onClick={() => { setSearchTerm(''); setDateFilter(''); setServiceTypeFilter(''); }}
              className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm flex flex-col items-center">
          <History className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No History Found</h3>
          <p>No completed services match your current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Booking Info</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Bike</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4">Bill Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map(job => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{job.bookingCode}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {job.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{job.customerId?.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{job.customerId?.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{job.bikeId?.brand} {job.bikeId?.model}</p>
                      <p className="text-slate-500 font-mono text-xs mt-0.5">{job.bikeId?.registrationNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-medium">{job.date} ({job.day})</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {job.startTime} - {job.completedAt ? new Date(job.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (job.actualEndTime ? new Date(job.actualEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown')}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {job.bill ? `₹${job.bill.totalAmount?.toFixed(0)}` : <span className="text-slate-400 italic font-normal">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openFullDetails(job)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5"/> View Full Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL SERVICE DETAILS MODAL */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8 relative flex flex-col max-h-[90vh]">
            {loadingDetails ? (
              <div className="p-12 flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : detailData && (
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-500" /> Full Service Details
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">{detailData.booking.bookingCode}</p>
                  </div>
                  <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-white">
                  
                  {/* Grid for Sections 1 & 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SECTION 1 */}
                    <div className="border border-slate-200 rounded-xl p-5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Section 1 — Customer Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-medium text-slate-900">{detailData.booking.customerId?.name}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-900">{detailData.booking.customerId?.phone}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium text-slate-900">{detailData.booking.customerId?.email}</span></div>
                      </div>
                    </div>
                    
                    {/* SECTION 2 */}
                    <div className="border border-slate-200 rounded-xl p-5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Section 2 — Bike Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Brand</span><span className="font-medium text-slate-900">{detailData.booking.bikeId?.brand}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Model</span><span className="font-medium text-slate-900">{detailData.booking.bikeId?.model}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Reg. Number</span><span className="font-mono font-medium text-slate-900">{detailData.booking.bikeId?.registrationNumber}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Year</span><span className="font-medium text-slate-900">{detailData.booking.bikeId?.year || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3 */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Section 3 — Service Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><p className="text-slate-500 text-xs mb-1">Service Type</p><p className="font-medium text-slate-900">{detailData.booking.serviceType}</p></div>
                      <div><p className="text-slate-500 text-xs mb-1">Service Date</p><p className="font-medium text-slate-900">{detailData.booking.date} ({detailData.booking.day})</p></div>
                      <div><p className="text-slate-500 text-xs mb-1">Start Time</p><p className="font-medium text-slate-900">{detailData.booking.actualStartTime ? new Date(detailData.booking.actualStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : detailData.booking.startTime}</p></div>
                      <div><p className="text-slate-500 text-xs mb-1">Completion Time</p><p className="font-medium text-slate-900">{detailData.booking.completedAt ? new Date(detailData.booking.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (detailData.booking.actualEndTime ? new Date(detailData.booking.actualEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A')}</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="md:col-span-2"><p className="text-slate-500 text-xs mb-1">Problem Description</p><p className="italic text-slate-700 bg-white p-2 rounded border border-slate-100">"{detailData.booking.problemDescription}"</p></div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Mechanic & Status</p>
                        <p className="font-medium text-slate-900">{detailData.booking.mechanicId?.name}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold uppercase"><CheckCircle className="w-3 h-3"/> {detailData.booking.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4 */}
                  <div className="border border-slate-200 rounded-xl p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">Section 4 — Service Timeline</h4>
                    <div className="relative flex justify-between">
                      <div className="absolute left-0 top-3 w-full h-0.5 bg-slate-200 -z-10"></div>
                      {getTimelineSteps(detailData.booking).map((step, index) => (
                        <div key={index} className="flex flex-col items-center w-24 text-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${step.completed ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'} shadow-sm`}>
                            {step.completed ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</span>
                          {step.completed && <span className="text-[9px] text-slate-500 mt-1">{step.time}</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 5 */}
                  <div className="border border-slate-200 rounded-xl p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Section 5 — Parts Used</h4>
                    {detailData.bill?.parts && detailData.bill.parts.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                          <tr>
                            <th className="px-3 py-2 text-left">Product / Part</th>
                            <th className="px-3 py-2 text-center">Qty</th>
                            <th className="px-3 py-2 text-right">Unit Price</th>
                            <th className="px-3 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {detailData.bill.parts.map((p, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium text-slate-800">{p.name}</td>
                              <td className="px-3 py-2 text-center text-slate-600">{p.quantity}</td>
                              <td className="px-3 py-2 text-right text-slate-600">₹{p.unitPrice?.toFixed(2) || 0}</td>
                              <td className="px-3 py-2 text-right font-medium text-slate-900">₹{p.totalPrice?.toFixed(2) || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No parts were used for this service.</p>
                    )}
                  </div>

                  {/* SECTION 6 */}
                  <div className="border border-slate-200 rounded-xl p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Section 6 — Additional Repairs</h4>
                    {detailData.additionalRepairs && detailData.additionalRepairs.length > 0 ? (
                      <div className="space-y-3">
                        {detailData.additionalRepairs.map((ar, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{ar.description}</p>
                              <p className="text-xs text-slate-500 mt-1">Est. Cost: <span className="font-medium text-slate-700">₹{ar.estimatedCost}</span></p>
                            </div>
                            <div>
                              <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${ar.status === 'approved' ? 'bg-green-100 text-green-700' : ar.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {ar.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No additional repairs requested or approved.</p>
                    )}
                  </div>

                  {/* Grid for Sections 7 & 8 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SECTION 7 */}
                    <div className="border border-slate-200 rounded-xl p-5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Section 7 — Labour</h4>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">Labour Charge</span>
                        <span className="text-lg font-bold text-slate-900">₹{detailData.bill ? detailData.bill.laborCharges?.toFixed(2) : 'N/A'}</span>
                      </div>
                    </div>

                    {/* SECTION 8 */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-slate-900 text-white shadow-inner">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Section 8 — Bill Summary</h4>
                      {detailData.bill ? (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-slate-300"><span>Parts Subtotal</span><span>₹{(detailData.bill.parts?.reduce((sum, p) => sum + p.totalPrice, 0))?.toFixed(2) || '0.00'}</span></div>
                          <div className="flex justify-between text-slate-300"><span>Labour (Incl. Add. Repairs)</span><span>₹{detailData.bill.laborCharges?.toFixed(2)}</span></div>
                          <div className="flex justify-between text-slate-300"><span>Tax ({detailData.bill.taxRate}%)</span><span>₹{detailData.bill.taxAmount?.toFixed(2)}</span></div>
                          <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                            <span className="text-base font-bold">Grand Total</span>
                            <span className="text-xl font-bold text-green-400">₹{detailData.bill.totalAmount?.toFixed(2)}</span>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                            <span className="text-slate-400 uppercase text-xs font-bold">Payment Status</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${detailData.bill.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                              {detailData.bill.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 italic">Bill not generated yet.</div>
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
