import React from 'react';
import { Clock, MapPin, Users, AlertCircle, Lock, Send, CheckCircle } from 'lucide-react';
import { Activity, JoinType } from '../types';
import { getCategoryColor } from '../constants';
import Avatar from './Avatar';

interface ActivityCardProps {
  activity: Activity;
  onJoin: (id: string) => void;
  onHostClick?: () => void;
  isJoined: boolean;
  isApplied?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onJoin, onHostClick, isJoined, isApplied }) => {
  const percentage = (activity.currentParticipants / activity.maxParticipants) * 100;

  // Render Button Logic
  const renderButton = () => {
    if (isJoined) {
        return (
            <button 
                onClick={() => onJoin(activity.id)}
                className="w-full py-3.5 rounded-xl text-base font-bold text-center bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
            >
                <CheckCircle size={18} />
                Öppna Chatt
            </button>
        );
    }

    if (isApplied) {
        return (
            <button 
                onClick={() => onJoin(activity.id)}
                className="w-full py-3.5 rounded-xl text-base font-bold bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 animate-pulse"
            >
                <Users size={18} />
                Avbryt ansökan
            </button>
        );
    }

    // Private Activity - NOW RED
    if (activity.joinType === JoinType.PRIVATE) {
        return (
            <button 
                onClick={() => onJoin(activity.id)}
                className="w-full py-3.5 rounded-xl text-base font-bold shadow-sm bg-red-600 hover:bg-red-700 text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Lock size={18} />
                Privat
            </button>
        );
    }

    // Application Required
    if (activity.joinType === JoinType.APPLY) {
        return (
            <button 
                onClick={() => onJoin(activity.id)}
                className="w-full py-3.5 rounded-xl text-base font-bold shadow-sm bg-yellow-400 hover:bg-yellow-500 text-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Send size={18} />
                Skicka ansökan
            </button>
        );
    }

    // Default Open
    return (
        <button 
            onClick={() => onJoin(activity.id)}
            className="w-full py-3.5 rounded-xl text-base font-bold transition-all shadow-sm bg-gray-900 hover:bg-primary text-white active:scale-[0.98]"
        >
            Gå med
        </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
      
      {/* Header: Host & Category */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 group/host cursor-pointer" onClick={onHostClick}>
          <Avatar id={activity.host.avatarId} size="md" alt={activity.host.name} />
          <div>
            <p className="font-bold text-gray-900 leading-none group-hover/host:text-primary transition-colors">{activity.host.name}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Arrangör</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(activity.category)}`}>
            {activity.category}
            </span>
            {activity.urgentText && !isJoined && (
                <div className="flex items-center gap-1 text-orange-600 px-2 py-0.5 rounded-md text-xs font-bold animate-pulse">
                    <AlertCircle size={12} />
                    <span>{activity.urgentText}</span>
                </div>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-5 flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">{activity.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{activity.description}</p>
        
        <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-gray-600">
                <Clock className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{activity.date}, {activity.time} <span className="text-gray-400 font-normal">({activity.durationMin} min)</span></span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{activity.locationName}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
                 <Users className="text-gray-400 w-4 h-4 flex-shrink-0" />
                 <span className="text-sm font-medium text-gray-800">{activity.currentParticipants} / {activity.maxParticipants} deltagare</span>
                 <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">{activity.skillLevel}</span>
            </div>
        </div>
      </div>

      {/* Footer: Progress & Action */}
      <div className="mt-auto">
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
            <div 
                className={`h-2 rounded-full transition-all duration-500 ${percentage >= 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                style={{ width: `${percentage}%` }}
            />
        </div>

        {renderButton()}
       
      </div>
    </div>
  );
};

export default ActivityCard;