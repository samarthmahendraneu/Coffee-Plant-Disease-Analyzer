import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { AnalysisView } from './components/AnalysisView';
import { analyzePlantImage } from './services/geminiService';
import { AnalysisState } from './types';
import { Loader2, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
    imagePreview: null,
  });

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Identifying plant part...",
    "Scanning for visual indicators (spots, holes)...",
    "Checking specifically for White Stem Borer...",
    "Evaluating nutrient deficiency risks...",
    "Formulating Chikmagalur-specific treatment..."
  ];

  useEffect(() => {
    let interval: any;
    if (state.isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [state.isLoading]);

  const handleImageSelect = async (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setState(prev => ({ ...prev, imagePreview: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // Start Analysis
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Convert file to base64 for API
      const base64Promise = new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.readAsDataURL(file);
        r.onload = () => resolve(r.result as string);
        r.onerror = error => reject(error);
      });

      const base64Image = await base64Promise;
      const result = await analyzePlantImage(base64Image);

      setState(prev => ({
        ...prev,
        isLoading: false,
        result: result
      }));

    } catch (error) {
      console.error(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to analyze image. Please ensure your API Key is valid and try again."
      }));
    }
  };

  const resetApp = () => {
    setState({
      isLoading: false,
      result: null,
      error: null,
      imagePreview: null
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-green-200 selection:text-green-900">
      {state.isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-white">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-stone-100">
              <Loader2 className="w-16 h-16 text-green-700 animate-spin" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-stone-800 mb-4 tracking-tight">Analyzing Crop Health</h2>
          <div className="h-8 overflow-hidden relative w-full max-w-sm flex justify-center">
            <p key={loadingStep} className="text-stone-500 font-medium animate-in slide-in-from-bottom-2 fade-in duration-300 absolute w-full">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        </div>
      ) : state.result ? (
        <AnalysisView 
          result={state.result} 
          imagePreview={state.imagePreview} 
          onReset={resetApp} 
        />
      ) : (
        <>
          {state.error && (
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
              <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-2xl shadow-xl flex items-start animate-in slide-in-from-top-4 fade-in">
                <ShieldAlert className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">Analysis Failed</h3>
                  <p className="text-xs opacity-90">{state.error}</p>
                </div>
                <button 
                  onClick={() => setState(prev => ({ ...prev, error: null }))} 
                  className="ml-2 text-red-400 hover:text-red-700 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          )}
          <Hero onImageSelect={handleImageSelect} />
        </>
      )}
    </div>
  );
};

export default App;