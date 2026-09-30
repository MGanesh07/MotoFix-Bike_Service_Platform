import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Wrench, Clock, FileText, CheckCircle, AlertTriangle, Plus, Trash2, Calendar, Phone } from 'lucide-react';

export default function ActiveRepairs() {
  const [jobs, setJobs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Extension Modal
  const [extendingJob, setExtendingJob] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [conflictWarning, setConflictWarning] = useState(null);
  
  // Bill Modal
  const [billingJob, setBillingJob] = useState(null);
  const [laborCharge, setLaborCharge] = useState(500);
  const [selectedParts, setSelectedParts] = useState([]); // { item, quantity }
  const [additionalRepairs, setAdditionalRepairs] = useState([]);

  // Complete Work Modal
  const [completingJob, setCompletingJob] = useState(null);

  useEffect(() => {
    fetchActiveJobs();
    fetchInventory();
  }, []);

  const fetchActiveJobs = async () => {
    try {
      const { data } = await api.get('/bookings');
      // Filter for active/today jobs (exclude completed if bill is already generated)
      const active = data.filter(b => !['Cancelled', 'Rejected'].includes(b.status) && !(b.status === 'Completed' && b.bill));
      setJobs(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory');
      setInventory(data);
    } catch (err) {
      console.error('Could not fetch inventory', err);
    }
  };

  const fetchAdditionalRepairs = async (jobId) => {
    try {
      const { data } = await api.get(`/bookings/${jobId}`);
      if (data.additionalRepairs) {
        setAdditionalRepairs(data.additionalRepairs.filter(ar => ar.status === 'approved'));
      }
    } catch (err) {
      console.error('Could not fetch additional repairs', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/mechanic/bookings/${id}/status`, { status: newStatus });
      fetchActiveJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleExtend = async (force = false) => {
    if (!newDate || !newTime) {
      alert('Please select both date and time.');
      return;
    }
    
    // Validate past dates/times
    const selectedDateTime = new Date(`${newDate}T${newTime}`);
    if (selectedDateTime <= new Date()) {
      alert('Extension time must be in the future.');
      return;
    }

    const formattedTime = `${newDate} ${selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    try {
      await api.put(`/mechanic/bookings/${extendingJob._id}/extend`, { 
        newEstimatedTime: formattedTime,
        reason: 'Technical delay in repair',
        force
      });
      setExtendingJob(null);
      setConflictWarning(null);
      fetchActiveJobs();
      alert('Extension saved successfully.');
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictWarning(err.response.data);
      } else {
        alert(err.response?.data?.message || 'Extension failed');
      }
    }
  };

  const handleAddPart = (itemId) => {
    if (!itemId) return;
    const item = inventory.find(i => i._id === itemId);
    if (!item) return;

    if (item.quantity <= 0) {
      alert('This item is out of stock!');
      return;
    }

    const existing = selectedParts.find(p => p.item._id === itemId);
    if (existing) {
      if (existing.quantity >= item.quantity) {
        alert(`Cannot add more. Only ${item.quantity} in stock.`);
        return;
      }
      setSelectedParts(selectedParts.map(p => p.item._id === itemId ? { ...p, quantity: p.quantity + 1 } : p));
    } else {
      setSelectedParts([...selectedParts, { item, quantity: 1 }]);
    }
  };

  const updatePartQuantity = (itemId, qty) => {
    const item = inventory.find(i => i._id === itemId);
    if (qty > item.quantity) {
      alert(`Only ${item.quantity} units available.`);
      return;
    }
    if (qty < 1) {
      setSelectedParts(selectedParts.filter(p => p.item._id !== itemId));
      return;
    }
    setSelectedParts(selectedParts.map(p => p.item._id === itemId ? { ...p, quantity: qty } : p));
  };

  const handleGenerateBill = async () => {
    try {
      const partsUsed = selectedParts.map(p => ({
        inventoryItemId: p.item._id,
        quantity: p.quantity
      }));

      await api.post('/bills', {
        bookingId: billingJob._id,
        laborCharges: laborCharge,
        partsUsed
      });
      
      alert('Bill generated successfully. You can now Complete the service.');
      setBillingJob(null);
      fetchActiveJobs();
      fetchInventory(); // refresh stock
    } catch (err) {
      alert(err.response?.data?.message || 'Billing failed');
    }
  };

  const confirmCompleteService = async () => {
    try {
      await updateStatus(completingJob._id, 'Completed');
      setCompletingJob(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete service');
    }
  };

  const calculatePartsTotal = () => {
    return selectedParts.reduce((total, p) => total + (p.item.unitPrice * p.quantity), 0);
  };

  const getSubtotal = () => calculatePartsTotal() + Number(laborCharge || 0);
  const getTax = () => getSubtotal() * 0.18;
  const getGrandTotal = () => getSubtotal() + getTax();

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Wrench className="text-red-600 w-6 h-6" /> Active Repairs
      </h2>

      {jobs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm flex flex-col items-center">
          <CheckCircle className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
          <p>There are no active repair jobs assigned to you right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map(job => (
            <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{job.bookingCode}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                      {job.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">{job.bikeId?.brand} {job.bikeId?.model}</h3>
                  <p className="text-sm font-mono font-medium text-slate-600 bg-white border border-slate-200 inline-block px-2 py-0.5 rounded mt-1">{job.bikeId?.registrationNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Customer</p>
                  <p className="text-sm font-medium text-slate-900">{job.customerId?.name}</p>
                  <p className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-1"><Phone className="w-3 h-3"/> {job.customerId?.phone}</p>
                </div>
              </div>

              <div className="p-5 flex-1 bg-white">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Service Type</p>
                    <p className="text-sm font-semibold text-slate-800">{job.serviceType}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Est. Completion</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {job.estimatedCompletionTime || 'Pending'}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 italic bg-slate-50 p-3 rounded-lg border-l-2 border-red-500">"{job.problemDescription}"</p>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                {job.status === 'Confirmed' ? (
                  <button 
                    onClick={() => updateStatus(job._id, 'Bike Received')}
                    className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    Mark as Bike Received
                  </button>
                ) : job.status === 'Completed' ? (
                  <button 
                    onClick={() => { setBillingJob(job); setSelectedParts([]); setLaborCharge(500); fetchAdditionalRepairs(job._id); }}
                    className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileText className="w-5 h-5"/> Generate Final Bill
                  </button>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button 
                      onClick={() => setCompletingJob(job)}
                      className="py-2.5 px-3 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4"/> Complete Work
                    </button>
                    <button 
                      onClick={() => { 
                        setExtendingJob(job); 
                        setNewDate('');
                        setNewTime('');
                        setConflictWarning(null);
                      }}
                      className="py-2.5 px-3 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-4 h-4"/> Extend Time
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Work Confirmation Modal */}
      {completingJob && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600"/> Complete Service?
            </h3>
            <p className="text-slate-600 mb-6">Are you sure the repair work for <strong className="text-slate-900">{completingJob.bikeId?.brand} {completingJob.bikeId?.model}</strong> (Booking: <strong>{completingJob.bookingCode}</strong>) has been completed?</p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCompletingJob(null)} 
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmCompleteService} 
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-sm"
              >
                Complete Work
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Modal */}
      {extendingJob && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600"/> Extend Service Time
            </h3>
            <p className="text-sm text-slate-600 mb-6">Select a new date and time for service completion.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>

            {conflictWarning && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <div className="flex items-center gap-2 mb-2 font-bold text-amber-900">
                  <AlertTriangle className="w-5 h-5" /> Schedule Conflict
                </div>
                <p className="text-sm mb-2">This extension overlaps with an existing booking.</p>
                <div className="bg-white/50 p-2 rounded text-xs font-mono mb-3">
                  Code: {conflictWarning.conflict?.bookingCode}<br/>
                  Time: {conflictWarning.conflict?.time}
                </div>
                <p className="text-xs font-medium">Do you still want to force this extension?</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setExtendingJob(null); setConflictWarning(null); }} 
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              {conflictWarning ? (
                <button 
                  onClick={() => handleExtend(true)} 
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 shadow-sm"
                >
                  Force Extension
                </button>
              ) : (
                <button 
                  onClick={() => handleExtend(false)} 
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-sm"
                >
                  Confirm Extension
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing Modal Redesign */}
      {billingJob && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">MOTOFIX FINAL BILL</h3>
                <p className="text-sm text-slate-500 mt-1">Booking: {billingJob.bookingCode}</p>
              </div>
              <button onClick={() => setBillingJob(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Customer, Bike, Service Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Details</p>
                  <p className="font-semibold text-slate-900">{billingJob.customerId?.name}</p>
                  <p className="text-slate-600">{billingJob.customerId?.phone}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bike Details</p>
                  <p className="font-semibold text-slate-900">{billingJob.bikeId?.brand} {billingJob.bikeId?.model}</p>
                  <p className="text-slate-600 font-mono">{billingJob.bikeId?.registrationNumber}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Details</p>
                  <p className="font-semibold text-slate-900">{billingJob.serviceType}</p>
                  <p className="text-slate-600">{billingJob.date} | {billingJob.actualStartTime ? new Date(billingJob.actualStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : billingJob.startTime}</p>
                  <p className="text-slate-600">Completed: {billingJob.completedAt ? new Date(billingJob.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
                </div>
              </div>

              {/* Parts Selection */}
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">Parts & Products Used</p>
                
                <div className="flex gap-2 mb-4">
                  <select 
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-red-500 focus:border-red-500"
                    onChange={(e) => {
                      handleAddPart(e.target.value);
                      e.target.value = ''; // reset after adding
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select product to add...</option>
                    {inventory.filter(i => i.quantity > 0).map(item => (
                      <option key={item._id} value={item._id}>
                        {item.name} - ₹{item.unitPrice} ({item.quantity} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedParts.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedParts.map((p) => (
                          <tr key={p.item._id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-900">{p.item.name}</td>
                            <td className="px-4 py-3 text-center">
                              <input 
                                type="number" 
                                min="1"
                                max={p.item.quantity}
                                className="w-16 px-2 py-1 text-center border border-slate-300 rounded-lg text-sm"
                                value={p.quantity}
                                onChange={(e) => updatePartQuantity(p.item._id, parseInt(e.target.value) || 1)}
                              />
                            </td>
                            <td className="px-4 py-3 text-right text-slate-600">₹{p.item.unitPrice}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-900">₹{p.item.unitPrice * p.quantity}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => updatePartQuantity(p.item._id, 0)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No parts added yet. Select from the dropdown above.
                  </p>
                )}
              </div>

              {/* Labor & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">Labour Charge</p>
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl font-medium focus:ring-red-500 focus:border-red-500"
                      value={laborCharge}
                      onChange={(e) => setLaborCharge(Number(e.target.value))}
                    />
                  </div>

                  {additionalRepairs.length > 0 && (
                    <>
                      <p className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">Approved Additional Repairs</p>
                      <div className="space-y-2 mb-6">
                        {additionalRepairs.map((ar, i) => (
                          <div key={i} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-700">{ar.description}</span>
                            <span className="font-bold text-slate-900">+ ₹{ar.estimatedCost}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner h-fit">
                  <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Bill Summary</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Parts Subtotal</span>
                      <span>₹{calculatePartsTotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Labour</span>
                      <span>₹{laborCharge || 0}</span>
                    </div>
                    {additionalRepairs.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-300">Additional Repairs</span>
                        <span>₹{additionalRepairs.reduce((sum, ar) => sum + ar.estimatedCost, 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-300">Tax (18% GST)</span>
                      <span>₹{((getSubtotal() + additionalRepairs.reduce((sum, ar) => sum + ar.estimatedCost, 0)) * 0.18).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                    <span className="text-lg font-bold">Grand Total</span>
                    <span className="text-2xl font-bold text-green-400">
                      ₹{((getSubtotal() + additionalRepairs.reduce((sum, ar) => sum + ar.estimatedCost, 0)) * 1.18).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setBillingJob(null)} 
                className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateBill} 
                className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 flex items-center gap-2 rounded-xl hover:bg-green-700 shadow-sm"
              >
                <CheckCircle className="w-4 h-4"/> Generate Final Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
