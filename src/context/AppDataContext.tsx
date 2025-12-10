import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityLog, Dog, LogType, User } from '../types';

// --- Typography Definitions ---
export const Typography = {
    header: { fontSize: 22, fontWeight: '700' as '700' },
    sectionTitle: { fontSize: 18, fontWeight: '700' as '700' },
    cardTitle: { fontSize: 16, fontWeight: '600' as '600' },
    body: { fontSize: 14, fontWeight: '500' as '500' },
    caption: { fontSize: 12, fontWeight: '400' as '400' }
};

// --- Theme Definitions ---
export const Colors = {
    light: {
        background: '#ffffff',
        text: '#1a1a1a',
        subText: '#888888',
        card: '#ffffff',
        cardBorder: '#f0f0f0',
        primary: '#3a5e98',
        secondaryBg: '#F2F5FA',
        iconBg: '#f5f5f5',
        tabBar: '#ffffff',
        danger: '#FF5252',
        success: '#4CAF50',
        warning: '#FF9800'
    },
    dark: {
        background: '#121212',
        text: '#ffffff',
        subText: '#aaaaaa',
        card: '#1e1e1e',
        cardBorder: '#333333',
        primary: '#5c85c4',
        secondaryBg: '#252525',
        iconBg: '#333333',
        tabBar: '#1e1e1e',
        danger: '#FF8A80',
        success: '#81C784',
        warning: '#FFB74D'
    }
};

// --- Mock Data (Used only for first launch) ---
const MOCK_USER: User = {
    id: 'u1',
    displayName: 'Noa Cohen',
    email: 'noa@doglovers.com',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
};

const MOCK_DOGS: any[] = [
    {
        id: '1',
        name: 'Rexi',
        gender: 'male',
        colors: ['#FFCC80'], // Example Gold color
        weight: 28,
        isSterilized: true,
        breed: 'Golden Retriever',
        imageUri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop',
        coverImageUri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1000&auto=format&fit=crop',
        notes: 'Loves playing fetch and swimming.',
        chipNumber: '982009106543210',
        birthDate: '15 May 2020',
        foodHabits: { foodBrand: 'Royal Canin', dailyAmount: 300, unit: 'gr' },
        allergies: 'Chicken sensitivity',
        energyLevel: 'High Energy ⚡',
        socialInfo: 'Loves people, shy with dogs'
    },
    {
        id: '2',
        name: 'Luna',
        gender: 'female',
        colors: ['#80D8FF'], // Example Blue color
        weight: 22,
        isSterilized: true,
        breed: 'Border Collie',
        imageUri: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&auto=format&fit=crop',
        coverImageUri: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?q=80&w=1000&auto=format&fit=crop',
        notes: 'Very energetic, needs long walks.',
        chipNumber: '1122334455',
        birthDate: '01 Jan 2021',
        foodHabits: { foodBrand: 'Acana', dailyAmount: 250, unit: 'gr' },
        allergies: 'None',
        energyLevel: 'Hyperactive',
        socialInfo: 'Friendly with everyone'
    }
];

// --- Parks Mock Data ---
export interface Park {
    id: string;
    name: string;
    address: string;
    distance: string;
    rating: number;
    coordinate: { latitude: number, longitude: number };
    imageUri: string;
}

const MOCK_PARKS: Park[] = [
    {
        id: 'p1',
        name: 'Gan Meir Dog Park',
        address: 'King George St, Tel Aviv',
        distance: '0.3 km',
        rating: 4.5,
        coordinate: { latitude: 32.0735, longitude: 34.7745 },
        imageUri: 'https://images.unsplash.com/photo-1599402432924-b08dd97df947?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'p2',
        name: 'Yarkon Park Area B',
        address: 'Rokach Blvd, Tel Aviv',
        distance: '1.2 km',
        rating: 4.8,
        coordinate: { latitude: 32.0945, longitude: 34.7930 },
        imageUri: 'https://images.unsplash.com/photo-1519331379826-f94911d94d6e?q=80&w=400&auto=format&fit=crop'
    },
    {
        id: 'p3',
        name: 'Dubnov Garden',
        address: 'Dubnov St 12, Tel Aviv',
        distance: '0.8 km',
        rating: 4.2,
        coordinate: { latitude: 32.0768, longitude: 34.7850 },
        imageUri: 'https://images.unsplash.com/photo-1545652985-5edd3ebc8397?q=80&w=400&auto=format&fit=crop'
    },
];

export interface ParkCheckIn {
    id: string;
    parkId: string;
    dogId: string;
    timestamp: string;
    shareSettings: { showName: boolean; showBreed: boolean; showPhoto: boolean };
}

// Storage Key
const STORAGE_KEY = '@dog_life_app_data_v1';

