
import React, { useEffect, useRef, useState } from 'react';
import { Activity } from '../types';
import { GOTHENBURG_CENTER } from '../constants';
import { Layers, Share2, Navigation, MapPin, Search, Clock, ChevronDown, ChevronUp } from 'lucide-react';

// Declare Leaflet global
declare const L: any;

interface MapViewProps {
  activities: Activity[];
  onSelectActivity: (id: string) => void;
  selectedActivityId: string | null;
  userLocation?: { lat: number; lng: number };
}

const MapView: React.FC<MapViewProps> = ({ 
  activities, 
  onSelectActivity, 
  selectedActivityId,
  userLocation = { lat: 57.70887, lng: 11.97456 } 
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  // Map State
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [routeData, setRouteData] = useState<{dist: string, time: string} | null>(null);
  
  // Navigation UI State
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [navDestination, setNavDestination] = useState<{lat: number, lng: number} | null>(null);
  const [arrivalTime, setArrivalTime] = useState('');

  // Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (typeof L === 'undefined') {
        console.error("Leaflet not loaded");
        return;
    }

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView([GOTHENBURG_CENTER.lat, GOTHENBURG_CENTER.lng], 13);
    
    mapRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Initial Tile Layer
    updateTileLayer(map, 'street');

    // Click Map to Navigate
    map.on('click', (e: any) => {
        if (!isNavCollapsed) {
            setNavDestination(e.latlng);
            setCustomAddress("Markerad plats");
            setSuggestions([]);
        }
    });

    // CRITICAL FIX: Force map layout update after render to prevent gray screen
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

  }, []);

  // Handle Map Type Change
  useEffect(() => {
    if(mapRef.current) {
        updateTileLayer(mapRef.current, mapType);
    }
  }, [mapType]);

  const updateTileLayer = (map: any, type: 'street' | 'satellite') => {
      map.eachLayer((layer: any) => {
          if (layer._url) map.removeLayer(layer);
      });

      if (type === 'satellite') {
          // Esri World Imagery for Realistic 3D feel
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: 'Tiles &copy; Esri'
          }).addTo(map);
          // Add hybrid labels on top
          L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png', {
              subdomains: 'abcd',
              minZoom: 0,
              maxZoom: 20,
              opacity: 0.5
          }).addTo(map);
      } else {
          // CartoDB Voyager for clean street view
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              attribution: '&copy; OpenStreetMap &copy; CARTO',
              subdomains: 'abcd',
              maxZoom: 20
          }).addTo(map);
      }
  };

  // Update Markers
  useEffect(() => {
      if (!mapRef.current || !markersLayerRef.current) return;
      
      const layerGroup = markersLayerRef.current;
      layerGroup.clearLayers();

      // User Marker
      const userIcon = L.divIcon({
          className: 'user-marker',
          html: `
            <div class="relative">
                <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10 relative"></div>
                ${isSharingLocation ? '<div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75 h-full w-full"></div>' : ''}
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup("<b>Din plats</b>")
        .addTo(layerGroup);

      // Activity Markers
      activities.forEach(activity => {
          const isSelected = selectedActivityId === activity.id;
          const icon = L.divIcon({
              className: 'activity-pin',
              html: `
                <div class="transition-transform duration-300 ${isSelected ? 'scale-125 -translate-y-2' : ''}">
                   <svg width="30" height="40" viewBox="0 0 24 24" fill="${isSelected ? '#ef4444' : '#0ea5e9'}" stroke="white" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
                     <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                     <circle cx="12" cy="9" r="2.5" fill="white"/>
                   </svg>
                </div>
              `,
              iconSize: [30, 40],
              iconAnchor: [15, 40],
              popupAnchor: [0, -40]
          });

          const marker = L.marker([activity.coordinates.lat, activity.coordinates.lng], { icon })
            .bindPopup(`
                <div class="text-gray-900">
                    <h3 class="font-bold text-sm">${activity.title}</h3>
                    <p class="text-xs text-gray-500">${activity.locationName}</p>
                </div>
            `)
            .on('click', () => {
                onSelectActivity(activity.id);
                setNavDestination(activity.coordinates);
                setIsNavCollapsed(false);
            });
          
          marker.addTo(layerGroup);

          if(isSelected) {
              marker.openPopup();
          }
      });
      
      // Destination Marker (if manually set)
      if (navDestination) {
           const destIcon = L.divIcon({
              className: 'dest-marker',
              html: `<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
           });
           L.marker([navDestination.lat, navDestination.lng], { icon: destIcon }).addTo(layerGroup);
      }

  }, [activities, isSharingLocation, selectedActivityId, userLocation, navDestination]);

  // Handle Autocomplete (Sweden Only)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customAddress.length > 2 && showSuggestions) {
        try {
          // Added &countrycodes=se to restrict search to Sweden
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customAddress)}&limit=5&countrycodes=se&bounded=0`);
          const data = await res.json();
          setSuggestions(data);
        } catch (e) {
          console.error("Autocomplete error", e);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customAddress, showSuggestions]);

  const handleSelectSuggestion = (place: any) => {
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);
      
      setCustomAddress(place.display_name.split(',')[0]);
      setNavDestination({ lat, lng });
      setSuggestions([]);
      setShowSuggestions(false);
      
      // Pan map
      if(mapRef.current) mapRef.current.setView([lat, lng], 15);
  };

  // Calculate Route when Destination changes
  useEffect(() => {
      if (!navDestination || !mapRef.current) return;

      const fetchRoute = async () => {
          const start = userLocation;
          const end = navDestination;
          
          // Use OSRM for routing
          const url = `https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
          
          try {
              const res = await fetch(url);
              const data = await res.json();
              
              if (data.routes && data.routes.length > 0) {
                  const route = data.routes[0];
                  const geojson = route.geometry;
                  
                  // Draw Route
                  if (routeLayerRef.current) mapRef.current.removeLayer(routeLayerRef.current);
                  
                  routeLayerRef.current = L.geoJSON(geojson, {
                      style: { color: '#6366f1', weight: 6, opacity: 0.8, lineCap: 'round' }
                  }).addTo(mapRef.current);
                  
                  // Fit bounds
                  mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });

                  // Stats
                  const distKm = (route.distance / 1000).toFixed(1);
                  const durationMin = Math.round(route.duration / 60);
                  
                  setRouteData({ dist: distKm, time: durationMin.toString() });
              }
          } catch (e) {
              console.error("Routing error:", e);
          }
      };

      fetchRoute();
  }, [navDestination, userLocation]);

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
      <div id="map" ref={mapContainerRef} className="absolute inset-0 z-0 bg-gray-200" />
      
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
          {/* Layer Switcher */}
          <button 
            onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
            className="bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 text-gray-700 transition-all"
            title="Byt karttyp"
          >
             <Layers size={20} />
          </button>
          
          {/* Location Share Toggle */}
          <button 
            onClick={() => setIsSharingLocation(!isSharingLocation)}
            className={`p-3 rounded-xl shadow-lg transition-all ${isSharingLocation ? 'bg-green-500 text-white animate-pulse' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            title="Dela plats"
          >
             <Share2 size={20} />
          </button>
      </div>

      {/* Navigation Panel (Minimizable) */}
      <div className={`absolute top-4 left-4 z-[400] transition-all duration-300 ${isNavCollapsed ? 'w-auto' : 'w-72'}`}>
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            
            {/* Nav Header */}
            <div 
                className="bg-gray-900 p-3 flex items-center justify-between cursor-pointer"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            >
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Navigation size={14} className="text-primary"/> 
                    {isNavCollapsed ? '' : 'Reseplanerare'}
                </h3>
                {isNavCollapsed ? <ChevronDown size={16} className="text-white"/> : <ChevronUp size={16} className="text-white"/>}
            </div>
            
            {!isNavCollapsed && (
                <div className="p-3 space-y-3">
                    {/* Inputs */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium">Min plats</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Sök destination i Sverige..."
                                value={customAddress}
                                onChange={(e) => {
                                    setCustomAddress(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <MapPin size={14} className="absolute left-2.5 top-2.5 text-red-500" />
                            
                            {/* Autocomplete List */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                    {suggestions.map((place, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectSuggestion(place)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-xs flex flex-col"
                                        >
                                            <span className="font-bold text-gray-800">{place.display_name.split(',')[0]}</span>
                                            <span className="text-[10px] text-gray-500 truncate">{place.display_name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Arrival Time Input */}
                        <div className="flex items-center gap-2 mt-2">
                             <Clock size={14} className="text-gray-400" />
                             <input 
                                type="time" 
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                                className="bg-transparent text-xs text-gray-600 outline-none" 
                             />
                             <span className="text-[10px] text-gray-400 ml-auto">Ankomsttid</span>
                        </div>
                    </div>

                    {/* Results Card */}
                    {routeData && (
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 animate-slide-up">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Ruttinfo</span>
                                <span className="bg-white text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Gång</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-900">
                                 <div className="flex flex-col">
                                     <span className="text-2xl font-bold leading-none">{routeData.time}<span className="text-sm font-normal text-gray-500">min</span></span>
                                     <span className="text-[10px] text-gray-500">Restid</span>
                                 </div>
                                 <div className="h-8 w-[1px] bg-blue-200 mx-2"></div>
                                 <div className="flex flex-col items-end">
                                     <span className="text-2xl font-bold leading-none">{routeData.dist}<span className="text-sm font-normal text-gray-500">km</span></span>
                                     <span className="text-[10px] text-gray-500">Avstånd</span>
                                 </div>
                            </div>
                            {arrivalTime && (
                                <div className="mt-2 pt-2 border-t border-blue-100 text-center">
                                    <p className="text-xs text-blue-700">
                                        Du måste gå senast <b>{(() => {
                                            const [h, m] = arrivalTime.split(':').map(Number);
                                            const d = new Date();
                                            d.setHours(h, m - parseInt(routeData.time));
                                            return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                                        })()}</b>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
