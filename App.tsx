import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { AnalysisView } from './components/AnalysisView';
import { MapDashboard } from './components/MapDashboard';
import { analyzePlantImage } from './services/geminiService';
import { getCurrentLocation, saveRecord, getHistory, getExifMetadata } from './services/storageService';
import { AnalysisState, HistoryRecord, GeoLocation } from './types';
import { Loader2, ShieldAlert } from 'lucide-react';

type ViewMode = 'HOME' | 'ANALYSIS' | 'MAP';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('HOME');
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
    imagePreview: null,
    currentLocation: undefined
  });
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Extracting metadata & location...",
    "Identifying plant part...",
    "Scanning for visual indicators (spots, holes)...",
    "Checking specifically for White Stem Borer...",
    "Evaluating nutrient deficiency risks...",
    "Formulating Chikmagalur-specific treatment..."
  ];

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    let interval: any;
    if (state.isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isLoading]);

  const handleImageSelect = async (file: File, source: 'camera' | 'upload') => {
    // 1. Start UI Loading
    setViewMode('ANALYSIS'); // Force view to switch so we see loader
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      result: null,
      currentLocation: undefined
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setState(prev => ({ ...prev, imagePreview: reader.result as string }));
    };
    reader.readAsDataURL(file);

    try {
      // 2. Extract Metadata (Location & Time)
      let location: GeoLocation | null = null;
      let timestamp: number | undefined = undefined;

      if (source === 'upload') {
        // Attempt to get EXIF data from uploaded file (now supports PNG via exifr)
        try {
          const metadata = await getExifMetadata(file);
          
          // Debugging EXIF Extraction
          console.log("RAW EXIF Extract:", metadata);
          console.log("Extracted location object:", metadata.location);

          if (metadata.location) {
            location = metadata.location;
          }
          if (metadata.timestamp) {
            timestamp = metadata.timestamp;
          }
        } catch (e) {
          console.warn("Metadata extraction process encountered an issue.");
        }
      } 
      // Note: If source is 'camera', we skip EXIF as browsers often strip it from live blobs.
      // We directly use device location below.

      if (!location) {
        // Fallback to Device GPS
        console.log("Using Device GPS Fallback...");
        const deviceLoc = await getCurrentLocation();
        if (deviceLoc) {
            // Craft a specific message explaining WHY we fell back
            let regionName = "Device GPS (Live)";
            if (source === 'upload') {
                // If we are here for an upload, it means the image file itself didn't have GPS tags (or extraction failed)
                regionName = "Device (Image missing loc)";
            }

            location = {
                ...deviceLoc,
                regionName: regionName
            };
        }
      }
      
      setState(prev => ({ ...prev, currentLocation: location || undefined }));

      // 3. Prepare Image Base64
      const base64Promise = new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.readAsDataURL(file);
        r.onload = () => resolve(r.result as string);
        r.onerror = error => reject(error);
      });
      const base64Image = await base64Promise;

      // 4. Analyze with Gemini
      const result = await analyzePlantImage(base64Image);

      // 5. Save Record
      if (location) {
        const newRecord = saveRecord(result, location, base64Image, timestamp);
        setHistory(prev => [newRecord, ...prev]);
      }

      // 6. Finish
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
        error: "Failed to analyze. Please check your connection or camera permissions."
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
    setViewMode('HOME');
  };

  // Render Logic
  if (viewMode === 'MAP') {
    return (
      <MapDashboard 
        history={history} 
        onBack={() => setViewMode('HOME')} 
        onAnalyze={() => setViewMode('HOME')}
      />
    );
  }

  // Loading Screen
  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-white font-sans">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-stone-100">
            <Loader2 className="w-16 h-16 text-green-700 animate-spin" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-stone-800 mb-4 tracking-tight">Analyzing Field Data</h2>
        <div className="h-8 overflow-hidden relative w-full max-w-sm flex justify-center">
          <p key={loadingStep} className="text-stone-500 font-medium animate-in slide-in-from-bottom-2 fade-in duration-300 absolute w-full">
            {loadingMessages[loadingStep]}
          </p>
        </div>
        {state.currentLocation && (
           <p className="mt-4 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 animate-in fade-in">
             📍 {state.currentLocation.regionName}: {state.currentLocation.lat.toFixed(4)}, {state.currentLocation.lng.toFixed(4)}
           </p>
        )}
      </div>
    );
  }

  // Result View
  if (state.result && viewMode === 'ANALYSIS') {
    return (
      <AnalysisView 
        result={state.result} 
        imagePreview={state.imagePreview} 
        onReset={resetApp} 
      />
    );
  }

  // Home View
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-green-200 selection:text-green-900">
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
      <Hero 
        onImageSelect={handleImageSelect} 
        onOpenMap={() => setViewMode('MAP')}
      />
    </div>
  );
};

export default App;