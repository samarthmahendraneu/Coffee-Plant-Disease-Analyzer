import React from 'react';
import { Leaf, Camera, Upload, Sprout, ShieldCheck, Activity, BarChart3, MapPin, ScanLine } from 'lucide-react';

interface HeroProps {
  onImageSelect: (file: File) => void;
}

export const Hero: React.FC<HeroProps> = ({ onImageSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="bg-green-800 p-2 rounded-xl shadow-sm">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-stone-900 tracking-tight block leading-none">Coffee<span className="text-green-700">AI</span></span>
            <span className="text-[10px] text-stone-500 font-medium tracking-wide uppercase">Agronomy Assistant</span>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-600">
          <span className="hover:text-green-800 cursor-pointer transition-colors">Yield Protection</span>
          <span className="hover:text-green-800 cursor-pointer transition-colors">Pest ID</span>
          <span className="hover:text-green-800 cursor-pointer transition-colors">Planner</span>
        </div>
        <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
            Chikmagalur, KA
            </span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center pt-16 pb-12 px-4 text-center max-w-5xl mx-auto w-full">
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-green-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border border-green-100 shadow-sm">
            <Sprout className="w-4 h-4" />
            <span>Built with Gemini 3 Pro</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-stone-900 mb-8 tracking-tight leading-tight">
            Protect Your Coffee.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-emerald-600">
                Maximize Your Yield.
            </span>
            </h1>
            
            <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Real-time diagnosis for <strong>White Stem Borer</strong>, <strong>Leaf Rust</strong>, and nutrient deficiencies using advanced AI. tailored for Chikmagalur's unique terroir.
            </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
          <label className="flex-1 flex items-center justify-center p-5 bg-green-800 hover:bg-green-900 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-green-900/20 cursor-pointer transition-all transform hover:-translate-y-1 active:scale-95 group">
            <Camera className="w-7 h-7 mr-4 group-hover:rotate-12 transition-transform" />
            <div className="text-left">
              <span className="block font-bold text-xl">Analyze Plant</span>
              <span className="block text-xs opacity-80 font-medium">Take a photo of leaf or berry</span>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
          
          <label className="flex-1 flex items-center justify-center p-5 bg-white border-2 border-stone-200 hover:border-green-600/30 hover:bg-green-50/50 text-stone-700 hover:text-green-800 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md">
            <Upload className="w-7 h-7 mr-4 text-stone-400 group-hover:text-green-700" />
            <div className="text-left">
              <span className="block font-bold text-xl">Upload Image</span>
              <span className="block text-xs text-stone-500 font-medium">From your gallery</span>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Value Proposition Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <ScanLine className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-xl text-stone-900 mb-3">Precision Diagnosis</h3>
            <p className="text-stone-600 leading-relaxed">
              Detects early signs of Leaf Rust and Berry Borer with computer vision calibrated on thousands of plant samples.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-xl text-stone-900 mb-3">Weekly Action Plans</h3>
            <p className="text-stone-600 leading-relaxed">
              Don't just diagnose—act. Get generated 7-day schedules for fertilization, irrigation, and pest control.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-xl text-stone-900 mb-3">Yield Analytics</h3>
            <p className="text-stone-600 leading-relaxed">
              Assess risk factors for nutrient deficiency and environmental stress before they impact your harvest volume.
            </p>
          </div>
        </div>
      </div>
      
      <footer className="bg-white py-8 border-t border-stone-200 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-stone-500">
            <p>© 2024 CoffeeAI. Designed for Chikmagalur Coffee Growers.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <span className="hover:text-stone-800 cursor-pointer">Privacy</span>
                <span className="hover:text-stone-800 cursor-pointer">Terms</span>
                <span className="hover:text-stone-800 cursor-pointer">Support</span>
            </div>
        </div>
      </footer>
    </div>
  );
};