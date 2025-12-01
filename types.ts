
export enum ActivityCategory {
  PROMENAD = 'Promenad',
  BOULE = 'Boule',
  STAVGANG = 'Stavgång',
  FIKA = 'Kaffe & Rörelse',
  UTEGYM = 'Utegym',
  PADEL = 'Padel',
  TENNIS = 'Tennis',
  LÖPNING = 'Löpning',
  BASKET = 'Basket',
  FOTBOLL = 'Fotboll'
}

export enum SkillLevel {
  ALLA = 'Alla nivåer',
  NYBORJARE = 'Nybörjare',
  MEDEL = 'Medel',
  AVANCERAD = 'Avancerad'
}

export enum JoinType {
  OPEN = 'Öppen',      // Direct join
  APPLY = 'Ansökan',   // Host approves
  PRIVATE = 'Privat'   // Code required
}

// New Auth State
export type AuthStage = 'LOGIN' | 'PHONE_ENTRY' | 'PHONE_VERIFY' | 'APP';

export interface AvatarConfig {
    skinColor: string;
    hairColor: string;
    hairStyle: string;
    clothing: string;
    glasses: boolean;
}

export interface UserProfile {
  name: string;
  avatarId: number;
  bio: string;
  nationality?: string; // Legacy
  languages: string[]; // New: List of languages spoken
  age: string;
  hobbies: string[];
  friends: string[]; // List of Friend IDs
  
  // Avatar Customization
  avatarConfig?: AvatarConfig;
  
  // Requested field
  customAvatarConfig?: {
      skinColor: string;
      hairColor: string;
      hairStyle: string;
      clothing: string;
      glasses: boolean;
  };

  // Social Media
  socials?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };

  // Verification info
  email?: string;
  phone?: string;
  isVerified?: boolean;
  
  // Home location for map
  homeLocation?: { lat: number; lng: number; address: string };
}

export interface Participant {
  id: string;
  name: string;
  avatarId: number; 
  avatarConfig?: AvatarConfig;
}

export interface Activity {
  id: string;
  host: Participant;
  title: string;
  description: string;
  category: ActivityCategory;
  date: string;
  time: string;
  durationMin: number;
  locationName: string;
  locationCity: string;
  // Using lat/lng for real map
  coordinates: { lat: number; lng: number }; 
  currentParticipants: number;
  maxParticipants: number;
  skillLevel: SkillLevel;
  urgentText?: string; 
  joinType: JoinType; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatarId: number;
  timestamp: number;
  type: 'text' | 'audio';
  content: string; // Text content or Blob URL for audio
  duration?: number; // For audio
}

export type ViewMode = 'LIST' | 'MAP' | 'PROFILE' | 'CHAT' | 'GROUPS' | 'SETTINGS' | 'CREATE' | 'ADMIN';
