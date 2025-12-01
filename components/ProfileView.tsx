
import React, { useState } from 'react';
import { UserProfile, AvatarConfig, Participant } from '../types';
import Avatar from './Avatar';
import { PREMADE_AVATARS, LANGUAGES } from '../constants';
import { Check, Settings, Instagram, Facebook, Linkedin, Users, Grid } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface ProfileViewProps {
  profile: UserProfile;
  friends: Participant[]; 
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
  onFriendClick: (id: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, friends, onSave, onCancel, onOpenSettings, onFriendClick }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleLanguageToggle = (lang: string) => {
      const current = formData.languages || [];
      if (current.includes(lang)) {
          setFormData({ ...formData, languages: current.filter(l => l !== lang) });
      } else {
          setFormData({ ...formData, languages: [...current, lang] });
      }
  };

  const handleSelectAvatar = (config: AvatarConfig) => {
      setFormData({
          ...formData,
          avatarConfig: config
      });
  };

  return (
    <div className="bg-white min-h-screen pb-20 animate-fade-in relative">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center">
          <button onClick={onCancel} className="text-gray-500 font-medium hover:text-gray-900">
              {t('cancel')}
          </button>
          <h2 className="font-bold text-lg">{t('edit_profile')}</h2>
          <button onClick={onOpenSettings} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <Settings size={20} className="text-gray-700" />
          </button>
      </div>

      <div className="max-w-3xl mx-auto">
        
        {/* Current Profile Preview */}
        <div className="bg-gradient-to-b from-blue-50 to-white py-8 flex flex-col items-center border-b border-gray-100">
            <Avatar 
                id={formData.avatarId} 
                size="3xl" 
                config={formData.avatarConfig}
                className="ring-8 ring-white shadow-xl transition-transform hover:scale-105"
            />
            <div className="mt-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900">{formData.name}, {formData.age}</h1>
                <p className="text-gray-500 text-sm font-medium">@{formData.name.toLowerCase().replace(/\s/g, '')}</p>
            </div>
        </div>

        {/* --- NEW: PRE-MADE AVATAR SELECTOR --- */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
             <div className="flex items-center gap-2 mb-4">
                 <Grid className="text-primary" size={20} />
                 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Välj din Avatar</h3>
             </div>
             
             {/* Removed 'no-scrollbar' to ensure users can see they can scroll */}
             <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-[350px] overflow-y-auto p-2 border border-gray-200 rounded-xl bg-white shadow-inner">
                {PREMADE_AVATARS.map((config, index) => {
                    // Check equality simply by comparing skin/hair/clothes
                    const isSelected = JSON.stringify(config) === JSON.stringify(formData.avatarConfig);

                    return (
                        <div 
                            key={index}
                            onClick={() => handleSelectAvatar(config)}
                            className={`
                                cursor-pointer rounded-full p-1 border-2 transition-all hover:scale-110 relative
                                ${isSelected ? 'border-primary ring-2 ring-primary/20 bg-white shadow-lg scale-110 z-10' : 'border-transparent hover:border-gray-200'}
                            `}
                        >
                             <Avatar 
                                id={index + 100} // Dummy ID for background color generation
                                size="md" 
                                config={config} 
                                className={isSelected ? '' : 'opacity-90 hover:opacity-100'}
                             />
                             {isSelected && (
                                 <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-white">
                                     <Check size={10} strokeWidth={4} />
                                 </div>
                             )}
                        </div>
                    );
                })}
             </div>
             <p className="text-center text-xs text-gray-400 mt-3 font-medium">Välj den stil som passar dig bäst!</p>
        </div>

        <div className="p-6 space-y-8">
            
            {/* Friends List */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users size={18} className="text-gray-400"/> {t('my_friends')} 
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{friends.length}</span>
                    </h3>
                </div>
                {friends.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {friends.map(friend => (
                            <div 
                                key={friend.id} 
                                className="flex flex-col items-center min-w-[70px] space-y-1 group cursor-pointer"
                                onClick={() => onFriendClick(friend.id)}
                            >
                                <Avatar id={friend.avatarId} size="lg" config={friend.avatarConfig} className="group-hover:scale-105 transition-transform"/>
                                <span className="text-xs font-medium text-gray-700 truncate w-full text-center group-hover:text-primary transition-colors">{friend.name.split(' ')[0]}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                        <p className="text-gray-400 text-sm">{t('no_friends')}</p>
                    </div>
                )}
            </section>

            {/* Basic Info */}
            <section className="space-y-5">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Om mig</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Namn</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Ålder</label>
                        <input 
                            type="number" 
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">{t('language')}</label>
                    <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang}
                                onClick={() => handleLanguageToggle(lang)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                    (formData.languages || []).includes(lang)
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Bio</label>
                    <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[100px] resize-none focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder={t('bio_placeholder')}
                    />
                </div>
            </section>

            {/* Social Media */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">{t('socials')}</h3>
                
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                        <Instagram size={20} />
                    </div>
                    <input 
                        type="text"
                        placeholder="Instagram användarnamn"
                        value={formData.socials?.instagram || ''}
                        onChange={(e) => setFormData({
                            ...formData, 
                            socials: { ...formData.socials, instagram: e.target.value }
                        })}
                        className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Facebook size={20} />
                    </div>
                    <input 
                        type="text"
                        placeholder="Facebook profil-länk"
                        value={formData.socials?.facebook || ''}
                        onChange={(e) => setFormData({
                            ...formData, 
                            socials: { ...formData.socials, facebook: e.target.value }
                        })}
                        className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center">
                        <Linkedin size={20} />
                    </div>
                    <input 
                        type="text"
                        placeholder="LinkedIn URL"
                        value={formData.socials?.linkedin || ''}
                        onChange={(e) => setFormData({
                            ...formData, 
                            socials: { ...formData.socials, linkedin: e.target.value }
                        })}
                        className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
            </section>

            {/* Save Button */}
            <button 
                onClick={() => onSave(formData)}
                className="w-full bg-primary hover:bg-sky-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
                <Check size={20} strokeWidth={3} />
                {t('save')}
            </button>

        </div>
      </div>
    </div>
  );
};

export default ProfileView;
