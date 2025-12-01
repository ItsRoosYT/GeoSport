
import React, { useState, useEffect, useRef } from 'react';
import { Activity, ActivityCategory, JoinType, SkillLevel, UserProfile } from '../types';
import { ArrowLeft, MapPin, Calendar, Users, AlertCircle, Sparkles, Search, X, Check, ChevronDown, Lock, Globe, FileText } from 'lucide-react';
import { GOTHENBURG_CENTER } from '../constants';
import { GoogleGenAI } from "@google/genai";

// Declare Leaflet global
declare const L: any;

interface CreateActivityViewProps {
  user: UserProfile;
  onCreate: (activity: Activity) => void;
  onCancel: () => void;
}

const CreateActivityView: React.FC<CreateActivityViewProps> = ({ user, onCreate, onCancel }) => {
  // Helper to get today in Local Time (YYYY-MM-DD)
  const getToday = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ActivityCategory.PROMENAD,
    date: getToday(),
    time: '18:00',
    durationMin: 60,
    locationName: '',
    maxParticipants: 5,
    joinType: JoinType.OPEN,
    skillLevel: SkillLevel.ALLA
  });

  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Map Picker State
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // AI Description Generation
  const handleGenerateDescription = async () => {
    if (!formData.title) {
        alert("Skriv in en rubrik först!");
        return;
    }

    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite', 
            contents: `Skriv en kort, inbjudande beskrivning (max 2 meningar) för: ${formData.title} (${formData.category}). Peppigt tonläge!`,
        });
        
        if (response.text) {
            setFormData(prev => ({ ...prev, description: response.text.trim() }));
        }
    } catch (error) {
        console.error("AI Error:", error);
    } finally {
        setIsGenerating(false);
    }
  };

  // Real-time Autocomplete (Sweden Only)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.locationName.length > 2 && showSuggestions) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.locationName)}&limit=5&addressdetails=1&countrycodes=se`);
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
  }, [formData.locationName, showSuggestions]);

  const handleSelectSuggestion = (place: any) => {
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);
      
      setFormData(prev => ({
          ...prev, 
          locationName: place.display_name.split(',')[0] // Short name
      }));
      setCoords({ lat, lng });
      setSuggestions([]);
      setShowSuggestions(false);
  };

  // Initialize Map Picker
  useEffect(() => {
      if (isMapPickerOpen && mapContainerRef.current && !mapInstanceRef.current) {
          if (typeof L === 'undefined') return;

          const initialLat = coords?.lat || GOTHENBURG_CENTER.lat;
          const initialLng = coords?.lng || GOTHENBURG_CENTER.lng;

          const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              attribution: '&copy; OpenStreetMap &copy; CARTO'
          }).addTo(map);

          mapInstanceRef.current = map;
          
          if (coords) {
              markerRef.current = L.marker([coords.lat, coords.lng]).addTo(map);
          }

          map.on('click', async (e: any) => {
              const { lat, lng } = e.latlng;
              
              if (markerRef.current) {
                  markerRef.current.setLatLng([lat, lng]);
              } else {
                  markerRef.current = L.marker([lat, lng]).addTo(map);
              }

              try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                  const data = await res.json();
                  const name = data.display_name ? data.display_name.split(',')[0] : 'Vald plats';
                  
                  setFormData(prev => ({ ...prev, locationName: name }));
                  setCoords({ lat, lng });
              } catch (err) {
                  setCoords({ lat, lng });
              }
          });

          setTimeout(() => map.invalidateSize(), 100);
      }
  }, [isMapPickerOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCoords = coords || { 
        lat: GOTHENBURG_CENTER.lat + (Math.random() - 0.5) * 0.02, 
        lng: GOTHENBURG_CENTER.lng + (Math.random() - 0.5) * 0.02 
    };

    const newActivity: Activity = {
        id: Date.now().toString(),
      host: {
        id: 'me',
        name: user.name,
        avatarId: user.avatarId,
        avatarConfig: user.avatarConfig
      },
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date || getToday(),
      time: formData.time || '18:00',
      durationMin: formData.durationMin,
      locationName: formData.locationName || 'Centralt',
      locationCity: 'Göteborg',
      coordinates: finalCoords,
      currentParticipants: 1,
      maxParticipants: formData.maxParticipants,
      skillLevel: formData.skillLevel,
      joinType: formData.joinType,
      urgentText: formData.maxParticipants - 1 <= 2 ? 'Få platser!' : undefined
    };

    onCreate(newActivity);
  };

  return (
    <div className="bg-white min-h-screen animate-slide-up pb-20">
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Skapa Aktivitet</h2>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rubrik</label>
              <input 
                required
                type="text" 
                placeholder="T.ex. Söndagspromenad"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-lg focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Beskrivning</label>
                <button 
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg transition-colors border border-sky-100 hover:border-sky-200"
                >
                    <Sparkles size={12} className={isGenerating ? "animate-spin" : ""} />
                    {isGenerating ? 'Tänker...' : 'AI-förslag'}
                </button>
              </div>
              <textarea 
                required
                placeholder="Berätta lite om aktiviteten..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl min-h-[100px] resize-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Time & Date (Clean Inputs) */}
          <div className="space-y-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
              <Calendar size={20} className="text-primary"/> Tid & Datum
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Datum</label>
                     <input 
                        type="date"
                        required
                        min={getToday()}
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                     />
                </div>

                <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tid</label>
                     <input 
                        type="time"
                        required
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                     />
                </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Category & Level */}
          <div className="space-y-4">
             <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <Users size={20} className="text-primary"/> Detaljer
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Kategori</label>
                <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 rounded-l-xl flex items-center justify-center pointer-events-none group-hover:border-primary">
                         <span className="text-xl">🏅</span>
                    </div>
                    <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as ActivityCategory})}
                        className="w-full py-4 pl-16 pr-10 bg-white border border-gray-200 rounded-xl appearance-none font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/20 group-hover:border-primary transition-all cursor-pointer"
                    >
                        {Object.values(ActivityCategory).map(c => (
                        <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
                </div>
                
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nivå</label>
                <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 rounded-l-xl flex items-center justify-center pointer-events-none group-hover:border-primary">
                         <span className="text-xl">📊</span>
                    </div>
                    <select 
                        value={formData.skillLevel}
                        onChange={e => setFormData({...formData, skillLevel: e.target.value as SkillLevel})}
                        className="w-full py-4 pl-16 pr-10 bg-white border border-gray-200 rounded-xl appearance-none font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/20 group-hover:border-primary transition-all cursor-pointer"
                    >
                        {Object.values(SkillLevel).map(l => (
                        <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
                </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section: Join Type / Access */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
               <Lock size={20} className="text-primary"/> Tillgänglighet
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, joinType: JoinType.OPEN})}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.joinType === JoinType.OPEN ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                >
                    <div className="flex items-center gap-2 mb-2 font-bold text-gray-800">
                        <Globe size={18} className={formData.joinType === JoinType.OPEN ? 'text-primary' : 'text-gray-400'}/>
                        Öppen
                    </div>
                    <p className="text-xs text-gray-500">Alla kan gå med direkt. Bäst för sociala aktiviteter.</p>
                </button>

                <button
                    type="button"
                    onClick={() => setFormData({...formData, joinType: JoinType.APPLY})}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.joinType === JoinType.APPLY ? 'border-yellow-400 bg-yellow-50 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                >
                    <div className="flex items-center gap-2 mb-2 font-bold text-gray-800">
                        <FileText size={18} className={formData.joinType === JoinType.APPLY ? 'text-yellow-600' : 'text-gray-400'}/>
                        Ansökan
                    </div>
                    <p className="text-xs text-gray-500">Du godkänner deltagare. Bra för tävling/nivåanpassning.</p>
                </button>

                <button
                    type="button"
                    onClick={() => setFormData({...formData, joinType: JoinType.PRIVATE})}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.joinType === JoinType.PRIVATE ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                >
                    <div className="flex items-center gap-2 mb-2 font-bold text-gray-800">
                        <Lock size={18} className={formData.joinType === JoinType.PRIVATE ? 'text-red-500' : 'text-gray-400'}/>
                        Privat
                    </div>
                    <p className="text-xs text-gray-500">Kräver kod. För slutna sällskap, skolor eller föreningar.</p>
                </button>
            </div>
            
            {formData.joinType === JoinType.PRIVATE && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700 flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={16} />
                    <span>Deltagare måste ange koden <b>1234</b> för att gå med.</span>
                </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Section: Location */}
          <div className="space-y-4">
             <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <MapPin size={20} className="text-primary"/> Plats
             </h3>
             
            {/* Enhanced Location Picker */}
            <div className="relative">
              <div className="flex gap-2">
                  <div className="relative flex-grow group">
                    <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors" size={20}/>
                    <input 
                        required
                        type="text" 
                        placeholder="Sök adress eller plats i Sverige..."
                        value={formData.locationName}
                        onChange={e => {
                            setFormData({...formData, locationName: e.target.value});
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full pl-12 p-4 bg-white border border-gray-200 rounded-xl font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-fade-in divide-y divide-gray-50">
                            {suggestions.map((place, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectSuggestion(place)}
                                    className="w-full text-left px-5 py-3.5 hover:bg-blue-50 transition-colors flex flex-col group/item"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-800 group-hover/item:text-primary">{place.display_name.split(',')[0]}</span>
                                        {i === 0 && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Bästa match</span>}
                                    </div>
                                    <span className="text-xs text-gray-500 truncate mt-0.5">{place.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setIsMapPickerOpen(true)}
                    className={`px-4 rounded-xl border transition-all active:scale-95 flex flex-col items-center justify-center min-w-[80px] ${coords ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'}`}
                    title="Välj på karta"
                  >
                      {coords ? <><Check size={20}/><span className="text-[10px] font-bold mt-1">Vald</span></> : <><MapPin size={24}/><span className="text-[10px] font-bold mt-1">Karta</span></>}
                  </button>
              </div>
            </div>
            
            {/* Embedded Map Picker */}
            {isMapPickerOpen && (
                <div className="relative w-full h-72 rounded-2xl overflow-hidden border-2 border-primary shadow-lg animate-scale-up">
                    <div ref={mapContainerRef} className="w-full h-full" />
                    <button 
                        type="button"
                        onClick={() => setIsMapPickerOpen(false)} 
                        className="absolute top-3 right-3 z-[400] bg-white text-gray-600 hover:text-red-500 p-2 rounded-full shadow-md transition-transform hover:scale-110"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-white/95 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-primary shadow-lg pointer-events-none flex items-center gap-2">
                        <MapPin size={12} fill="currentColor"/> Klicka för att välja position
                    </div>
                </div>
            )}
          </div>

          <div className="pt-6 pb-6">
            <button 
              type="submit"
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all hover:scale-[1.01] active:scale-[0.99] text-lg flex items-center justify-center gap-2"
            >
              Publicera Aktivitet <ArrowLeft size={20} className="rotate-180" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateActivityView;
