import { Outlet, Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Top Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[45vh] bg-gradient-to-b from-dark-900 to-dark-800 rounded-b-[40px] shadow-lg">
        {/* Subtle decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-10 w-48 h-48 bg-red-600/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
        <div className="w-full max-w-md mb-8">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/40 mb-4 transform -rotate-3 transition-transform hover:rotate-0">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
              MotoFix
            </h2>
            <p className="mt-2 text-center text-sm font-medium text-slate-300">
              Smart bike service & workshop management
            </p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white py-8 px-6 shadow-2xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
