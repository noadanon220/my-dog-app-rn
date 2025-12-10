import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
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
import { useAppData } from '../context/AppDataContext';

// --- Constants ---
const PRIMARY_COLOR = '#3a5e98';

export default function AddDogScreen() {
    const navigation = useNavigation();
    const { addDog } = useAppData();

    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male'); // Default
    const [weight, setWeight] = useState('');
    const [breed, setBreed] = useState('');

    const handleSave = () => {
        if (!name || !weight) {
            alert('Please fill in the name and weight!');
            return;
        }

        addDog(name, gender, parseFloat(weight), breed);
        navigation.goBack();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>New Friend 🐶</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* 1. Name Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>What's their name?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Charlie"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#ccc"
                        />
                    </View>

                    {/* 2. Gender Selection */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Boy or Girl?</Text>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[styles.genderButton, gender === 'male' && styles.genderSelected, { borderColor: '#81D4FA' }]}
                                onPress={() => setGender('male')}
                            >
                                <Ionicons name="male" size={24} color={gender === 'male' ? '#0288D1' : '#ccc'} />
                                <Text style={[styles.genderText, gender === 'male' && { color: '#0288D1' }]}>Boy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.genderButton, gender === 'female' && styles.genderSelected, { borderColor: '#F48FB1' }]}
                                onPress={() => setGender('female')}
                            >
                                <Ionicons name="female" size={24} color={gender === 'female' ? '#C2185B' : '#ccc'} />
                                <Text style={[styles.genderText, gender === 'female' && { color: '#C2185B' }]}>Girl</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 3. Weight Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Weight (kg)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 12.5"
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                            placeholderTextColor="#ccc"
                        />
                    </View>

                    {/* 4. Breed Input (Optional) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Breed (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Poodle"
                            value={breed}
                            onChangeText={setBreed}
                            placeholderTextColor="#ccc"
                        />
                    </View>

                </ScrollView>

                {/* Footer / Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
                        <Text style={styles.submitButtonText}>Welcome Home! 🏠</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    },
    closeButton: { padding: 5 },
    title: { fontSize: 20, fontWeight: '700', color: '#333' },

    content: { paddingHorizontal: 30, paddingBottom: 100 },

    inputGroup: { marginBottom: 30 },
    label: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 10 },
    input: {
        fontSize: 22, fontWeight: '500', color: '#333',
        borderBottomWidth: 1, borderBottomColor: '#eee',
        paddingVertical: 10
    },

    genderContainer: { flexDirection: 'row', gap: 20 },
    genderButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee',
        gap: 10, backgroundColor: '#FAFAFA'
    },
    genderSelected: { backgroundColor: '#fff', borderWidth: 2 },
    genderText: { fontSize: 16, fontWeight: '600', color: '#999' },

    footer: {
        padding: 20, paddingBottom: 40,
        borderTopWidth: 1, borderTopColor: '#f5f5f5'
    },
    submitButton: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 16, paddingVertical: 18,
        alignItems: 'center',
        shadowColor: PRIMARY_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
    },
    submitButtonText: { fontSize: 18, fontWeight: '700', color: '#fff' }
});