import { Link } from 'react-router-dom';
import { Settings, Wrench, Shield, Zap, Search, Clock, CheckCircle, FileText, Bike, PenTool, Activity, Battery, TriangleAlert, ChevronRight } from 'lucide-react';

export default function CustomerHome() {
  const services = [
    { name: 'General Service', icon: Settings, desc: 'Complete checkup and maintenance' },
    { name: 'Oil Change', icon: Activity, desc: 'Premium synthetic & mineral oils' },
    { name: 'Brake Repair', icon: Shield, desc: 'Pads, shoes, and fluid replacement' },
    { name: 'Engine Diagnostics', icon: Search, desc: 'Computerized scanning & tuning' },
    { name: 'Tyre Replacement', icon: PenTool, desc: 'Puncture repair and new tyres' },
    { name: 'Battery Service', icon: Battery, desc: 'Testing, charging and replacement' },
    { name: 'Electrical Repair', icon: Zap, desc: 'Wiring, lights, and horn fixes' },
    { name: 'Custom Repair', icon: Wrench, desc: 'Specialized fixes for your bike' }
  ];

  const steps = [
    { title: 'Select Your Bike', icon: Bike },
    { title: 'Choose Service', icon: Settings },
    { title: 'Check Slot', icon: Clock },
    { title: 'Book Service', icon: CheckCircle },
    { title: 'Track Repair', icon: Activity },
    { title: 'Get Your Bill', icon: FileText }
  ];

  const benefits = [
    'Easy online booking',
    'Transparent billing',
    'Real-time repair tracking',
    'Genuine OEM parts',
    'Digital service history',
    'Professional mechanics'
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* HERO SECTION - CLEAN SAAS STYLE */}
      <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold mb-6 border border-teal-100">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
            Premium Motorcycle Care
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight leading-tight">
            Professional bike care, <br className="hidden md:block" />
            <span className="text-teal-600">simplified.</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
            Experience hassle-free motorcycle maintenance. Book trusted mechanics, track repairs in real-time, and get transparent digital billing instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/book" 
              className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-teal-700 transition-all text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <Wrench className="w-4 h-4" /> Book a Service
            </Link>
            <Link 
              to="/bikes" 
              className="bg-white text-slate-700 border border-slate-300 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <Bike className="w-4 h-4" /> View My Bikes
            </Link>
          </div>
        </div>
        
        {/* Subtle decorative background/icon */}
        <div className="hidden md:flex justify-center items-center p-8 bg-slate-50 rounded-full border border-slate-100 w-64 h-64 flex-shrink-0 relative">
          <div className="absolute inset-0 bg-teal-100/50 rounded-full blur-2xl"></div>
          <Settings className="w-32 h-32 text-teal-600 relative z-10 opacity-90" />
        </div>
      </div>
      
      {/* SERVICES SECTION */}
      <div>
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Available Services</h2>
          <p className="text-sm text-slate-500 max-w-xl">Comprehensive care for every make and model. We use genuine parts and follow manufacturer guidelines.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map(service => (
            <div key={service.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] hover:border-teal-200 transition-all duration-300 group flex flex-col cursor-pointer">
              <div className="w-10 h-10 bg-slate-50 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 rounded-xl flex items-center justify-center mb-4 transition-colors border border-slate-100 group-hover:border-teal-100">
                <service.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">{service.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed flex-1">{service.desc}</p>
              <div className="mt-4 flex items-center text-xs font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">How It Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
          <div className="hidden lg:block absolute top-6 left-[8%] right-[8%] h-[2px] bg-slate-100 z-0"></div>
          {steps.map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-12 h-12 bg-white border border-slate-200 text-slate-600 group-hover:border-teal-500 group-hover:text-teal-600 rounded-xl flex items-center justify-center mb-3 shadow-sm transition-colors relative bg-clip-padding">
                <step.icon className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-100 text-slate-600 group-hover:bg-teal-600 group-hover:text-white rounded-md text-[10px] font-bold flex items-center justify-center transition-colors">
                  {idx + 1}
                </span>
              </div>
              <h3 className="font-semibold text-xs text-slate-700">{step.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* WHY MOTOFIX */}
      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Why Choose MotoFix?</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-md">
            We are redefining motorcycle maintenance with technology and transparency. 
            No more waiting in long queues or dealing with hidden charges.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {benefits.map(benefit => (
              <div key={benefit} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <CheckCircle className="w-3 h-3" />
                </div>
                <span className="font-medium text-slate-700 text-xs">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden flex flex-col items-start justify-end min-h-[240px] shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute -right-10 -top-10 opacity-20">
            <Shield className="w-64 h-64 text-teal-500" />
          </div>
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 w-full max-w-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <TriangleAlert className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm mb-1">Safety First Guarantee</p>
                <p className="text-xs text-slate-300 leading-relaxed">Every serviced vehicle undergoes a rigorous 24-point quality inspection before delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
