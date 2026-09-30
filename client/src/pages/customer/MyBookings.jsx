import { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, CheckCircle, FileText, Star, AlertTriangle, Calendar, Clock, X, ChevronRight, CheckCircle2, Wrench } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [activeBill, setActiveBill] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusPriority = (status) => {
    if (['Bike Received', 'Inspection', 'Repairing', 'Quality Check', 'Ready for Delivery'].includes(status)) return 1;
    if (status === 'Confirmed') return 2;
    if (status === 'Completed') return 3;
    if (['Cancelled', 'Rejected'].includes(status)) return 4;
    return 5;
  };

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      
      const sortedData = data.sort((a, b) => {
        const pA = getStatusPriority(a.status);
        const pB = getStatusPriority(b.status);
        if (pA !== pB) return pA - pB;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setBookings(sortedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setRating(0);
    setComment('');
  };
  const handleReviewSubmit = async () => {
    if (!rating || rating === 0) {
      alert("Please select a rating.");
      return;
    }
    
    try {
      const { data } = await api.post('/reviews', {
        bookingId: reviewBooking._id,
        rating,
        comment
      });
      alert('Review submitted successfully!');
      
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b._id === reviewBooking._id ? { ...b, review: data } : b
        )
      );
      
      setReviewBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const fetchBill = async (bookingId) => {
    try {
      const { data } = await api.get(`/bills/booking/${bookingId}`);
      setActiveBill(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Bill not generated yet');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Service History & Bookings</h2>
        <p className="text-sm text-slate-500 mt-1">Track your active repairs and view past service records</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-sm min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <History className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">No bookings found</h3>
          <p className="text-sm text-slate-500">You don't have any service history or active bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => {
            const isCompleted = booking.status === 'Completed';
            const isActive = !['Completed', 'Cancelled', 'Rejected'].includes(booking.status);
            
            return (
              <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow duration-200 group">
                {/* Left Side Info */}
                <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-3 border border-slate-200">
                        ID: {booking.bookingCode}
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{booking.bikeId?.brand} {booking.bikeId?.model}</h3>
                      <p className="text-sm font-mono text-slate-500">{booking.bikeId?.registrationNumber}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border
                      ${isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isActive ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-200'}
                    `}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Wrench className="w-3 h-3"/> Service Type</p>
                      <p className="font-semibold text-slate-800 text-sm">{booking.serviceType}</p>
                    </div>
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Schedule</p>
                      <p className="font-semibold text-slate-800 text-sm">{booking.date} <span className="text-slate-400 font-normal">at</span> {booking.startTime}</p>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="mt-5 p-4 bg-white rounded-xl border border-teal-100 shadow-[0_2px_10px_-4px_rgba(59,130,246,0.1)]">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Repair Progress</p>
                        <p className="text-xs font-semibold text-teal-600">{booking.status}</p>
                      </div>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                        {['Confirmed', 'Bike Received', 'Inspection', 'Repairing', 'Quality Check', 'Ready for Delivery'].map((step, idx, arr) => {
                          const currentIndex = arr.indexOf(booking.status);
                          const isPast = currentIndex >= idx;
                          return (
                            <div 
                              key={step} 
                              className={`flex-1 transition-all duration-500 ${isPast ? 'bg-teal-500' : 'bg-transparent'}`}
                            ></div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side Actions */}
                <div className="p-6 md:w-1/3 flex flex-col justify-center gap-4 bg-slate-50/30">
                  {isCompleted ? (
                    <>
                      <div className="text-center mb-2">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-200">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-900">Service Completed</p>
                      </div>
                      
                      <button 
                        onClick={() => fetchBill(booking._id)}
                        className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm text-sm"
                      >
                        <FileText className="w-4 h-4"/> View Invoice
                      </button>
                      
                      {booking.review ? (
                        <div className="w-full py-2.5 px-4 bg-slate-100 border border-slate-200 rounded-xl flex flex-col gap-2 cursor-default">
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Rating</span>
                            <div className="flex items-center text-amber-500 font-bold text-sm bg-white px-2 py-0.5 rounded shadow-sm">
                              {booking.review.rating} <Star className="w-3.5 h-3.5 ml-1 fill-current" />
                            </div>
                          </div>
                          {booking.review.comment && booking.review.comment.trim() !== '' && (
                            <p className="text-xs text-slate-600 italic border-t border-slate-200 pt-2 text-left w-full">"{booking.review.comment}"</p>
                          )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => openReviewModal(booking)}
                          className="w-full py-2.5 px-4 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm text-sm"
                        >
                          <Star className="w-4 h-4"/> Leave Review
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center w-full h-full flex flex-col justify-center">
                      <div className="w-12 h-12 bg-white text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200">
                        <Clock className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Completion</p>
                      <p className="text-lg font-bold text-slate-900 mb-2">{booking.estimatedCompletionTime || 'Pending Estimate'}</p>
                      
                      {booking.mechanicId && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Mechanic</p>
                          <p className="text-sm font-semibold text-slate-700">{booking.mechanicId.name}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bill Modal */}
      {activeBill && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 text-center border-b border-slate-100 bg-slate-50 relative">
              <button onClick={() => setActiveBill(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">MotoFix</h2>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Service Invoice</p>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white">
              <div className="flex justify-between mb-8 pb-6 border-b border-dashed border-slate-200 text-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Invoice No.</p>
                  <p className="font-bold text-slate-800 font-mono">{activeBill.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Date</p>
                  <p className="font-bold text-slate-800">{new Date(activeBill.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs uppercase font-bold text-slate-800 mb-3 tracking-wider bg-slate-50 p-2 rounded-md border border-slate-100">Parts & Materials</p>
                {activeBill.parts?.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeBill.parts.map(part => (
                      <div key={part._id} className="flex justify-between text-sm">
                        <span className="text-slate-600 font-medium">{part.name} <span className="text-slate-400 ml-1">x {part.quantity}</span></span>
                        <span className="font-bold text-slate-900">₹{part.totalPrice?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic px-2">No spare parts used</p>
                )}
              </div>
              
              <div className="flex justify-between text-sm mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-700 font-bold uppercase tracking-wider text-xs flex items-center">Labour Charges</span>
                <span className="font-bold text-slate-900">₹{activeBill.laborCharges?.toFixed(2)}</span>
              </div>
              
              <div className="border-t-2 border-slate-900 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-bold text-slate-800">₹{activeBill.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tax ({activeBill.taxRate}%)</span>
                  <span className="font-bold text-slate-800">₹{activeBill.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Grand Total</span>
                  <span className="text-2xl font-bold text-teal-600">₹{activeBill.totalAmount?.toFixed(0)}</span>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <span className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm
                  ${activeBill.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                `}>
                  Status: {activeBill.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Rate your service</h3>
              <button onClick={() => setReviewBooking(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6 text-center leading-relaxed">
                How was your experience with the <span className="font-semibold text-slate-700">{reviewBooking.serviceType}</span> on your <span className="font-semibold text-slate-700">{reviewBooking.bikeId?.brand}</span>?
              </p>
              
              <div className="flex justify-center gap-3 mb-6 bg-slate-50 py-4 rounded-xl border border-slate-100">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-125">
                    <Star className={`w-8 h-8 ${rating >= star ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
              
              <textarea 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl mb-6 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                placeholder="Share more details about your experience (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              
              <button onClick={handleReviewSubmit} className="w-full py-3 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-sm transition-all active:scale-95">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
