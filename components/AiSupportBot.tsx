
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, MapPin } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { GOTHENBURG_CENTER } from '../constants';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: number;
  groundingLinks?: { title: string; uri: string }[];
}

const SUGGESTED_QUESTIONS = [
  "Hur skapar jag en aktivitet?",
  "Hitta utegym nära mig",
  "Var finns bra padelbanor?",
  "Är appen säker?"
];

const AiSupportBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hej! 👋 Jag är GeoSportys AI-assistent. Jag kan hjälpa dig med appen eller hitta platser i Göteborg. Vad undrar du över?",
      sender: 'bot',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const lowerText = text.toLowerCase();
        
        // Detect intent: Maps/Location vs General Chat
        const isMapQuery = ['var', 'hitta', 'ligger', 'plats', 'karta', 'gym', 'restaurang', 'café', 'park', 'nära'].some(k => lowerText.includes(k));

        let responseText = '';
        let groundingLinks: { title: string; uri: string }[] = [];

        if (isMapQuery) {
            // REQ: Maps Grounding using gemini-2.5-flash
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: text,
                config: {
                    tools: [{ googleMaps: {} }],
                    toolConfig: {
                        retrievalConfig: {
                            latLng: {
                                latitude: GOTHENBURG_CENTER.lat,
                                longitude: GOTHENBURG_CENTER.lng
                            }
                        }
                    }
                }
            });
            responseText = response.text || "Jag kunde inte hitta den informationen just nu.";
            
            // Extract Maps grounding data
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                     groundingLinks.push({ title: chunk.web.title || "Webblänk", uri: chunk.web.uri });
                }
            });

        } else {
            // REQ: General Chat using gemini-3-pro-preview
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: text,
                config: {
                    systemInstruction: "Du är GeoSportys trevliga och hjälpsamma AI-assistent. Du hjälper användare med frågor om appen (skapa aktiviteter, profiler, kostnad, säkerhet) och konverserar naturligt på svenska.",
                }
            });
            responseText = response.text || "Jag har lite svårt att svara på det just nu.";
        }

        // Add Bot Response
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'bot',
            timestamp: Date.now(),
            groundingLinks: groundingLinks.length > 0 ? groundingLinks : undefined
        };
        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error("Gemini Error:", error);
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "Ursäkta, jag fick problem med anslutningen till AI-tjänsten. Försök igen om en stund.",
            sender: 'bot',
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-4 animate-slide-up flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">GeoSporty AI</h3>
                <p className="text-[10px] text-gray-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> Gemini Powered
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50 space-y-3 h-80">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
                {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                        {msg.groundingLinks.map((link, i) => (
                            <a 
                                key={i} 
                                href={link.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-200 hover:bg-green-100 transition-colors"
                            >
                                <MapPin size={10} />
                                {link.title}
                            </a>
                        ))}
                    </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder="Fråga om appen eller platser..."
              className="flex-grow px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button 
              onClick={() => handleSendMessage(inputValue)}
              className="bg-primary hover:bg-sky-600 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-gray-900 hover:bg-gray-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group relative"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>
    </div>
  );
};

export default AiSupportBot;
