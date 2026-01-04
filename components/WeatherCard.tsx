
import React, { useState } from 'react';
import { WeatherData, WindUnit } from '../types';

interface Props {
  data: WeatherData;
}

const WeatherCard: React.FC<Props> = ({ data }) => {
  const [windUnit, setWindUnit] = useState<WindUnit>('mph');

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-400';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-400';
    return 'text-red-400';
  };

  const getWindDisplay = () => {
    switch (windUnit) {
      case 'kph': return `${data.windSpeedKph} km/h`;
      case 'ms': return `${data.windSpeedMs} m/s`;
      case 'mph':
      default: return `${data.windSpeedMph} mph`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Temperature Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 5.106a.75.75 0 00-1.06 0l-1.591 1.591a.75.75 0 101.06 1.061l1.591-1.591a.75.75 0 000-1.061zM21 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25A.75.75 0 0121 12zM17.834 18.894a.75.75 0 001.06-1.06l-1.591-1.591a.75.75 0 10-1.061 1.06l1.591 1.591a.75.75 0 001.061 0zM12 17.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V18a.75.75 0 01.75-.75zM5.106 17.834a.75.75 0 001.06 1.06l1.591-1.591a.75.75 0 10-1.06-1.061l-1.591 1.591a.75.75 0 000 1.061zM6.75 12a.75.75 0 01-.75.75H3.75a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM5.106 5.106a.75.75 0 010 1.06L3.515 7.757a.75.75 0 01-1.06-1.061l1.591-1.591a.75.75 0 011.06 0z" />
            </svg>
        </div>
        
        <div className="relative z-10">
          <p className="text-blue-100 font-medium mb-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {data.location}
          </p>
          <div className="flex items-end gap-2 mb-6">
            <h1 className="text-7xl font-bold tracking-tighter">{data.tempF.toFixed(0)}°</h1>
            <div className="pb-2">
                <p className="text-2xl font-light text-blue-200">Fahrenheit</p>
                <div className="flex gap-3 text-sm text-blue-100/80">
                    <span>{data.tempC.toFixed(1)}°C</span>
                    <span>{data.tempK.toFixed(1)}K</span>
                </div>
            </div>
          </div>
          <p className="text-2xl font-semibold capitalize">{data.condition}</p>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">Wind Speed</p>
            <p className="text-xl font-bold">{getWindDisplay()}</p>
          </div>
          <div className="flex gap-1 mt-3 bg-slate-900/50 p-1 rounded-lg">
            {(['mph', 'kph', 'ms'] as WindUnit[]).map((unit) => (
              <button
                key={unit}
                onClick={() => setWindUnit(unit)}
                className={`flex-1 text-[10px] py-1 rounded-md transition-all font-bold uppercase ${
                  windUnit === unit 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {unit === 'ms' ? 'm/s' : unit === 'kph' ? 'km/h' : unit}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Humidity</p>
          <p className="text-xl font-bold">{data.humidity}%</p>
          <div className="w-full bg-slate-700 h-1 mt-2 rounded-full">
            <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${data.humidity}%` }}></div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Chance of Rain</p>
          <p className="text-xl font-bold">{data.rainChance}%</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Air Quality (AQI)</p>
          <p className={`text-xl font-bold ${getAqiColor(data.aqi)}`}>{data.aqi}</p>
          <p className="text-xs text-slate-500">{data.aqiDescription}</p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            AI Insight
        </h3>
        <p className="text-slate-200 leading-relaxed italic">"{data.summary}"</p>
      </div>

      {/* Weather Alerts */}
      {data.alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Active Alerts
          </h3>
          <ul className="space-y-2">
            {data.alerts.map((alert, idx) => (
              <li key={idx} className="text-red-200 text-sm bg-red-500/20 rounded-lg p-3">
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      <div className="pb-10">
        <p className="text-xs text-slate-500 mb-2 px-1">Grounded Sources:</p>
        <div className="flex flex-wrap gap-2">
            {data.sources.map((source, idx) => (
                <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded transition-colors"
                >
                    {source.title.substring(0, 20)}...
                </a>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
