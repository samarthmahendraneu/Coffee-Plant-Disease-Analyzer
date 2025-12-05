import React from 'react';
import { AnalysisResult } from '../types';
import { 
  AlertTriangle, 
  ArrowLeft,
  Activity,
  CalendarCheck,
  Sprout,
  CheckCircle2,
  ShieldAlert,
  Search,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface AnalysisViewProps {
  result: AnalysisResult;
  imagePreview: string | null;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, imagePreview, onReset }) => {
  
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const riskData = [
    { name: 'Pest', value: result.riskFactors.pestRisk, color: '#ef4444' }, 
    { name: 'Disease', value: result.riskFactors.diseaseRisk, color: '#f97316' }, 
    { name: 'Nutrient', value: result.riskFactors.nutrientDeficiency, color: '#eab308' }, 
    { name: 'Stress', value: result.riskFactors.environmentalStress, color: '#3b82f6' }, 
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-12 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <button 
            onClick={onReset} 
            className="flex items-center text-stone-600 hover:text-green-800 transition-colors bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl text-sm font-semibold"
            >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Analysis
            </button>
            <div className="text-stone-500 text-sm font-medium hidden sm:block">
                Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Top Section: Overview */}
        <div className="grid md:grid-cols-12 gap-6 md:gap-8">
          
          {/* Left: Image & Quick Stats */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden relative group">
              <div className="aspect-[4/3] bg-stone-200 relative">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Analyzed Plant" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent"></div>
                
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center">
                    <Search className="w-3 h-3 mr-1.5 text-stone-500" />
                    {result.plantPart || "Plant"} Analysis
                </div>

                <div className="absolute bottom-6 left-6 text-white max-w-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSeverityStyle(result.severity)} bg-opacity-90`}>
                        {result.severity} Severity
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold leading-tight shadow-black drop-shadow-md">{result.diagnosis}</h2>
                  {result.scientificName && (
                      <p className="text-stone-300 italic font-serif mt-1 text-sm">{result.scientificName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Evidence Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <h3 className="text-stone-900 font-bold mb-4 flex items-center text-sm uppercase tracking-wide">
                    <Search className="w-4 h-4 mr-2 text-blue-600" />
                    Diagnosis Evidence
                </h3>
                <div className="flex flex-wrap gap-2">
                    {result.visualIndicators.map((indicator, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-800 text-sm px-3 py-1.5 rounded-lg border border-blue-100">
                            {indicator}
                        </span>
                    ))}
                    {result.visualIndicators.length === 0 && (
                        <span className="text-stone-500 text-sm italic">No specific visual cues listed.</span>
                    )}
                </div>
            </div>
          </div>

          {/* Right: Detailed Analysis */}
          <div className="md:col-span-7 flex flex-col gap-6">
             {/* Summary & Immediate Actions */}
             <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 flex-1">
                <div className="mb-8">
                   <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-3">Agronomist Summary</h3>
                   <p className="text-stone-800 text-lg leading-relaxed">
                     {result.summary}
                   </p>
                </div>

                <div className="border-t border-stone-100 pt-8">
                    <h3 className="flex items-center text-green-800 font-bold mb-5 text-lg">
                        <Sprout className="w-5 h-5 mr-2" />
                        Immediate Treatment Required
                    </h3>
                    <div className="space-y-4">
                        {result.immediateActions.map((action, idx) => (
                            <div key={idx} className="flex items-start bg-green-50/50 p-4 rounded-xl border border-green-100">
                                <div className="bg-green-100 p-1 rounded-full mr-4 mt-0.5">
                                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                                </div>
                                <span className="text-stone-800 font-medium">{action}</span>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Middle Section: Long Term & Stats */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Preventative Measures */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 min-w-0 min-h-0">

                <h3 className="flex items-center text-stone-900 font-bold mb-6">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Long-Term Prevention
                </h3>
                <ul className="space-y-3">
                    {result.preventativeMeasures.map((measure, idx) => (
                        <li key={idx} className="flex items-start text-stone-600">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>{measure}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 p-4 bg-purple-50 rounded-xl text-purple-900 text-sm leading-relaxed border border-purple-100">
                    <strong>Note:</strong> Consistent implementation of these measures is crucial for Chikmagalur's climate, especially before the monsoon season.
                </div>
            </div>

            {/* Risk Factors Chart */}
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 min-w-0 min-h-0">
                <h3 className="flex items-center text-stone-900 font-bold mb-2">
                    <Activity className="w-5 h-5 mr-2 text-stone-600" />
                    Risk Assessment
                </h3>
                <p className="text-stone-500 text-sm mb-6">Current vulnerability levels based on visual signs.</p>
                
                {/* Fixed height container using inline styles to ensure Recharts has dimensions */}
                <div style={{ width: '100%', height: 250 }} className="min-w-0 min-h-0">

                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={riskData} layout="vertical" margin={{ left: 0, right: 30, bottom: 0, top: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={70} 
                                tick={{fill: '#78716c', fontSize: 12, fontWeight: 600}} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                cursor={{fill: '#f5f5f4', opacity: 0.5}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Bottom: Weekly Plan */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-stone-900 text-xl flex items-center">
                    <CalendarCheck className="w-6 h-6 mr-3 text-blue-600" />
                    7-Day Action Schedule
                </h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Auto-Generated
                </span>
            </div>
            
            <div className="grid md:grid-cols-7 gap-4">
              {result.weeklyPlan.map((day, idx) => (
                <div key={idx} className="flex flex-col h-full">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 text-center">Day {idx + 1}</div>
                    <div className={`flex-grow rounded-2xl p-4 border transition-all hover:shadow-md ${
                        day.priority === 'High' ? 'bg-red-50 border-red-100' :
                        day.priority === 'Medium' ? 'bg-orange-50 border-orange-100' :
                        'bg-stone-50 border-stone-100'
                    }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-3 ${
                             day.priority === 'High' ? 'bg-red-200 text-red-800' :
                             day.priority === 'Medium' ? 'bg-orange-200 text-orange-800' :
                             'bg-stone-200 text-stone-600'
                        }`}>
                            {day.day.substring(0, 1)}
                        </div>
                        <h4 className="font-bold text-stone-800 text-sm mb-2 leading-tight">{day.task}</h4>
                        <p className="text-xs text-stone-500 leading-normal">{day.reason}</p>
                    </div>
                </div>
              ))}
            </div>
        </div>

      </main>
    </div>
  );
};