import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle, useMap } from 'react-leaflet';
import { HistoryRecord } from '../types';
import { ArrowLeft, Calendar, Bug, Droplets, Sprout, Camera } from 'lucide-react';

interface MapDashboardProps {
  history: HistoryRecord[];
  onBack: () => void;
  onAnalyze: () => void;
}

// Component to handle map bounds
const MapRecenter = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

export const MapDashboard: React.FC<MapDashboardProps> = ({ history, onBack, onAnalyze }) => {
  // Timeline state (days ago)
  const [daysFilter, setDaysFilter] = useState<number>(30);
  
  // Filter data based on timeline
  const filteredHistory = useMemo(() => {
    const cutoff = Date.now() - (daysFilter * 24 * 60 * 60 * 1000);
    return history.filter(record => record.timestamp >= cutoff);
  }, [history, daysFilter]);

  // Calculate Region Grids (Unit Squares)
  // We round Lat/Lng to approx 0.01 degrees (~1.1km) to group points
  const gridData = useMemo(() => {
    const grids: Record<string, { 
      totalScore: number; 
      count: number; 
      bounds: [[number, number], [number, number]] 
    }> = {};

    const gridSize = 0.01; // ~1km

    filteredHistory.forEach(record => {
      // Create a grid key
      const latKey = Math.floor(record.location.lat / gridSize);
      const lngKey = Math.floor(record.location.lng / gridSize);
      const key = `${latKey}-${lngKey}`;

      if (!grids[key]) {
        grids[key] = {
          totalScore: 0,
          count: 0,
          bounds: [
            [latKey * gridSize, lngKey * gridSize],
            [(latKey + 1) * gridSize, (lngKey + 1) * gridSize]
          ]
        };
      }
      grids[key].totalScore += record.healthScore;
      grids[key].count += 1;
    });

    return Object.values(grids).map(g => ({
      avgScore: g.totalScore / g.count,
      bounds: g.bounds
    }));
  }, [filteredHistory]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 50) return '#eab308'; // Yellow
    if (score >= 25) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Center on the FIRST (most recent) image if available, else default to Chikmagalur
  const centerLat = filteredHistory.length > 0 ? filteredHistory[0].location.lat : 13.3153;
  const centerLng = filteredHistory.length > 0 ? filteredHistory[0].location.lng : 75.7754;

  return (
    <div className="flex flex-col h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-white p-4 border-b border-stone-200 shadow-sm z-30 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-stone-600 hover:text-stone-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="text-stone-800 font-bold">Regional Health Map</div>
        <div className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded">
          {filteredHistory.length} Samples
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-grow relative">
        <MapContainer 
          center={[centerLat, centerLng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <MapRecenter lat={centerLat} lng={centerLng} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Grid Overlay (Heatmap) */}
          {gridData.map((grid, idx) => (
            <Rectangle
              key={`grid-${idx}`}
              bounds={grid.bounds}
              pathOptions={{ 
                color: getHealthColor(grid.avgScore), 
                weight: 0, 
                fillOpacity: 0.3 
              }}
            />
          ))}

          {/* Individual Points */}
          {filteredHistory.map((record) => (
            <CircleMarker
              key={record.id}
              center={[record.location.lat, record.location.lng]}
              radius={6}
              pathOptions={{
                color: 'white',
                weight: 2,
                fillColor: getHealthColor(record.healthScore),
                fillOpacity: 1
              }}
            >
              <Popup>
                <div className="min-w-[200px] font-sans">
                  <h3 className="font-bold text-stone-900">{record.diagnosis}</h3>
                  <div className="text-xs text-stone-500 mb-2">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                      Score: {record.healthScore}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                      {record.severity}
                    </span>
                  </div>
                  {record.thumbnail && (
                    <img src={record.thumbnail} alt="preview" className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-600">
                     <div className="flex items-center"><Bug className="w-3 h-3 mr-1"/> Pest: {record.riskFactors.pestRisk}%</div>
                     <div className="flex items-center"><Droplets className="w-3 h-3 mr-1"/> Nut: {record.riskFactors.nutrientDeficiency}%</div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Empty State Overlay */}
        {history.length === 0 && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-stone-100/80 backdrop-blur-sm p-4">
             <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-stone-200 max-w-sm w-full animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sprout className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">No Field Data Yet</h3>
                <p className="text-stone-500 mb-8 leading-relaxed">
                  Start by analyzing your first coffee plant to generate a regional health map and risk assessment.
                </p>
                <button 
                  onClick={onAnalyze} 
                  className="w-full bg-green-800 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-900 transition-all transform hover:-translate-y-1 shadow-lg shadow-green-900/20 flex items-center justify-center"
                >
                   <Camera className="w-5 h-5 mr-2" />
                   Start New Analysis
                </button>
             </div>
          </div>
        )}

        {/* Timeline Control - Only show if we have history */}
        {history.length > 0 && (
          <div className="absolute bottom-6 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-200 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center text-sm font-bold text-stone-700">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Timeline Scrubber
               </div>
               <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  Last {daysFilter} Days
               </span>
            </div>
            
            <input 
              type="range" 
              min="1" 
              max="90" 
              value={daysFilter} 
              onChange={(e) => setDaysFilter(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-medium">
               <span>Today</span>
               <span>3 Months Ago</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};