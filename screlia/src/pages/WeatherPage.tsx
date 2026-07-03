import React, { useState } from 'react';
import { getAI, MODELS } from '../services/gemini';
import { CloudRain, Search, Wind, Droplets, Thermometer, MapPin, Loader2, Sun, Cloud, CloudLightning, Snowflake } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';
import { Type } from '@google/genai';

interface WeatherData {
  temperature: string;
  condition: string;
  humidity: string;
  wind: string;
  locationName: string;
  forecast: {
    time: string;
    temp: string;
    condition: string;
  }[];
}

export default function WeatherPage() {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useSettings();

  const fetchWeather = async (searchLocation: string) => {
    if (!searchLocation.trim()) return;
    
    setLoading(true);
    setWeatherData(null);
    setError(null);

    try {
      const genAI = getAI(filters.apiKey);
      
      const response = await genAI.models.generateContent({
        model: MODELS.search,
        contents: `${searchLocation} için güncel hava durumu ve bugünün tahmini`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temperature: { type: Type.STRING, description: "Birim ile güncel sıcaklık (örn., 22°C)" },
              condition: { type: Type.STRING, description: "Kısa hava durumu bilgisi (örn., Güneşli, Parçalı Bulutlu, Yağmurlu)" },
              humidity: { type: Type.STRING, description: "Nem yüzdesi" },
              wind: { type: Type.STRING, description: "Rüzgar hızı ve yönü" },
              locationName: { type: Type.STRING, description: "Konum adı (Şehir, Ülke)" },
              forecast: {
                type: Type.ARRAY,
                description: "Önümüzdeki saatler veya günün kalan zamanları için tahmin",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING, description: "Günün saati (örn., 14:00, Akşam)" },
                    temp: { type: Type.STRING, description: "O saatteki sıcaklık" },
                    condition: { type: Type.STRING, description: "O saatteki hava durumu tahmini" }
                  },
                  required: ["time", "temp", "condition"]
                }
              }
            },
            required: ["temperature", "condition", "humidity", "wind", "locationName", "forecast"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text) as WeatherData;
        setWeatherData(data);
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Hava durumu bilgisi alınamadı. Lütfen API anahtarınızı kontrol edin veya farklı bir konum deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(location);
  };

  const getWeatherIcon = (condition: string, className: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('sun') || lower.includes('clear')) return <Sun className={className} />;
    if (lower.includes('rain') || lower.includes('shower')) return <CloudRain className={className} />;
    if (lower.includes('storm') || lower.includes('thunder')) return <CloudLightning className={className} />;
    if (lower.includes('snow') || lower.includes('ice')) return <Snowflake className={className} />;
    return <Cloud className={className} />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
          <CloudRain className="w-8 h-8 text-indigo-600" />
          Hava Durumu Merkezi
        </h2>
        <p className="text-theme-secondary">Google Arama destekli gerçek zamanlı hava durumu.</p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <MapPin className="absolute left-5 text-theme-secondary w-5 h-5 group-focus-within:text-indigo-500 transition-colors duration-300" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Şehir veya konum girin..."
            className="w-full pl-14 pr-14 py-4 bg-theme-secondary/80 backdrop-blur-xl text-theme-primary border border-theme rounded-2xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 text-lg"
          />
          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-md hover:shadow-indigo-500/30"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50/10 border border-red-200/20 text-red-500 rounded-2xl text-center backdrop-blur-sm">
          {error}
        </div>
      )}

      {weatherData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Weather Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-medium text-indigo-100 flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="w-5 h-5" />
                  {weatherData.locationName}
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  {getWeatherIcon(weatherData.condition, "w-16 h-16 text-yellow-300")}
                  <div className="text-6xl font-bold tracking-tighter">
                    {weatherData.temperature}
                  </div>
                </div>
                <p className="text-xl font-medium text-indigo-100">{weatherData.condition}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 border border-white/10">
                  <Droplets className="w-6 h-6 text-blue-300" />
                  <div>
                    <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Nem</p>
                    <p className="text-lg font-medium">{weatherData.humidity}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 border border-white/10">
                  <Wind className="w-6 h-6 text-emerald-300" />
                  <div>
                    <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Rüzgar</p>
                    <p className="text-lg font-medium">{weatherData.wind}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Array */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weatherData.forecast.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-theme-secondary/80 backdrop-blur-xl p-6 rounded-2xl border border-theme shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center gap-3"
              >
                <p className="text-sm font-medium text-theme-secondary">{item.time}</p>
                {getWeatherIcon(item.condition, "w-8 h-8 text-indigo-500")}
                <p className="text-xl font-bold text-theme-primary">{item.temp}</p>
                <p className="text-xs text-theme-secondary line-clamp-1">{item.condition}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      
      {!weatherData && !loading && !error && (
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
          <div className="w-16 h-16 bg-indigo-100/50 rounded-2xl flex items-center justify-center animate-pulse">
            <CloudRain className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-theme-secondary">Hava durumu için bir konum girin.</p>
          </div>
        </div>
      )}
    </div>
  );
}
