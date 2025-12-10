// --- Basic Definitions (Enums / Union Types) ---

// Using Union Types is often preferred over Enums for better DB readability and simplicity
export type Gender = 'male' | 'female';
export type ActivityLevel = 'low' | 'medium' | 'high';
export type MeasurementUnit = 'grams' | 'cups' | 'scoops';

// Activity types that the user can log
export type LogType = 'walk' | 'food' | 'medication' | 'poop' | 'weight' | 'vaccine';

// Stool scale (similar to Bristol Scale for dogs)
// 1 = Hard pellets, 7 = Watery
export type PoopTexture = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// --- Main Entities ---

export interface User {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string; // Optional
}

export interface Dog {
    id: string; // Unique Identifier (GUID)
    name: string;
    imageUri?: string; // Image uploaded by the user

    // Demographic Details
    birthDate?: string; // Stored as ISO string to avoid date conversion issues
    adoptionDate?: string;
    gender: Gender;
    colors: string[]; // Array because a dog can be multi-colored (e.g., "Black" and "White")
    breed?: string;

    // Physical Details
    weight: number; // Current weight in Kg
    isSterilized: boolean;
    chipNumber?: string;

    // Medical & Care Details
    vetContact?: {
        name: string;
        phone: string;
        address?: string;
    };

    // Habits (Defaults) - Helps to auto-fill logs for quicker entry
    foodHabits?: {
        foodBrand: string;
        dailyAmount: number;
        unit: MeasurementUnit;
        timesPerDay: number;
    };

    notes?: string;
}

// --- Activity Management (The Feed) ---

// Generic interface for logging an activity. 
// Note: This allows displaying a mixed feed of walks, food, etc.
export interface ActivityLog {
    id: string;
    dogId: string; // Which dog this belongs to
    performedByUserId: string; // Who performed the action (Me, Partner, Dog walker)
    timestamp: string; // When it happened (ISO String)
    type: LogType;

    // Specific details based on activity type (Optional)
    details?: {
        durationMinutes?: number; // For walks
        distanceMeters?: number; // For walks
        amountEaten?: number; // For food
        poopScore?: PoopTexture; // For poop
        medicationName?: string; // For medication
        note?: string; // Free text note (e.g., "Looked tired during the walk")
    };
}

// --- Permissions & Sharing ---

export type AccessLevel = 'owner' | 'editor' | 'sitter' | 'viewer';

export interface DogShare {
    id: string;
    dogId: string;
    userId: string; // The user granted access
    role: AccessLevel;
    sitterExpirationDate?: string; // Relevant only for Sitter mode - when access expires
}