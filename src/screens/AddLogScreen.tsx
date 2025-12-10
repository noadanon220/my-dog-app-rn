import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    View
} from 'react-native';
import { ICONS } from '../../assets/icons';
import { useAppData } from '../context/AppDataContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ACTIONS = [
    { id: 'walk', label: 'Walk', icon: 'walk', color: '#E8F5E9', mainColor: '#4CAF50', unit: 'min', placeholder: '0' },
    { id: 'food', label: 'Food', icon: 'food', color: '#FFF3E0', mainColor: '#FF9800', unit: 'gr', placeholder: '0' },
    { id: 'poop', label: 'Poop', icon: 'poop', color: '#ECEFF1', mainColor: '#607D8B', unit: '', placeholder: 'Add Note' },
    { id: 'weight', label: 'Weight', icon: 'default', color: '#F3E5F5', mainColor: '#9C27B0', unit: 'kg', placeholder: '0.0' },
    { id: 'vet', label: 'Vet', icon: 'vet', color: '#FFEBEE', mainColor: '#F44336', unit: '', placeholder: 'Treatment' },
];

export default function AddLogScreen() {
    const navigation = useNavigation();
    const { addLog, selectedDogId, dogs } = useAppData();

    const [step, setStep] = useState(0);
    const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [note, setNote] = useState('');

    const activeAction = ACTIONS.find(a => a.id === selectedActionId);

    const handleActionSelect = (actionId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedActionId(actionId);
        setInputValue('');
        setNote('');
        setStep(1);
    };

    const handleBack = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStep(0);
        setSelectedActionId(null);
    };

    const handleSubmit = () => {
        if (!selectedActionId) return;
        const targetDogId = selectedDogId === 'all' ? dogs[0]?.id : selectedDogId;
        if (!targetDogId) {
            Alert.alert("Error", "No dog available!");
            return;
        }

        const details: any = {};
        const numericValue = parseFloat(inputValue);

        if (inputValue) {
            if (selectedActionId === 'walk') details.durationMinutes = numericValue;
            else if (selectedActionId === 'food') details.amountEaten = numericValue;
            else if (selectedActionId === 'weight') details.weight = numericValue;
            else if (selectedActionId === 'vet') details.medicationName = inputValue;
        }
        if (note) details.note = note;

        addLog(selectedActionId as any, targetDogId, details);
        navigation.goBack();
    };

    const renderSelectionStep = () => {
        const renderItem = ({ item }: { item: any }) => {
            const IconComponent = ICONS[item.icon as keyof typeof ICONS] || ICONS.default;
            return (
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: item.color }]}
                    onPress={() => handleActionSelect(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <IconComponent width={32} height={32} color={item.mainColor} />
                    </View>
                    <Text style={[styles.cardLabel, { color: item.mainColor }]}>{item.label}</Text>
                </TouchableOpacity>
            );
        };

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.headerTitle}>What's happening?</Text>
                <FlatList
                    data={ACTIONS}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
                <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelLinkText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderInputStep = () => {
        if (!activeAction) return null;
        const IconComponent = ICONS[activeAction.icon as keyof typeof ICONS] || ICONS.default;
        const isNumeric = activeAction.unit !== '';

        return (
            <View style={[styles.stepContainer, { backgroundColor: activeAction.color }]}>
                <View style={styles.topNav}>
                    <TouchableOpacity onPress={handleBack} style={styles.navButton}>
                        <Ionicons name="arrow-back" size={28} color={activeAction.mainColor} />
                    </TouchableOpacity>
                    <Text style={[styles.stepTitle, { color: activeAction.mainColor }]}>
                        {activeAction.label}
                    </Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.inputCenterContainer}>
                    <View style={styles.heroIconCircle}>
                        <IconComponent width={40} height={40} color={activeAction.mainColor} />
                    </View>
                    <View style={styles.mainInputWrapper}>
                        <TextInput
                            style={[styles.hugeInput, { color: activeAction.mainColor }]}
                            placeholder={activeAction.placeholder}
                            placeholderTextColor="rgba(0,0,0,0.1)"
                            keyboardType={isNumeric ? 'numeric' : 'default'}
                            value={inputValue}
                            onChangeText={setInputValue}
                            autoFocus
                            selectionColor={activeAction.mainColor}
                        />
                        {activeAction.unit ? (
                            <Text style={[styles.unitLabel, { color: activeAction.mainColor }]}>
                                {activeAction.unit}
                            </Text>
                        ) : null}
                    </View>
                    <TextInput
                        style={styles.subtleNoteInput}
                        placeholder="Add a note... (optional)"
                        placeholderTextColor={activeAction.mainColor + '80'}
                        value={note}
                        onChangeText={setNote}
                    />
                </View>

                <View style={styles.footerContainer}>
                    <TouchableOpacity
                        style={[styles.bigFab, { backgroundColor: activeAction.mainColor }]}
                        onPress={handleSubmit}
                    >
                        <Ionicons name="checkmark" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {step === 0 ? renderSelectionStep() : renderInputStep()}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    stepContainer: { flex: 1, paddingTop: 60 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 30, paddingHorizontal: 25 },
    list: { alignItems: 'center' },
    card: {
        width: 155, height: 120, borderRadius: 24, padding: 15,
        justifyContent: 'space-between', margin: 8,
    },
    iconContainer: {
        width: 45, height: 45, borderRadius: 25, backgroundColor: '#ffffff',
        justifyContent: 'center', alignItems: 'center'
    },
    cardLabel: { fontSize: 18, fontWeight: '700' },
    cancelLink: { alignSelf: 'center', marginTop: 20, padding: 15 },
    cancelLinkText: { fontSize: 16, color: '#999', fontWeight: '600' },
    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 40 },
    navButton: { padding: 5 },
    stepTitle: { fontSize: 20, fontWeight: '700' },
    inputCenterContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -50 },
    heroIconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5
    },
    mainInputWrapper: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
    hugeInput: { fontSize: 64, fontWeight: '800', textAlign: 'center', minWidth: 60, padding: 0, margin: 0 },
    unitLabel: { fontSize: 24, fontWeight: '600', marginLeft: 10 },
    subtleNoteInput: {
        fontSize: 18, fontWeight: '500', color: '#555', textAlign: 'center', minWidth: 200, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)'
    },
    footerContainer: { padding: 30, alignItems: 'center' },
    bigFab: {
        width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8
    }
});