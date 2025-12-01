
import React from 'react';
import { X, UserPlus, UserCheck, Star, Shield, MessageCircle } from 'lucide-react';
import Avatar from './Avatar';
import { Participant } from '../types';

interface UserDetailModalProps {
  user: Participant;
  onClose: () => void;
  isFriend: boolean;
  onToggleFriend: () => void;
  rating: number;
  onRate: (rating: number) => void;
  onChat: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  user, 
  onClose, 
  isFriend, 
  onToggleFriend, 
  rating, 
  onRate,
  onChat
}) => {
  
  const bio = "En aktiv deltagare i GeoSporty-communityt.";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header Image / Background */}
        <div className="h-32 bg-gradient-to-br from-primary to-blue-400 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 p-1.5 bg-white rounded-full shadow-lg">
                <Avatar 
                    id={user.avatarId} 
                    config={user.avatarConfig} 
                    size="xl" 
                />
            </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-6 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <Shield size={16} className="text-green-500" fill="currentColor" />
            </div>
            <p className="text-gray-500 text-sm mb-6 px-4">{bio}</p>

            {/* Stats (Visual only) */}
            <div className="flex justify-center gap-8 mb-8 border-b border-t border-gray-100 py-4">
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">-</p>
                    <p className="text-xs font-bold text-gray-400 uppercase">Aktiviteter</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">New</p>
                    <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">-</p>
                    <p className="text-xs font-bold text-gray-400 uppercase">Vänner</p>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onToggleFriend}
                        className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            isFriend 
                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {isFriend ? <UserCheck size={18} /> : <UserPlus size={18} />}
                        {isFriend ? 'Vänner' : 'Följ'}
                    </button>
                    
                    <button 
                        onClick={onChat}
                        className="py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-primary text-white hover:bg-sky-600 shadow-md"
                    >
                        <MessageCircle size={18} />
                        Meddelande
                    </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Betygsätt din upplevelse</p>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star}
                                onClick={() => onRate(star)}
                                className="transition-transform hover:scale-110 active:scale-90"
                            >
                                <Star 
                                    size={28} 
                                    className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetailModal;
