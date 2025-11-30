import React from 'react';
import { 
  ArrowLeft, 
  Home, 
  Building2, 
} from 'lucide-react';

const NotFound: React.FC = () => {

  // const role
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };




  return (
    <div className="min-h-screen bg-slate-50">

      {/* Main Content */}
      <div className="px-8 py-12 mt-14  z-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Visual */}
          <div className="relative mb-8">
            <div className="text-9xl font-black text-slate-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-indigo-100 p-4 rounded-2xl">
                <Building2 className="w-16 h-16 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
             Page Not Found
            </h2>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
          The page you’re looking for doesn’t exist or may have been moved.  
          Let’s get you back on track.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Return Home
              </button>
              
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Still having trouble? 
              <button 
                onClick={() => window.location.href = '/support'}
                className="text-indigo-600 hover:text-indigo-700 font-medium ml-1 underline"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-100 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="absolute bottom-20 right-10 w-28 h-28 bg-amber-100 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

export default NotFound;