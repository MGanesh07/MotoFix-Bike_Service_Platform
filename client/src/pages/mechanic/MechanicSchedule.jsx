import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar as CalendarIcon, Clock, User, Phone, Wrench } from 'lucide-react';

export default function MechanicSchedule() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // Modal state

  useEffect(() => {
    fetchAvailability();
  }, [selectedDate]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/availability?date=${selectedDate}`);
      setAvailability(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSlotColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100';
      case 'Booked': return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 cursor-pointer shadow-sm';
      case 'Working': return 'bg-yellow-50 border-yellow-300 text-yellow-800 ring-2 ring-yellow-400 cursor-pointer shadow-md';
      case 'Completed': return 'bg-slate-100 border-slate-300 text-slate-500 cursor-pointer';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="text-red-600" />
          Workshop Schedule
        </h2>
        <input 
          type="date"
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availability?.slots?.map((slot) => (
            <div 
              key={slot.slotId}
              onClick={() => slot.booking && setSelectedJob(slot.booking)}
              className={`p-5 rounded-xl border transition-all ${getSlotColor(slot.status)} ${slot.booking ? 'transform hover:-translate-y-1' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold flex items-center gap-1.5"><Clock className="w-4 h-4"/> {slot.startTime}</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-white/50 rounded-md">
                  {slot.status}
                </span>
              </div>
              
              {slot.booking ? (
                <div className="space-y-1">
                  <p className="font-semibold text-sm truncate">{slot.booking.bikeModel}</p>
                  <p className="text-xs opacity-80 font-medium">{slot.booking.registrationNumber}</p>
                  <p className="text-xs truncate mt-2 bg-white/40 inline-block px-2 py-0.5 rounded">{slot.booking.serviceType}</p>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm opacity-60">No Booking</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Wrench className="w-5 h-5 text-red-500"/> Job Details</h3>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <p className="text-sm text-slate-500">Booking Code</p>
                  <p className="font-mono font-bold text-slate-800">{selectedJob.bookingCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-bold text-red-600">{selectedJob.bookingStatus}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Customer</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-800">{selectedJob.customerName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{selectedJob.customerPhone}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-semibold">Vehicle</p>
                <p className="font-bold text-slate-800">{selectedJob.bikeModel}</p>
                <p className="text-sm text-slate-600">{selectedJob.registrationNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Service Type</p>
                <p className="font-medium text-slate-800">{selectedJob.serviceType}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Problem Description</p>
                <p className="text-sm text-slate-700 italic bg-amber-50 p-3 rounded-lg border border-amber-100">"{selectedJob.problemDescription}"</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
