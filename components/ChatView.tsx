
import React, { useState, useRef, useEffect } from 'react';
import { Activity, ChatMessage, UserProfile } from '../types';
import Avatar from './Avatar';
import { Send, Mic, X, Play, Pause, ArrowLeft } from 'lucide-react';

interface ChatViewProps {
  activity: Activity;
  user: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendAudio: (audioBlob: Blob, duration: number) => void;
  onClose: () => void;
  onUserClick?: (userId: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ activity, user, messages, onSendMessage, onSendAudio, onClose, onUserClick }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onSendAudio(audioBlob, recordingDuration);
        setRecordingDuration(0);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Kunde inte starta mikrofonen. Kontrollera behörigheter.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-200 rounded-full">
                <ArrowLeft size={20} />
            </button>
            <Avatar 
                id={activity.host.avatarId} 
                size="sm" 
                onClick={() => onUserClick?.(activity.host.id)} 
            />
            <div>
                <h3 className="font-bold text-gray-900 leading-tight">{activity.title}</h3>
                <p className="text-xs text-gray-500">{messages.length} meddelanden</p>
            </div>
        </div>
        <button onClick={onClose} className="hidden md:block bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors">
            <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 opacity-60">
                <div className="bg-gray-100 p-4 rounded-full">
                    <Send size={32} />
                </div>
                <p className="text-sm font-medium">Starta konversationen!</p>
            </div>
        ) : (
            messages.map((msg) => {
                const isMe = msg.senderId === 'me';
                return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <Avatar 
                            id={msg.avatarId} 
                            size="sm" 
                            className="mt-1" 
                            onClick={() => onUserClick?.(msg.senderId)}
                        />
                        <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-600">{msg.senderName}</span>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            
                            <div className={`p-3 rounded-2xl shadow-sm ${
                                isMe 
                                    ? 'bg-primary text-white rounded-tr-none' 
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                }`
                            }>
                                {msg.type === 'text' ? (
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                ) : (
                                    <AudioMessage content={msg.content} duration={msg.duration || 0} isMe={isMe} />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
            {isRecording ? (
                <div className="flex-grow flex items-center justify-between bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 animate-pulse">
                    <div className="flex items-center gap-2 font-bold">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        <span>Spelar in... {new Date(recordingDuration * 1000).toISOString().substr(14, 5)}</span>
                    </div>
                    <button onClick={stopRecording} className="bg-white text-red-500 p-1.5 rounded-full shadow-sm hover:scale-110 transition-transform">
                        <Send size={18} fill="currentColor" />
                    </button>
                </div>
            ) : (
                <>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                        placeholder="Skriv ett meddelande..."
                        className="flex-grow px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                    />
                    
                    {inputText.trim() ? (
                        <button 
                            onClick={handleSendText}
                            className="bg-primary hover:bg-sky-600 text-white p-3 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={startRecording}
                            className="bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Håll in för att spela in (klicka för demo)"
                        >
                            <Mic size={20} />
                        </button>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

// Mini Component for Audio Player
const AudioMessage: React.FC<{ content: string; duration: number; isMe: boolean }> = ({ content, duration, isMe }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio(content);
            audioRef.current.onended = () => setIsPlaying(false);
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex items-center gap-3 min-w-[150px]">
            <button 
                onClick={togglePlay}
                className={`p-2 rounded-full ${isMe ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
            >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            <div className="flex flex-col flex-grow">
                {/* Visual Fake Waveform */}
                <div className="flex items-center gap-0.5 h-6">
                    {[...Array(15)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-1 rounded-full ${isMe ? 'bg-white/60' : 'bg-gray-400'} ${isPlaying ? 'animate-pulse' : ''}`}
                            style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                        />
                    ))}
                </div>
                <span className={`text-[10px] ${isMe ? 'text-white/80' : 'text-gray-500'} font-medium`}>
                    Röstmeddelande • {duration}s
                </span>
            </div>
        </div>
    );
}

export default ChatView;
