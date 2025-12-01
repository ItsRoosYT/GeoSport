
import React from 'react';
import { Activity } from '../types';
import ActivityCard from './ActivityCard';
import { MessageCircle, Search } from 'lucide-react';

interface MyGroupsViewProps {
  activities: Activity[];
  onOpenChat: (id: string) => void;
  onLeaveGroup: (id: string) => void;
}

const MyGroupsView: React.FC<MyGroupsViewProps> = ({ activities, onOpenChat, onLeaveGroup }) => {
  
  if (activities.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
                <MessageCircle size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Inga grupper än</h2>
            <p className="text-gray-500 max-w-xs">Du har inte gått med i några aktiviteter. Gå till listan eller kartan för att hitta något kul!</p>
        </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mina Grupper</h2>
        <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
            {activities.length} st
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activities.map(activity => (
            <div key={activity.id} className="relative">
                <ActivityCard 
                    activity={activity} 
                    onJoin={() => onOpenChat(activity.id)} // Main action is open chat
                    isJoined={true}
                    onHostClick={() => {}}
                />
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onLeaveGroup(activity.id);
                    }}
                    className="absolute top-4 right-4 text-xs font-bold text-gray-400 hover:text-red-500 bg-white/80 hover:bg-white px-2 py-1 rounded border border-transparent hover:border-red-100 transition-all"
                >
                    Lämna
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default MyGroupsView;
