
import React, { useState, useMemo } from 'react';
import { MOCK_ACTIVITIES } from './constants';
import ActivityCard from './components/ActivityCard';
import MapView from './components/MapView';
import ProfileView from './components/ProfileView';
import ChatView from './components/ChatView';
import UserDetailModal from './components/UserDetailModal';
import MyGroupsView from './components/MyGroupsView';
import CreateActivityView from './components/CreateActivityView';
import Logo from './components/Logo';
import AuthView from './components/AuthView';
import AiSupportBot from './components/AiSupportBot';
import SettingsView from './components/SettingsView';
import Avatar from './components/Avatar';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { Map as MapIcon, List, Plus, Search, Trash2, Filter, Wrench, X, RefreshCw } from 'lucide-react';
import { ActivityCategory, ViewMode, UserProfile, ChatMessage, JoinType, AuthStage, Participant, Activity, SkillLevel } from './types';
import { GOTHENBURG_CENTER } from './constants';

// Wrapper for Language Context
export default function AppWrapper() {
    return (
        <LanguageProvider>
            <App />
        </LanguageProvider>
    );
}

function App() {
  const { t } = useLanguage();
  // Use mock data instead of Firebase
  const firebaseActivities = MOCK_ACTIVITIES;
  const activitiesLoading = false;
  const addFirebaseActivity = async (activity: any) => {};
  const deleteFirebaseActivity = async (id: string) => {};

  // Auth State - Skip auth for now
  const [authStage, setAuthStage] = useState<AuthStage>('APP');
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  
  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('Alla');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  
  // Data State - Use Firebase activities
  const [activities, setActivities] = useState<Activity[]>(firebaseActivities);

  // Update local activities when Firebase updates
  React.useEffect(() => {
    setActivities(firebaseActivities);
  }, [firebaseActivities]);

    // Auto-login if Firebase auth is ready
    React.useEffect(() => {
        if (firebaseUser && !authLoading) {
            setAuthStage('APP');
        }
    }, [firebaseUser, authLoading]);

  // Membership State
  const [joinedActivityIds, setJoinedActivityIds] = useState<Set<string>>(new Set());
  const [appliedActivityIds, setAppliedActivityIds] = useState<Set<string>>(new Set());
  
  // Penalty / Cooldown System
  const [cancellationCount, setCancellationCount] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  // Chat State
  const [activeChatActivityId, setActiveChatActivityId] = useState<string | null>(null);
  const [chats, setChats] = useState<{[activityId: string]: ChatMessage[]}>({});

  // Friend & User Detail State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Set<string>>(new Set()); 
  const [userRatings, setUserRatings] = useState<{[userId: string]: number}>({});

  // User Profile State - Generic Start
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Ny Användare",
    avatarId: 1,
    bio: "",
    languages: ["Svenska"],
    nationality: "Svensk", 
    age: "",
    hobbies: [],
    friends: [],
    avatarConfig: {
        skinColor: 'f8d25c',
        hairColor: '4a3b32',
        hairStyle: 'shortHair',
        clothing: 'shirtCrewNeck',
        glasses: false
    },
    socials: {},
    isVerified: false 
  });

  // Filter activities based on category
  const filteredActivities = useMemo(() => {
    // Filter out Direct Messages (ID starts with 'dm_')
    const publicActivities = activities.filter(a => !a.id.startsWith('dm_'));
    
    if (selectedCategory === 'Alla') return publicActivities;
    return publicActivities.filter(a => a.category === selectedCategory);
  }, [selectedCategory, activities]);

  // Derived Selected Activity for Map View
  const selectedActivity = useMemo(() => 
    selectedActivityId ? activities.find(a => a.id === selectedActivityId) : null,
  [activities, selectedActivityId]);

  // --- HELPER: Resolve User Object ---
  const getUserById = (id: string): Participant => {
      // 1. Is it me?
      if (id === 'me') {
          return {
              id: 'me',
              name: userProfile.name,
              avatarId: userProfile.avatarId,
              avatarConfig: userProfile.avatarConfig
          };
      }
      // 2. Is it a host of an existing activity?
      const host = activities.find(a => a.host.id === id)?.host;
      if (host) return host;

      // 3. Unknown
      return {
          id: id,
          name: 'Okänd Användare',
          avatarId: 1
      };
  };

  // --- LOGIC ---

  const handleCreateActivity = async (newActivity: Activity) => {
    try {
      // Save to Firebase (without ID, Firebase will generate it)
      const { id, ...activityData } = newActivity;
      await addFirebaseActivity(activityData as Omit<Activity, 'id'>);
            // Auto-join the creator with the generated ID
            setJoinedActivityIds(prev => {
                const n = new Set(prev);
                n.add(newActivity.id);
                return n;
            });
      setViewMode('LIST');
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Error creating activity. Please try again.');
    }
  };

  const isCooldownActive = () => {
    if (!cooldownUntil) return false;
    if (Date.now() > cooldownUntil) {
        setCooldownUntil(null);
        setCancellationCount(0);
        return false;
    }
    return true;
  };

  const handleCancelApplication = (id: string) => {
    setAppliedActivityIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
    });
    const newCount = cancellationCount + 1;
    setCancellationCount(newCount);

    if (newCount >= 3) {
        const banTime = 30 * 1000; 
        setCooldownUntil(Date.now() + banTime);
        alert(`Varning: Du har avbokat ansökningar för många gånger. Blockad i 30s.`);
    } else {
        alert(`Ansökan avbruten. (${newCount}/3)`);
    }
  };

  const handleJoinRequest = (id: string, joinType: JoinType) => {
      if (isCooldownActive()) {
          const remaining = Math.ceil((cooldownUntil! - Date.now()) / 1000);
          alert(`Vänta ${remaining} sekunder.`);
          return;
      }

      if (joinType === JoinType.PRIVATE) {
          const code = prompt("Ange kod (Kod: 1234):");
          if (code === '1234') completeJoin(id);
          else if (code !== null) alert("Fel kod!");
      } else if (joinType === JoinType.APPLY) {
          setAppliedActivityIds(prev => {
              const newSet = new Set(prev);
              newSet.add(id);
              return newSet;
          });
          alert(t('application_sent'));
          setTimeout(() => {
              setAppliedActivityIds(current => {
                  if (current.has(id)) {
                      const newSet = new Set(current);
                      newSet.delete(id); 
                      completeJoin(id); 
                      alert(`Din ansökan har godkänts!`);
                      return newSet;
                  }
                  return current;
              });
          }, 4000); 
      } else {
          completeJoin(id);
      }
  };

  const completeJoin = (id: string) => {
    setJoinedActivityIds(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
    });
    if (!chats[id]) {
        setChats(prev => ({
            ...prev,
            [id]: [{
                id: 'welcome',
                senderId: 'system',
                senderName: 'System',
                avatarId: 0,
                timestamp: Date.now(),
                type: 'text',
                content: 'Välkommen till gruppen!'
            }]
        }));
    }
  };

  const handleOpenChat = (id: string) => {
      setActiveChatActivityId(id);
      setViewMode('CHAT');
  };

  const handleStartDirectChat = (targetUserId: string) => {
      const targetUser = getUserById(targetUserId);
      const myId = 'me';
      // Create deterministic ID based on user IDs
      const dmId = `dm_${[myId, targetUserId].sort().join('_')}`;
      
      // Check if DM "activity" exists
      let dmActivity = activities.find(a => a.id === dmId);
      
      if (!dmActivity) {
          // Create pseudo activity for DM
          dmActivity = {
              id: dmId,
              host: targetUser,
              title: `Chatt med ${targetUser.name}`,
              description: 'Direktmeddelande',
              category: ActivityCategory.FIKA, // Use generic category
              date: new Date().toISOString().split('T')[0],
              time: 'Nu',
              durationMin: 0,
              locationName: 'Direktmeddelande',
              locationCity: 'Online',
              coordinates: GOTHENBURG_CENTER,
              currentParticipants: 2,
              maxParticipants: 2,
              skillLevel: SkillLevel.ALLA,
              joinType: JoinType.PRIVATE
          };
          setActivities(prev => [...prev, dmActivity!]);
          setJoinedActivityIds(prev => new Set(prev).add(dmId));
      }

      setSelectedUserId(null); // Close modal
      handleOpenChat(dmId);
  };

  const handleMapSelection = (id: string) => {
      setSelectedActivityId(id);
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
      setUserProfile(updatedProfile);
      setViewMode('LIST');
  };

  const handleSendMessage = (text: string) => {
      if (!activeChatActivityId) return;
      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'me',
          senderName: userProfile.name,
          avatarId: userProfile.avatarId,
          timestamp: Date.now(),
          type: 'text',
          content: text
      };
      setChats(prev => ({
          ...prev,
          [activeChatActivityId]: [...(prev[activeChatActivityId] || []), newMessage]
      }));
  };

  const handleSendAudio = (blob: Blob, duration: number) => {
    if (!activeChatActivityId) return;
    const audioUrl = URL.createObjectURL(blob);
    const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        senderName: userProfile.name,
        avatarId: userProfile.avatarId,
        timestamp: Date.now(),
        type: 'audio',
        content: audioUrl,
        duration: duration
    };
    setChats(prev => ({
        ...prev,
        [activeChatActivityId]: [...(prev[activeChatActivityId] || []), newMessage]
    }));
  };

  const handleLeaveActivity = (id: string) => {
    setJoinedActivityIds(prev => {
        const n = new Set(prev);
        n.delete(id);
        return n;
    });
    setViewMode('LIST');
  };

  const handleDisbandActivity = async (id: string) => {
    if (!window.confirm("Är du säker på att du vill ta bort aktiviteten? Den försvinner för alla.")) return;
    
    try {
      await deleteFirebaseActivity(id);
      handleLeaveActivity(id);
    } catch (error) {
      console.error('Error disbanding activity:', error);
      alert('Error deleting activity. Please try again.');
    }
  };

  // --- DEV TOOLS ---
  const handleClearData = () => {
    if (!window.confirm("Rensa all data?")) return;
    setActivities([]);
    setJoinedActivityIds(new Set());
    setAppliedActivityIds(new Set());
    setChats({});
    setFriends(new Set());
    setUserRatings({});
    setIsDevPanelOpen(false);
  };

  const handleLoadMockData = () => {
    if (!window.confirm("Ladda in 20 exempelaktiviteter?")) return;
    setActivities(MOCK_ACTIVITIES);
    setIsDevPanelOpen(false);
  };

  // --- RENDER ---

  if (authStage !== 'APP') {
      return <AuthView onLoginSuccess={() => setAuthStage('APP')} />;
  }

  // Resolve Friends List for Profile View
  const resolvedFriends = Array.from(friends).map((id: string) => getUserById(id));

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans text-gray-900">
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('LIST')}>
            <Logo className="w-9 h-9" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">GeoSporty</h1>
          </div>
          
          <div className="flex items-center gap-2">
             
             {/* Dev Panel Toggle */}
             <div className="relative">
                 <button 
                    onClick={() => setIsDevPanelOpen(!isDevPanelOpen)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-bold text-xs border border-red-200"
                    title="Dev Panel"
                 >
                     <Wrench size={14} /> DEV
                 </button>
                 {isDevPanelOpen && (
                     <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-scale-up origin-top-right">
                         <div className="px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">Dev Panel</div>
                         <button onClick={handleLoadMockData} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium flex items-center gap-2 text-green-600">
                             <RefreshCw size={16} /> Ladda Data (20st)
                         </button>
                         <button onClick={handleClearData} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium flex items-center gap-2 text-red-600">
                             <Trash2 size={16} /> Rensa Allt
                         </button>
                     </div>
                 )}
             </div>

             {/* Filter Toggle */}
             <div className="relative">
                 <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all ${selectedCategory !== 'Alla' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                 >
                     <Filter size={18} />
                     <span className="hidden sm:inline">Filtrera</span>
                 </button>
                 
                 {isFilterOpen && (
                     <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-scale-up origin-top-right max-h-80 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase">Kategori</span>
                            <button onClick={() => setIsFilterOpen(false)}><X size={14} className="text-gray-400"/></button>
                        </div>
                        {(['Alla', ...Object.values(ActivityCategory)] as string[]).map((cat) => (
                             <button 
                                key={cat} 
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setIsFilterOpen(false);
                                }} 
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium flex items-center justify-between ${selectedCategory === cat ? 'text-primary' : 'text-gray-700'}`}
                             >
                                 {cat}
                                 {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-primary" />}
                             </button>
                         ))}
                     </div>
                 )}
             </div>

             {/* View Toggles */}
             {viewMode === 'LIST' && (
                <button onClick={() => setViewMode('MAP')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                  <MapIcon size={18} /> <span className="hidden sm:inline">{t('tab_map')}</span>
                </button>
             )}
             {viewMode === 'MAP' && (
                <button onClick={() => setViewMode('LIST')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                  <List size={18} /> <span className="hidden sm:inline">{t('tab_activities')}</span>
                </button>
             )}
             
             {/* Create Button */}
             <button onClick={() => setViewMode('CREATE')} className="bg-gray-900 hover:bg-primary text-white p-2 sm:px-4 sm:py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-colors">
                <Plus size={20} /> <span className="hidden sm:inline">{t('create_activity')}</span>
             </button>
             
             {/* Profile */}
             <div className="ml-1 relative group cursor-pointer" onClick={() => setViewMode('PROFILE')}>
                <Avatar id={userProfile.avatarId} config={userProfile.avatarConfig} size="md" className="w-9 h-9 border border-gray-200 group-hover:border-primary" />
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        
        {viewMode === 'CREATE' && (
            <CreateActivityView user={userProfile} onCreate={handleCreateActivity} onCancel={() => setViewMode('LIST')} />
        )}

        {viewMode === 'SETTINGS' && (
            <SettingsView onBack={() => setViewMode('PROFILE')} onLogout={() => setAuthStage('LOGIN')} onClearData={handleClearData} />
        )}

        {viewMode === 'PROFILE' && (
            <ProfileView 
                profile={userProfile} 
                friends={resolvedFriends} 
                onSave={handleSaveProfile} 
                onCancel={() => setViewMode('LIST')}
                onOpenSettings={() => setViewMode('SETTINGS')}
                onFriendClick={(friendId) => setSelectedUserId(friendId)}
            />
        )}

        {viewMode === 'GROUPS' && (
            <MyGroupsView 
                activities={activities.filter(a => joinedActivityIds.has(a.id))}
                onOpenChat={handleOpenChat}
                onLeaveGroup={handleLeaveActivity}
            />
        )}

        {viewMode === 'CHAT' && activeChatActivityId && (
            <ChatView 
                activity={activities.find(a => a.id === activeChatActivityId)!}
                user={userProfile}
                messages={chats[activeChatActivityId] || []}
                onSendMessage={handleSendMessage}
                onSendAudio={handleSendAudio}
                onClose={() => {
                   // When closing chat, revert to previous logical view
                   setViewMode(prev => prev === 'CHAT' ? 'GROUPS' : prev); 
                }}
                onUserClick={(userId) => setSelectedUserId(userId)}
            />
        )}

        {(viewMode === 'LIST' || viewMode === 'MAP') && (
            <>
                {viewMode === 'LIST' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                    {filteredActivities.map((activity) => (
                        <ActivityCard 
                            key={activity.id} 
                            activity={activity} 
                            onJoin={(id) => {
                                if (joinedActivityIds.has(id)) handleOpenChat(id);
                                else if (appliedActivityIds.has(id)) handleCancelApplication(id);
                                else handleJoinRequest(id, activity.joinType);
                            }}
                            onHostClick={() => setSelectedUserId(activity.host.id)}
                            isJoined={joinedActivityIds.has(activity.id)}
                            isApplied={appliedActivityIds.has(activity.id)}
                        />
                    ))}
                    {filteredActivities.length === 0 && (
                        <div className="col-span-full text-center py-20 animate-fade-in">
                            {activitiesLoading ? (
                                <>
                                    <div className="bg-white border border-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-pulse">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-xl mb-2">Laddar aktiviteter...</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Hämtar data från databasen</p>
                                </>
                            ) : (
                                <>
                                    <div className="bg-white border border-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Search className="text-gray-300" size={40} />
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-xl mb-2">Inga aktiviteter</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">Det är tomt här. {selectedCategory !== 'Alla' ? 'Testa att byta kategori eller skapa en egen!' : 'Var först med att skapa en aktivitet!'}</p>
                                    
                                    <div className="flex flex-col gap-3 justify-center items-center">
                                        <button 
                                            onClick={() => setViewMode('CREATE')}
                                            className="bg-primary hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                        >
                                            <Plus size={20} /> Skapa Aktivitet
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsDevPanelOpen(true);
                                                // Scroll top
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="text-xs text-gray-400 font-medium hover:text-gray-600 underline"
                                        >
                                            Är du utvecklare? Ladda data
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    </div>
                ) : (
                    <div className="h-[600px] w-full">
                        <MapView 
                            activities={filteredActivities} 
                            onSelectActivity={handleMapSelection}
                            selectedActivityId={selectedActivityId}
                        />
                        {selectedActivity && (
                            <div className="mt-4 bg-white p-4 rounded-xl border border-gray-200 shadow-lg md:hidden">
                                <ActivityCard 
                                    activity={selectedActivity}
                                    onJoin={(id) => handleJoinRequest(id, selectedActivity.joinType)}
                                    onHostClick={() => setSelectedUserId(selectedActivity.host.id)}
                                    isJoined={joinedActivityIds.has(selectedActivity.id)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </>
        )}
      </main>

      {/* AI Bot Overlay */}
      <AiSupportBot />

      {/* Modal - Pass resolved User Object */}
      {selectedUserId && (
        <UserDetailModal 
            user={getUserById(selectedUserId)} 
            onClose={() => setSelectedUserId(null)}
            isFriend={friends.has(selectedUserId)}
            onToggleFriend={() => {
                setFriends(prev => {
                    const n = new Set(prev);
                    if (n.has(selectedUserId)) n.delete(selectedUserId);
                    else n.add(selectedUserId);
                    return n;
                });
            }}
            rating={userRatings[selectedUserId] || 0}
            onRate={(r) => setUserRatings(prev => ({...prev, [selectedUserId]: r}))}
            onChat={() => handleStartDirectChat(selectedUserId)}
        />
      )}
    </div>
  );
}
