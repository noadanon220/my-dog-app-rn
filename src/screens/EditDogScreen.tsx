import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppData } from '../context/AppDataContext';

export default function EditDogScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { dogs, updateDog, theme } = useAppData();

    const { dogId } = route.params || {};
    const dogToEdit: any = dogs.find(d => d.id === dogId);

    const [name, setName] = useState('');
    const [weight, setWeight] = useState('');
    const [breed, setBreed] = useState('');
    const [description, setDescription] = useState('');

    // New Fields
    const [chipNumber, setChipNumber] = useState('');
    const [foodBrand, setFoodBrand] = useState('');
    const [foodAmount, setFoodAmount] = useState('');
    const [allergies, setAllergies] = useState('');
    const [energyLevel, setEnergyLevel] = useState('');
    const [socialInfo, setSocialInfo] = useState('');

    useEffect(() => {
        if (dogToEdit) {
            setName(dogToEdit.name);
            setWeight(dogToEdit.weight?.toString() || '');
            setBreed(dogToEdit.breed || '');
            setDescription(dogToEdit.notes || '');

            setChipNumber(dogToEdit.chipNumber || '');
            setFoodBrand(dogToEdit.foodHabits?.foodBrand || '');
            setFoodAmount(dogToEdit.foodHabits?.dailyAmount?.toString() || '');
            setAllergies(dogToEdit.allergies || '');
            setEnergyLevel(dogToEdit.energyLevel || '');
            setSocialInfo(dogToEdit.socialInfo || '');
        }
    }, [dogToEdit]);

    const handleSave = () => {
        if (!name || !weight) {
            Alert.alert('Missing Info', 'Please fill in at least the name and weight.');
            return;
        }

        if (dogId && updateDog) {
            updateDog(dogId, {
                name,
                weight: parseFloat(weight),
                breed,
                notes: description,
                chipNumber,
                allergies,
                energyLevel,
                socialInfo,
                foodHabits: {
                    foodBrand,
                    dailyAmount: parseFloat(foodAmount) || 0,
                    unit: 'gr'
                }
            });
            navigation.goBack();
        }
    };

    const handleAvatarPress = () => Alert.alert("Change Avatar", "Camera/Gallery picker coming soon!");
    const handleCoverPress = () => Alert.alert("Change Cover", "Feature coming soon!");

    if (!dogToEdit) return null;

    const coverSource = dogToEdit.coverImageUri
        ? { uri: dogToEdit.coverImageUri }
        : { uri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1000&auto=format&fit=crop' };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Edit profile</Text>
                <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                    <Text style={[styles.saveText, { color: theme.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled" // Important for scrolling with keyboard
                    keyboardDismissMode="on-drag" // Dismiss keyboard when scrolling
                >

                    {/* Visuals */}
                    <TouchableOpacity onPress={handleCoverPress} activeOpacity={0.9} style={styles.coverContainer}>
                        <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
                        <View style={[styles.coverCameraBadge, { backgroundColor: theme.iconBg }]}>
                            <Ionicons name="camera" size={18} color={theme.text} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: dogToEdit.imageUri }}
                                    style={[styles.avatar, { borderColor: theme.background }]}
                                />
                                <View style={[styles.avatarCameraBadge, { backgroundColor: theme.iconBg }]}>
                                    <Ionicons name="camera" size={14} color={theme.text} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Form Inputs */}
                    <View style={styles.formContainer}>

                        {/* General */}
                        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Basic Info</Text>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={[styles.label, { color: theme.subText }]}>Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={theme.subText}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.subText }]}>Breed</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                    value={breed}
                                    onChangeText={setBreed}
                                    placeholderTextColor={theme.subText}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={[styles.label, { color: theme.subText }]}>Weight (kg)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.subText}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.subText }]}>Chip Number</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                    value={chipNumber}
                                    onChangeText={setChipNumber}
                                    placeholderTextColor={theme.subText}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Food */}
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 10 }]}>Food & Habits</Text>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={[styles.label, { color: theme.subText }]}>Food Brand</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                    value={foodBrand}
                                    onChangeText={setFoodBrand}
                                    placeholderTextColor={theme.subText}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.subText }]}>Daily (gr)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                    value={foodAmount}
                                    onChangeText={setFoodAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.subText}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.subText }]}>Allergies</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                value={allergies}
                                onChangeText={setAllergies}
                                placeholder="e.g. Chicken, Grain"
                                placeholderTextColor={theme.subText}
                            />
                        </View>

                        {/* Personality */}
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 10 }]}>Personality</Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.subText }]}>Energy Level</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                value={energyLevel}
                                onChangeText={setEnergyLevel}
                                placeholder="e.g. High, Lazy, Moderate"
                                placeholderTextColor={theme.subText}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.subText }]}>Social Behavior</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }]}
                                value={socialInfo}
                                onChangeText={setSocialInfo}
                                placeholder="e.g. Loves dogs, shy with people"
                                placeholderTextColor={theme.subText}
                            />
                        </View>

                        {/* Description */}
                        <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 10 }]}>About</Text>
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    { backgroundColor: theme.card, color: theme.text, borderColor: theme.cardBorder }
                                ]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Tell us a bit about your dog..."
                                placeholderTextColor={theme.subText}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, borderBottomWidth: 1, zIndex: 10 },
    headerButton: { padding: 5 },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    cancelText: { fontSize: 16, fontWeight: '400' },
    saveText: { fontSize: 16, fontWeight: '700' },

    // Increased paddingBottom to fix scrolling issue
    content: { paddingBottom: 100 },

    coverContainer: { height: 150, width: '100%', marginBottom: -50, position: 'relative', zIndex: 1 },
    coverImage: { width: '100%', height: '100%' },
    coverCameraBadge: { position: 'absolute', right: 20, bottom: -18, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, zIndex: 100 },
    avatarSection: { alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 25, zIndex: 2 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4 },
    avatarCameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    formContainer: { paddingHorizontal: 20, marginTop: 25 },
    sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 15, textTransform: 'uppercase', opacity: 0.8 },
    inputGroup: { marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { height: 50, borderRadius: 10, paddingHorizontal: 15, fontSize: 16, borderWidth: 1 },
    textArea: { height: 100, paddingTop: 15 },
});