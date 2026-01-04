
import React, { useState, useEffect, useCallback } from 'react';
import LoadingScreen from './components/LoadingScreen';
import WeatherCard from './components/WeatherCard';
import { GeolocationState, WeatherData } from './types';
import { fetchWeatherWithGemini } from './services/gemini';

const App: React.FC = () => {
  const [geo, setGeo] = useState<GeolocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: true,
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearch, setCurrentSearch] = useState<string | null>(null);

  const getPosition = useCallback(() => {
    setGeo(prev => ({ ...prev, loading: true, error: null }));
    setCurrentSearch(null); // Clear search when requesting current position
    if (!navigator.geolocation) {
      setGeo({ lat: null, lng: null, error: "Geolocation not supported", loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setGeo({ lat: null, lng: null, error: err.message, loading: false });
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchWeather = useCallback(async (location: { lat: number; lng: number } | string) => {
    try {
      setIsRefreshing(true);
      const data = await fetchWeatherWithGemini(location);
      setWeather(data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch weather data. Please try again.");
    } finally {
      setIsRefreshing(false);
      setGeo(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setCurrentSearch(searchQuery);
    fetchWeather(searchQuery);
  };

  useEffect(() => {
    getPosition();
  }, [getPosition]);

  useEffect(() => {
    if (geo.lat && geo.lng && !currentSearch) {
      fetchWeather({ lat: geo.lat, lng: geo.lng });
    }
  }, [geo.lat, geo.lng, currentSearch, fetchWeather]);

  if (geo.loading && !weather) return <LoadingScreen />;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-900 shadow-xl flex flex-col relative overflow-hidden">
      {/* App Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              SkyCast Weather
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (currentSearch) {
                  fetchWeather(currentSearch);
                } else if (geo.lat && geo.lng) {
                  fetchWeather({ lat: geo.lat, lng: geo.lng });
                } else {
                  getPosition();
                }
              }}
              disabled={isRefreshing}
              className={`p-2 rounded-full hover:bg-slate-800 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button 
              onClick={getPosition}
              disabled={isRefreshing}
              className={`p-2 rounded-full hover:bg-slate-800 transition-all ${!currentSearch ? 'text-blue-400' : 'text-slate-300'}`}
              title="Current Location"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city (e.g. London, Tokyo)"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-5 scroll-smooth">
        {geo.error && !currentSearch && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-red-200 mb-6">
            <p className="font-bold">Location Access Required</p>
            <p className="text-sm opacity-80">{geo.error}</p>
            <p className="text-xs mt-2 opacity-60 italic">Search for a city above to view weather elsewhere.</p>
            <button 
              onClick={getPosition}
              className="mt-3 text-xs bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Retry Permission
            </button>
          </div>
        )}

        {weather ? (
          <WeatherCard data={weather} />
        ) : isRefreshing ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
             <div className="animate-spin mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </div>
             <p>Consulting Weather Patterns...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
             <div className="animate-bounce mb-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
             </div>
             <p>Search or use GPS to start</p>
          </div>
        )}
      </main>

      {/* Persistent Bottom Bar */}
      <nav className="bg-slate-800/90 border-t border-slate-700 p-4 sticky bottom-0 z-30 flex justify-around items-center">
        <button className={`flex flex-col items-center gap-1 ${!currentSearch ? 'text-blue-400' : 'text-slate-500'}`} onClick={getPosition}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          <span className="text-[10px] font-bold uppercase">Now</span>
        </button>
        <button 
           className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
           onClick={() => alert("Forecast view coming soon!")}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-bold uppercase">Weekly</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
          onClick={() => alert("Detailed Radar Map coming soon!")}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-[10px] font-bold uppercase">Maps</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
