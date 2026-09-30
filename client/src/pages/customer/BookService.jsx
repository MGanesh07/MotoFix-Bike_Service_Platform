import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, Wrench, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

export default function BookService() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bikes, setBikes] = useState([]);
  
  const [selectedBike, setSelectedBike] = useState('');
  const [serviceType, setServiceType] = useState('General Service');
  const [problemDescription, setProblemDescription] = useState('');
  
  // Date & Availability
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBikes();
  }, []);

  useEffect(() => {
    if (selectedDate && step === 3) {
      fetchAvailability();
    }
  }, [selectedDate, step]);

  const fetchBikes = async () => {
    try {
      const { data } = await api.get('/bikes');
      setBikes(data);
      if (data.length > 0) setSelectedBike(data[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailability = async () => {
    setLoading(true);
    setSelectedSlot(null);
    try {
      const { data } = await api.get(`/availability?date=${selectedDate}`);
      setSlots(data.slots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError('Please select an available time slot');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/bookings', {
        bikeId: selectedBike,
        serviceType,
        problemDescription,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setLoading(false);
    }
  };

  const getSlotColor = (status, isSelected) => {
    if (isSelected) return 'bg-teal-600 border-teal-600 text-white shadow-md';
    switch (status) {
      case 'Available': return 'bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:shadow-sm cursor-pointer';
      case 'Booked': return 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed';
      case 'Working': return 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed';
      case 'Completed': return 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  const stepsList = [
    { num: 1, title: 'Service Details' },
    { num: 2, title: 'Problem Info' },
    { num: 3, title: 'Schedule' },
    { num: 4, title: 'Confirm' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book a Service</h1>
        <p className="text-sm text-slate-500 mt-1">Follow the steps below to schedule your motorcycle maintenance</p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-red-500" /> {error}
        </div>
      )}

      {/* Modern Steps Indicator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hidden md:block">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-8 h-0.5 bg-teal-600 -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `calc(${((step - 1) / 3) * 100}% - 2rem)` }}></div>
          
          {stepsList.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step > s.num ? 'bg-teal-600 text-white' : step === s.num ? 'bg-teal-600 text-white shadow-md ring-4 ring-teal-50' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-semibold ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {step === 1 && (
          <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1"><Wrench className="w-5 h-5 text-teal-600"/> Select Bike & Service</h2>
              <p className="text-sm text-slate-500">Choose the motorcycle you want to service and the type of maintenance required.</p>
            </div>
            
            {bikes.length === 0 ? (
              <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-slate-800 font-semibold mb-2">No bikes registered</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">You need to add a bike to your garage before booking a service.</p>
                <button onClick={() => navigate('/bikes')} className="bg-white border border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-600 px-5 py-2.5 rounded-xl font-medium transition-all text-sm shadow-sm">
                  Go to My Garage
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select your bike</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bikes.map(bike => (
                      <div 
                        key={bike._id} 
                        onClick={() => setSelectedBike(bike._id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedBike === bike._id ? 'border-teal-600 bg-teal-50/50' : 'border-slate-200 hover:border-teal-300 bg-white'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900">{bike.brand} {bike.model}</p>
                            <p className="text-sm font-mono text-slate-500 mt-1">{bike.registrationNumber}</p>
                          </div>
                          {selectedBike === bike._id && (
                            <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Service Type</label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                    >
                      <option>General Service</option>
                      <option>Oil Change</option>
                      <option>Brake Repair</option>
                      <option>Tyre Replacement</option>
                      <option>Battery Problem</option>
                      <option>Chain/Sprocket</option>
                      <option>Engine Problem</option>
                      <option>Electrical Problem</option>
                      <option>Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-6 border-t border-slate-100">
                  <button onClick={() => setStep(2)} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 transition-all active:scale-95 text-sm flex items-center gap-2" disabled={!selectedBike}>
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1"><FileText className="w-5 h-5 text-teal-600"/> Problem Description</h2>
              <p className="text-sm text-slate-500">Provide details about any specific issues you are facing.</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Additional Details (Required)</label>
              <textarea 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all h-40 resize-none"
                placeholder="E.g. Engine is making a knocking sound when accelerating, or brakes feel loose..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button onClick={() => setStep(1)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 text-sm">Back</button>
              <button onClick={() => setStep(3)} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 transition-all active:scale-95 text-sm flex items-center gap-2" disabled={!problemDescription.trim()}>
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1"><Calendar className="w-5 h-5 text-teal-600"/> Schedule Appointment</h2>
              <p className="text-sm text-slate-500">Select a convenient date and time for your service.</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Choose Date</label>
              <input 
                type="date" 
                className="w-full sm:max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">Available Time Slots</label>
              
              {loading ? (
                <div className="flex justify-center p-12 bg-slate-50 rounded-2xl border border-slate-100"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.slotId === slot.slotId;
                    return (
                      <div 
                        key={slot.slotId}
                        onClick={() => slot.status === 'Available' && setSelectedSlot(slot)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center 
                          ${getSlotColor(slot.status, isSelected)}`}
                      >
                        <span className="font-semibold text-sm flex items-center gap-1.5"><Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`}/> {slot.startTime}</span>
                        <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>{slot.status}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 text-sm">Back</button>
              <button onClick={() => setStep(4)} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:bg-teal-700 transition-all active:scale-95 text-sm flex items-center gap-2" disabled={!selectedSlot}>
                Review Booking <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Review & Confirm</h2>
              <p className="text-sm text-slate-500">Please review your booking details before confirming.</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Service Type</p>
                  <p className="font-semibold text-slate-900">{serviceType}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="font-semibold text-slate-900">{selectedDate} <span className="text-slate-400 font-normal mx-1">at</span> {selectedSlot?.startTime}</p>
                </div>
                <div className="sm:col-span-2 pt-4 border-t border-slate-200/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Problem Description</p>
                  <p className="font-medium text-slate-700 bg-white p-4 rounded-xl border border-slate-200/60 leading-relaxed text-sm">{problemDescription}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button onClick={() => setStep(3)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 text-sm" disabled={loading}>Back</button>
              <button onClick={handleBooking} className="bg-teal-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-sm hover:bg-teal-700 transition-all active:scale-95 text-sm flex items-center gap-2" disabled={loading}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Confirming...</>
                ) : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
