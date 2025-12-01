
import React from 'react';
import { ArrowLeft, Bell, Globe, Shield, Lock, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { Language } from '../translations';

interface SettingsViewProps {
    onBack: () => void;
    onLogout: () => void;
    onClearData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, onLogout, onClearData }) => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="bg-white min-h-screen animate-slide-left pb-20">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold">{t('settings')}</h2>
            </div>

            <div className="p-6 space-y-8 max-w-2xl mx-auto">
                
                {/* Language Section */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{t('language')}</h3>
                    <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                        <button 
                            onClick={() => setLanguage('sv')}
                            className={`w-full flex items-center justify-between p-4 border-b border-gray-200 ${language === 'sv' ? 'bg-primary/5' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇸🇪</span>
                                <span className={`font-medium ${language === 'sv' ? 'text-primary' : 'text-gray-700'}`}>Svenska</span>
                            </div>
                            {language === 'sv' && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </button>
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`w-full flex items-center justify-between p-4 ${language === 'en' ? 'bg-primary/5' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇬🇧</span>
                                <span className={`font-medium ${language === 'en' ? 'text-primary' : 'text-gray-700'}`}>English</span>
                            </div>
                            {language === 'en' && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </button>
                    </div>
                </section>

                {/* Privacy & Safety */}
                <section>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{t('privacy')}</h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Bell className="text-gray-400" size={20} />
                                <span className="text-gray-700 font-medium">{t('notifications')}</span>
                            </div>
                            <div className="w-10 h-6 bg-green-500 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Shield className="text-gray-400" size={20} />
                                <span className="text-gray-700 font-medium">{t('blocked_users')}</span>
                            </div>
                            <span className="text-gray-400 text-sm">0</span>
                        </div>
                    </div>
                </section>

                {/* Account Actions */}
                <section>
                    <div className="space-y-3">
                        <button 
                            onClick={onLogout}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut size={18} />
                            {t('logout')}
                        </button>
                        <button className="w-full text-red-500 font-medium py-2 text-sm hover:underline flex items-center justify-center gap-2">
                            <Trash2 size={14} />
                            {t('delete_account')}
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default SettingsView;
