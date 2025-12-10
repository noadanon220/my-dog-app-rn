import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // Import Image Picker
import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Typography, useAppData } from '../context/AppDataContext';

// --- Constants ---
// Updated: 12 Happy & Fun Colors Palette
const DOG_COLORS = [
    '#FF8A80', // Coral Red
    '#FF80AB', // Hot Pink
    '#EA80FC', // Bright Purple
    '#B39DDB', // Deep Lilac
    '#8C9EFF', // Soft Indigo
    '#82B1FF', // Soft Blue
    '#80D8FF', // Sky Blue
    '#84FFFF', // Cyan
    '#A7FFEB', // Teal Mint
    '#B9F6CA', // Green Mint
    '#FFFF8D', // Sunny Yellow
    '#FFD180', // Bright Orange
];

export default function AddDogScreen() {
    const navigation = useNavigation();
    const { addDog, theme } = useAppData();

    const [step, setStep] = useState(1); // Step 1: Info, Step 2: Look

    // Step 1 State
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male'); // Default
    const [weight, setWeight] = useState('');
    const [breed, setBreed] = useState('');

    // Step 2 State
    const [selectedColor, setSelectedColor] = useState(DOG_COLORS[0]);
    const [imageUri, setImageUri] = useState<string | null>(null);

    // Function to pick image from gallery
    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Updated specifically for newer Expo SDKs
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Validate Step 1 and move to Step 2
    const handleNext = () => {
        if (!name || !weight) {
            alert('Please fill in the name and weight!');
            return;
        }
        setStep(2);
    };

    // Save all data including image and color
    const handleSave = () => {
        addDog(name, gender, parseFloat(weight), breed, imageUri || undefined, selectedColor);
        navigation.goBack();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    {/* Back button logic: Go back to Step 1 if on Step 2, otherwise close modal */}
                    <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(1)} style={styles.closeButton}>
                        <Ionicons name={step === 1 ? "close" : "arrow-back"} size={28} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {step === 1 ? 'New Friend 🐶' : 'Make it Personal 🎨'}
                    </Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {step === 1 ? (
                        <>
                            {/* --- Step 1: Basic Info --- */}

                            {/* 1. Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.subText }]}>What's their name?</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderBottomColor: theme.cardBorder }]}
                                    placeholder="e.g. Charlie"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={theme.subText}
                                />
                            </View>

                            {/* 2. Gender Selection (Restored Original Look) */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.subText }]}>Boy or Girl?</Text>
                                <View style={styles.genderContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.genderButton,
                                            gender === 'male' && styles.genderSelected,
                                            { borderColor: '#81D4FA' }
                                        ]}
                                        onPress={() => setGender('male')}
                                    >
                                        <Ionicons name="male" size={24} color={gender === 'male' ? '#0288D1' : '#ccc'} />
                                        <Text style={[styles.genderText, gender === 'male' && { color: '#0288D1' }]}>Boy</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.genderButton,
                                            gender === 'female' && styles.genderSelected,
                                            { borderColor: '#F48FB1' }
                                        ]}
                                        onPress={() => setGender('female')}
                                    >
                                        <Ionicons name="female" size={24} color={gender === 'female' ? '#C2185B' : '#ccc'} />
                                        <Text style={[styles.genderText, gender === 'female' && { color: '#C2185B' }]}>Girl</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* 3. Weight Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.subText }]}>Weight (kg)</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderBottomColor: theme.cardBorder }]}
                                    placeholder="e.g. 12.5"
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.subText}
                                />
                            </View>

                            {/* 4. Breed Input (Optional) */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.subText }]}>Breed (Optional)</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderBottomColor: theme.cardBorder }]}
                                    placeholder="e.g. Poodle"
                                    value={breed}
                                    onChangeText={setBreed}
                                    placeholderTextColor={theme.subText}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            {/* --- Step 2: Visuals --- */}

                            {/* Image Picker */}
                            <View style={styles.imagePickerContainer}>
                                <TouchableOpacity onPress={pickImage} style={[styles.imageCircle, { borderColor: theme.cardBorder, backgroundColor: theme.secondaryBg }]}>
                                    {imageUri ? (
                                        <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                                    ) : (
                                        <Ionicons name="camera-outline" size={40} color={theme.subText} />
                                    )}
                                    <View style={[styles.cameraBadge, { backgroundColor: theme.primary }]}>
                                        <Ionicons name="add" size={16} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                                <Text style={[styles.helperText, { color: theme.subText }]}>Upload a photo</Text>
                            </View>

                            {/* Color Picker */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.subText }]}>Choose a Theme Color</Text>
                                <View style={styles.colorsGrid}>
                                    {DOG_COLORS.map(color => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorCircle,
                                                { backgroundColor: color },
                                                selectedColor === color && styles.selectedColorCircle
                                            ]}
                                            onPress={() => setSelectedColor(color)}
                                        >
                                            {selectedColor === color && <Ionicons name="checkmark" size={16} color="#000" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}

                </ScrollView>

                {/* Footer / Submit Button */}
                <View style={[styles.footer, { borderTopColor: theme.cardBorder }]}>
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.primary }]}
                        onPress={step === 1 ? handleNext : handleSave}
                    >
                        <Text style={styles.submitButtonText}>
                            {step === 1 ? 'Next Step' : 'Welcome Home! 🏠'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    },
    closeButton: { padding: 5 },
    // Using Typography from context for title
    title: { ...Typography.header },

    content: { paddingHorizontal: 30, paddingBottom: 100 },

    inputGroup: { marginBottom: 30 },
    // Using Typography for labels
    label: { ...Typography.cardTitle, marginBottom: 10 },
    input: {
        fontSize: 22, fontWeight: '500',
        borderBottomWidth: 1,
        paddingVertical: 10
    },

    // --- Gender Selection Styles (Restored) ---
    genderContainer: { flexDirection: 'row', gap: 20 },
    genderButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee',
        gap: 10, backgroundColor: '#FAFAFA'
    },
    genderSelected: { backgroundColor: '#fff', borderWidth: 2 },
    genderText: { fontSize: 16, fontWeight: '600', color: '#999' },

    // --- Step 2 Styles ---
    imagePickerContainer: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    imageCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
    selectedImage: { width: 120, height: 120, borderRadius: 60 },
    cameraBadge: { position: 'absolute', bottom: 5, right: 5, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    helperText: { marginTop: 10, fontSize: 14 },

    colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
    colorCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    selectedColorCircle: { borderWidth: 3, borderColor: '#333' },

    footer: {
        padding: 20, paddingBottom: 40,
        borderTopWidth: 1
    },
    submitButton: {
        borderRadius: 16, paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
    },
    submitButtonText: { fontSize: 18, fontWeight: '700', color: '#fff' }
});