

import { Activity, ActivityCategory, SkillLevel, JoinType, AvatarConfig } from './types';

// Real coordinates around Gothenburg (Göteborg)
export const GOTHENBURG_CENTER = { lat: 57.70887, lng: 11.97456 };

export const AVAILABLE_HOBBIES = [
  "Löpning", "Padel", "Vandring", "Yoga", "Cykling", "Matlagning", 
  "Golf", "Simning", "Skidåkning", "Resor", "Böcker", "Musik", 
  "Fotboll", "Tennis", "Klättring", "Dans", "Segling", "Trädgård"
];

// --- Config Lists ---

export const AVATAR_SKIN_COLORS = [
  'f8d25c', 'fd9841', 'ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '614335'
];

export const AVATAR_HAIR_COLORS = [
  '2c1b18', '4a3b32', '724133', 'a55728', 'b58143', 'd6b370', 'f59797', 'ecdcbf'
];

export const AVATAR_HAIR_STYLES = [
  'shortHair', 'longHair', 'bob', 'bun', 'curly', 'dreads', 'fro', 'hijab', 'hat'
];

export const AVATAR_CLOTHES = [
  'blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'
];

export const COUNTRIES = [
  { code: 'SE', name: 'Sverige', flag: '🇸🇪' },
  { code: 'NO', name: 'Norge', flag: '🇳🇴' },
  { code: 'DK', name: 'Danmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'GB', name: 'UK', flag: '🇬🇧' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'DE', name: 'Tyskland', flag: '🇩🇪' },
  { code: 'FR', name: 'Frankrike', flag: '🇫🇷' },
  { code: 'ES', name: 'Spanien', flag: '🇪🇸' },
  { code: 'IT', name: 'Italien', flag: '🇮🇹' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Irak', flag: '🇮🇶' },
  { code: 'SY', name: 'Syrien', flag: '🇸🇾' },
  { code: 'TR', name: 'Turkiet', flag: '🇹🇷' },
  { code: 'PL', name: 'Polen', flag: '🇵🇱' },
  { code: 'BA', name: 'Bosnien', flag: '🇧🇦' }
];

export const LANGUAGES = [
  "Svenska", "Engelska", "Arabiska", "Spanska", "Persiska", "Tyska", "Franska", "Bosniska/Kroatiska/Serbiska", "Polska", "Turkiska", "Somaliska"
];

// Helper to get color based on category
export const getCategoryColor = (category: ActivityCategory): string => {
  switch (category) {
    case ActivityCategory.FOTBOLL: return 'bg-red-50 text-red-700 border-red-100';
    case ActivityCategory.PROMENAD: return 'bg-green-50 text-green-700 border-green-100';
    case ActivityCategory.LÖPNING: return 'bg-blue-50 text-blue-700 border-blue-100';
    case ActivityCategory.PADEL: return 'bg-cyan-50 text-cyan-700 border-cyan-100';
    case ActivityCategory.TENNIS: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case ActivityCategory.UTEGYM: return 'bg-purple-50 text-purple-700 border-purple-100';
    default: return 'bg-gray-50 text-gray-700 border-gray-100';
  }
};

// --- PRE-MADE AVATARS (50 Diverse Options) ---
const generatePremades = (): AvatarConfig[] => {
    const avatars: AvatarConfig[] = [];
    const skins = AVATAR_SKIN_COLORS;
    const hairs = AVATAR_HAIR_COLORS;
    const styles = AVATAR_HAIR_STYLES;
    const clothes = AVATAR_CLOTHES;

    for (let i = 0; i < 50; i++) {
        avatars.push({
            skinColor: skins[i % skins.length],
            hairColor: hairs[(i * 3) % hairs.length],
            hairStyle: styles[(i * 2) % styles.length],
            clothing: clothes[(i * 4) % clothes.length],
            glasses: i % 5 === 0 // 20% chance
        });
    }
    return avatars;
};

export const PREMADE_AVATARS = generatePremades();

// --- MOCK DATA FOR DEMO ---

const createAvatar = (seed: Partial<AvatarConfig>): AvatarConfig => ({
    skinColor: 'f8d25c',
    hairColor: '4a3b32',
    hairStyle: 'shortHair',
    clothing: 'shirtCrewNeck',
    glasses: false,
    ...seed
});

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    host: { id: 'u1', name: 'Anna Svensson', avatarId: 1, avatarConfig: createAvatar({ hairStyle: 'bob', hairColor: 'd6b370', clothing: 'blazerAndShirt' }) },
    title: 'Söndagspromenad Slottsskogen',
    description: 'En lugn promenad runt hela parken. Vi stannar för kaffe vid Villa Belparc. Alla är välkomna, även hundar!',
    category: ActivityCategory.PROMENAD,
    date: '2024-10-20',
    time: '11:00',
    durationMin: 90,
    locationName: 'Linnéplatsen (Entrén)',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6908, lng: 11.9520 },
    currentParticipants: 8,
    maxParticipants: 15,
    skillLevel: SkillLevel.ALLA,
    joinType: JoinType.OPEN
  },
  {
    id: '2',
    host: { id: 'u2', name: 'Johan Berg', avatarId: 2, avatarConfig: createAvatar({ hairStyle: 'shortHair', clothing: 'hoodie', glasses: true }) },
    title: 'Padel Lunchmatch',
    description: 'Vi saknar en spelare för en Americano på lunchen. Medelnivå (4-5 på skalan). Bra tempo men glatt humör!',
    category: ActivityCategory.PADEL,
    date: '2024-10-18',
    time: '12:00',
    durationMin: 60,
    locationName: 'PDL Center Frihamnen',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7165, lng: 11.9475 },
    currentParticipants: 3,
    maxParticipants: 4,
    skillLevel: SkillLevel.MEDEL,
    joinType: JoinType.APPLY
  },
  {
    id: '3',
    host: { id: 'u3', name: 'Erik Andersson', avatarId: 3, avatarConfig: createAvatar({ hairStyle: 'fro', hairColor: '2c1b18', clothing: 'shirtVNeck' }) },
    title: 'Kvällsfotboll på Heden',
    description: 'Spontan 5v5 match. Vi har västar och boll. Kom ombytt och klar!',
    category: ActivityCategory.FOTBOLL,
    date: '2024-10-18',
    time: '18:00',
    durationMin: 60,
    locationName: 'Heden Konstgräs',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7013, lng: 11.9784 },
    currentParticipants: 7,
    maxParticipants: 10,
    skillLevel: SkillLevel.ALLA,
    joinType: JoinType.OPEN
  },
  {
    id: '4',
    host: { id: 'u4', name: 'Skolklass 9B', avatarId: 4, avatarConfig: createAvatar({ hairStyle: 'hat', clothing: 'overall', skinColor: 'ae5d29' }) },
    title: 'Beachvolleyboll Turnering (Klass 9B)',
    description: 'Sluten turnering för Klass 9B. Vi har hyrt hela hallen i 3 timmar. Endast för elever och lärare.',
    category: ActivityCategory.PROMENAD, // Using generic category as placeholder
    date: '2024-10-25',
    time: '09:00',
    durationMin: 180,
    locationName: 'Kvibergs Beach Center',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7371, lng: 12.0249 },
    currentParticipants: 22,
    maxParticipants: 30,
    skillLevel: SkillLevel.NYBORJARE,
    urgentText: 'Privat bokning',
    joinType: JoinType.PRIVATE
  },
  {
    id: '5',
    host: { id: 'u5', name: 'Maria Karlsson', avatarId: 5, avatarConfig: createAvatar({ hairStyle: 'curly', hairColor: 'a55728', clothing: 'collarAndSweater' }) },
    title: 'Morgonjogg längs älven',
    description: 'Avslappnad jogging 5-7km i prattempo. Vi startar vid Operan och springer mot Röda Sten.',
    category: ActivityCategory.LÖPNING,
    date: '2024-10-19',
    time: '07:00',
    durationMin: 60,
    locationName: 'Göteborgsoperan',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7119, lng: 11.9634 },
    currentParticipants: 4,
    maxParticipants: 10,
    skillLevel: SkillLevel.MEDEL,
    joinType: JoinType.OPEN
  },
  {
    id: '6',
    host: { id: 'u6', name: 'Idrottslärare Sven', avatarId: 6, avatarConfig: createAvatar({ hairStyle: 'shortHair', skinColor: 'ffdbb4', clothing: 'graphicShirt' }) },
    title: 'Simlektion Gymnasiet (Valhalla)',
    description: 'Simprov för årskurs 2. Samling i entrén. Glöm inte hänglås!',
    category: ActivityCategory.PROMENAD,
    date: '2024-10-22',
    time: '13:30',
    durationMin: 90,
    locationName: 'Valhallabadet',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6993, lng: 11.9904 },
    currentParticipants: 28,
    maxParticipants: 30,
    skillLevel: SkillLevel.NYBORJARE,
    joinType: JoinType.PRIVATE
  },
  {
    id: '7',
    host: { id: 'u7', name: 'Klara', avatarId: 7, avatarConfig: createAvatar({ hairStyle: 'longHair', hairColor: '2c1b18', skinColor: '614335', clothing: 'shirtScoopNeck' }) },
    title: 'Boule i Trädgårdsföreningen',
    description: 'Vi spelar några omgångar boule och äter glass om vädret tillåter.',
    category: ActivityCategory.BOULE,
    date: '2024-10-21',
    time: '16:00',
    durationMin: 120,
    locationName: 'Trädgårdsföreningen',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7067, lng: 11.9750 },
    currentParticipants: 2,
    maxParticipants: 8,
    skillLevel: SkillLevel.ALLA,
    joinType: JoinType.OPEN
  },
  {
    id: '8',
    host: { id: 'u8', name: 'Ali Rez', avatarId: 8, avatarConfig: createAvatar({ hairStyle: 'shortHair', hairColor: '2c1b18', skinColor: 'ae5d29', clothing: 'hoodie', glasses: true }) },
    title: 'Elit Tennis Match',
    description: 'Söker en stark spelare för singelmatch. Jag ligger på nivå 5.0.',
    category: ActivityCategory.TENNIS,
    date: '2024-10-24',
    time: '19:00',
    durationMin: 60,
    locationName: 'GLTK',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6975, lng: 12.0150 },
    currentParticipants: 1,
    maxParticipants: 2,
    skillLevel: SkillLevel.AVANCERAD,
    joinType: JoinType.APPLY
  },
  {
    id: '9',
    host: { id: 'u9', name: 'Sara', avatarId: 9, avatarConfig: createAvatar({ hairStyle: 'bun', hairColor: 'f59797', clothing: 'overall' }) },
    title: 'Utegym Skatås',
    description: 'Cirkelträning vid utegymmet. Vi kör 3 varv gemensamt.',
    category: ActivityCategory.UTEGYM,
    date: '2024-10-20',
    time: '10:00',
    durationMin: 45,
    locationName: 'Skatås Motionscentrum',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7035, lng: 12.0337 },
    currentParticipants: 5,
    maxParticipants: 10,
    skillLevel: SkillLevel.ALLA,
    joinType: JoinType.OPEN
  },
  {
    id: '10',
    host: { id: 'u10', name: 'Basket Boys', avatarId: 10, avatarConfig: createAvatar({ hairStyle: 'dreads', hairColor: '2c1b18', skinColor: '614335', clothing: 'shirtCrewNeck' }) },
    title: '3x3 Basket Turnering',
    description: 'Seriös 3x3 turnering. Vi behöver ett lag till!',
    category: ActivityCategory.BASKET,
    date: '2024-10-19',
    time: '14:00',
    durationMin: 120,
    locationName: 'Guldhedens Basketplan',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6885, lng: 11.9700 },
    currentParticipants: 3,
    maxParticipants: 6,
    skillLevel: SkillLevel.AVANCERAD,
    joinType: JoinType.APPLY
  },
  {
    id: '11',
    host: { id: 'u11', name: 'Pensionärsföreningen', avatarId: 11, avatarConfig: createAvatar({ hairStyle: 'shortHair', hairColor: 'ecdcbf', clothing: 'collarAndSweater', glasses: true }) },
    title: 'Stavgång Delsjön',
    description: 'Gemensam stavgång runt Lilla Delsjön. Fika på kaffestugan efteråt.',
    category: ActivityCategory.STAVGANG,
    date: '2024-10-23',
    time: '10:00',
    durationMin: 120,
    locationName: 'Delsjöbadet',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6800, lng: 12.0300 },
    currentParticipants: 12,
    maxParticipants: 20,
    skillLevel: SkillLevel.NYBORJARE,
    joinType: JoinType.OPEN
  },
  {
    id: '12',
    host: { id: 'u12', name: 'Yoga med Linda', avatarId: 12, avatarConfig: createAvatar({ hairStyle: 'longHair', hairColor: 'b58143', clothing: 'shirtVNeck' }) },
    title: 'Sunset Yoga Masthugget',
    description: 'Gratis yoga vid kyrkan. Ta med egen matta.',
    category: ActivityCategory.PROMENAD, // Yoga not in enum, using Promenad
    date: '2024-10-18',
    time: '17:45',
    durationMin: 60,
    locationName: 'Masthuggskyrkan',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6980, lng: 11.9350 },
    currentParticipants: 15,
    maxParticipants: 30,
    skillLevel: SkillLevel.ALLA,
    joinType: JoinType.OPEN
  },
  {
    id: '13',
    host: { id: 'u13', name: 'David', avatarId: 13, avatarConfig: createAvatar({ hairStyle: 'shortHair', skinColor: 'f8d25c', clothing: 'blazerAndSweater' }) },
    title: 'Schackklubben Möte',
    description: 'Vi träffas på Stadsbiblioteket för att spela och analysera partier.',
    category: ActivityCategory.FIKA,
    date: '2024-10-22',
    time: '18:00',
    durationMin: 120,
    locationName: 'Stadsbiblioteket',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6997, lng: 11.9786 },
    currentParticipants: 6,
    maxParticipants: 10,
    skillLevel: SkillLevel.MEDEL,
    joinType: JoinType.OPEN
  },
  {
    id: '14',
    host: { id: 'u14', name: 'Företaget AB', avatarId: 14, avatarConfig: createAvatar({ hairStyle: 'bob', clothing: 'blazerAndShirt' }) },
    title: 'Företagspadel (Internt)',
    description: 'AW-padel för säljavdelningen. Kod krävs.',
    category: ActivityCategory.PADEL,
    date: '2024-10-25',
    time: '16:00',
    durationMin: 90,
    locationName: 'Padel Arena',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7400, lng: 11.9900 },
    currentParticipants: 8,
    maxParticipants: 16,
    skillLevel: SkillLevel.NYBORJARE,
    joinType: JoinType.PRIVATE
  },
  {
    id: '15',
    host: { id: 'u15', name: 'Kevin', avatarId: 15, avatarConfig: createAvatar({ hairStyle: 'shortHair', hairColor: '2c1b18', skinColor: 'd08b5b', clothing: 'hoodie' }) },
    title: 'Street Workout',
    description: 'Calisthenics och teknikträning (Muscle-ups, Front lever).',
    category: ActivityCategory.UTEGYM,
    date: '2024-10-19',
    time: '13:00',
    durationMin: 90,
    locationName: 'Plikta Utegym',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6920, lng: 11.9450 },
    currentParticipants: 3,
    maxParticipants: 5,
    skillLevel: SkillLevel.AVANCERAD,
    joinType: JoinType.OPEN
  },
  {
    id: '16',
    host: { id: 'u16', name: 'Zlatan F', avatarId: 16, avatarConfig: createAvatar({ hairStyle: 'bun', hairColor: '2c1b18', clothing: 'shirtCrewNeck' }) },
    title: 'Fotbollsträning (Satsning)',
    description: 'Vi söker seriösa spelare för div 5 lagträning. Provspel krävs.',
    category: ActivityCategory.FOTBOLL,
    date: '2024-10-21',
    time: '19:30',
    durationMin: 90,
    locationName: 'Guldheden Södra',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6850, lng: 11.9750 },
    currentParticipants: 14,
    maxParticipants: 18,
    skillLevel: SkillLevel.AVANCERAD,
    joinType: JoinType.APPLY
  },
  {
    id: '17',
    host: { id: 'u17', name: 'Lisa & Marie', avatarId: 17, avatarConfig: createAvatar({ hairStyle: 'longHair', hairColor: 'f59797', clothing: 'shirtScoopNeck' }) },
    title: 'Powerwalk Majorna',
    description: 'Snabbt tempo runt Majorna/Kungsladugård. Avslutar vid Mariaplan.',
    category: ActivityCategory.PROMENAD,
    date: '2024-10-20',
    time: '09:00',
    durationMin: 60,
    locationName: 'Mariaplan',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6815, lng: 11.9190 },
    currentParticipants: 2,
    maxParticipants: 4,
    skillLevel: SkillLevel.MEDEL,
    joinType: JoinType.OPEN
  },
  {
    id: '18',
    host: { id: 'u18', name: 'Golfgänget', avatarId: 18, avatarConfig: createAvatar({ hairStyle: 'shortHair', hairColor: 'ecdcbf', clothing: 'collarAndSweater', glasses: true }) },
    title: '18 Hål på Delsjö GK',
    description: 'Vi har en boll bokad 08:30. Handicap 15-25.',
    category: ActivityCategory.UTEGYM, // Golf placeholder
    date: '2024-10-26',
    time: '08:30',
    durationMin: 240,
    locationName: 'Delsjö Golfklubb',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.6850, lng: 12.0400 },
    currentParticipants: 3,
    maxParticipants: 4,
    skillLevel: SkillLevel.MEDEL,
    joinType: JoinType.APPLY
  },
  {
    id: '19',
    host: { id: 'u19', name: 'Ungdomsgården', avatarId: 19, avatarConfig: createAvatar({ hairStyle: 'fro', clothing: 'hoodie' }) },
    title: 'FIFA Turnering',
    description: 'Turnering på fritidsgården. Endast för medlemmar.',
    category: ActivityCategory.FIKA,
    date: '2024-10-18',
    time: '18:00',
    durationMin: 180,
    locationName: 'Fritidsgården City',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7050, lng: 11.9700 },
    currentParticipants: 16,
    maxParticipants: 32,
    skillLevel: SkillLevel.ALLA,
    joinType: JoinType.PRIVATE
  },
  {
    id: '20',
    host: { id: 'u20', name: 'Naturvännerna', avatarId: 20, avatarConfig: createAvatar({ hairStyle: 'hat', skinColor: 'fd9841', clothing: 'overall' }) },
    title: 'Svampplockning Vättlefjäll',
    description: 'Heldag i skogen. Vi letar kantareller. Ta med fika!',
    category: ActivityCategory.PROMENAD,
    date: '2024-10-27',
    time: '08:00',
    durationMin: 300,
    locationName: 'Angereds Kyrka (Samling)',
    locationCity: 'Göteborg',
    coordinates: { lat: 57.7950, lng: 12.0500 },
    currentParticipants: 5,
    maxParticipants: 15,
    skillLevel: SkillLevel.ALLA,
    joinType: JoinType.OPEN
  }
];