interface AppDataContextType {
    user: User;
    dogs: Dog[];
    parks: Park[];
    checkIns: ParkCheckIn[];
    selectedDogId: string;
    logs: ActivityLog[];
    isDarkMode: boolean;
    theme: typeof Colors.light;
    toggleTheme: () => void;
    selectDog: (dogId: string) => void;
    addLog: (type: LogType, dogId: string, details?: any) => void;
    getRelevantLogs: () => ActivityLog[];
    // UPDATED: Now accepts optional imageUri and color
    addDog: (name: string, gender: 'male' | 'female', weight: number, breed?: string, imageUri?: string, color?: string) => void;
    updateDog: (dogId: string, updates: Partial<any>) => void;
    updateUser: (updates: Partial<User>) => void;
    addCheckIn: (parkId: string, dogId: string, time: string, shareSettings: any) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
    // Initial states (empty or defaults before loading)
    const [user, setUser] = useState<User>(MOCK_USER);
    const [dogs, setDogs] = useState<Dog[]>([]); // Start empty to wait for load
    const [parks, setParks] = useState<Park[]>(MOCK_PARKS);
    const [checkIns, setCheckIns] = useState<ParkCheckIn[]>([]);
    const [selectedDogId, setSelectedDogId] = useState<string>('all');
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Flag to ensure we don't save empty state over existing data
    const [isLoaded, setIsLoaded] = useState(false);

    const toggleTheme = () => setIsDarkMode(prev => !prev);
    const theme = isDarkMode ? Colors.dark : Colors.light;

    // --- Load Data on Mount ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                if (jsonValue != null) {
                    const data = JSON.parse(jsonValue);
                    setUser(data.user || MOCK_USER);
                    setDogs(data.dogs || MOCK_DOGS);
                    setLogs(data.logs || []);
                    setCheckIns(data.checkIns || []);
                    // Restore selected dog if it still exists
                    if (data.selectedDogId) {
                        setSelectedDogId(data.selectedDogId);
                    }
                } else {
                    // First time launch - load mocks
                    setDogs(MOCK_DOGS);
                }
            } catch (e) {
                console.error("Failed to load data", e);
                // Fallback
                setDogs(MOCK_DOGS);
            } finally {
                setIsLoaded(true);
            }
        };
        loadData();
    }, []);

    // --- Save Data on Change ---
    useEffect(() => {
        if (!isLoaded) return; // Don't save before loading completes

        const saveData = async () => {
            try {
                const dataToSave = {
                    user,
                    dogs,
                    logs,
                    checkIns,
                    selectedDogId
                };
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            } catch (e) {
                console.error("Failed to save data", e);
            }
        };

        saveData();
    }, [user, dogs, logs, checkIns, selectedDogId, isLoaded]);


    const selectDog = (dogId: string) => setSelectedDogId(dogId);

    const addLog = (type: LogType, dogId: string, details: any = {}) => {
        const newLog: ActivityLog = {
            id: Date.now().toString(),
            dogId,
            performedByUserId: user.id,
            timestamp: new Date().toISOString(),
            type,
            details
        };
        setLogs(prev => [newLog, ...prev]);
    };

    const getRelevantLogs = () => {
        if (selectedDogId === 'all') return logs;
        return logs.filter(log => log.dogId === selectedDogId);
    };

    // UPDATED: No longer forcing a default image. imageUri can be null.
    const addDog = (name: string, gender: 'male' | 'female', weight: number, breed?: string, imageUri?: string, color?: string) => {
        const newDog: any = {
            id: Date.now().toString(),
            name,
            gender,
            weight,
            breed: breed || 'Unknown Mix',
            colors: color ? [color] : [], // Use the selected color
            isSterilized: false,
            imageUri: imageUri || null, // If null, the UI will show an icon
            coverImageUri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1000&auto=format&fit=crop',
            chipNumber: '', birthDate: '', foodHabits: { foodBrand: '', dailyAmount: 0, unit: 'gr' }, allergies: '', energyLevel: '', socialInfo: ''
        };
        setDogs(prev => [...prev, newDog]);
        setSelectedDogId(newDog.id);
    };

    const updateDog = (dogId: string, updates: Partial<any>) => {
        setDogs(prevDogs => prevDogs.map(dog => dog.id === dogId ? { ...dog, ...updates } : dog));
    };

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    const addCheckIn = (parkId: string, dogId: string, time: string, shareSettings: any) => {
        const newCheckIn: ParkCheckIn = {
            id: Date.now().toString(),
            parkId,
            dogId,
            timestamp: time,
            shareSettings
        };
        setCheckIns(prev => [...prev, newCheckIn]);
    };

    return (
        <AppDataContext.Provider value={{
            user, dogs, parks, checkIns, selectedDogId, logs,
            isDarkMode, theme, toggleTheme,
            selectDog, addLog, getRelevantLogs, addDog, updateDog, updateUser, addCheckIn
        }}>
            {children}
        </AppDataContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error('useAppData must be used within an AppDataProvider');
    return context;
};