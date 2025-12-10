import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Typography, useAppData } from '../context/AppDataContext';

// --- Constants & Mock Data ---
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - 40 - (COLUMN_COUNT - 1) * 10) / COLUMN_COUNT;

const MOCK_VACCINES = [
    { id: '1', name: 'Rabies', date: '12 Oct 2023', status: 'valid' },
    { id: '2', name: 'Distemper', date: '15 Jan 2024', status: 'valid' },
    { id: '3', name: 'Kennel Cough', date: '01 May 2024', status: 'expired' },
];

const MOCK_GALLERY = [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop',
];

export default function DogProfileScreen() {
    const { dogs, selectedDogId, theme, isDarkMode } = useAppData();
    const navigation = useNavigation<any>();

    const [activeTab, setActiveTab] = useState<'details' | 'medical' | 'gallery'>('details');
    const [isMenuVisible, setMenuVisible] = useState(false);

    // Cast as 'any' to access custom fields safely in UI
    const dog: any = useMemo(() => {
        if (selectedDogId === 'all') return dogs[0];
        return dogs.find(d => d.id === selectedDogId) || dogs[0];
    }, [selectedDogId, dogs]);

    // --- Action Handlers ---

    const handleEditProfile = () => {
        setMenuVisible(false);
        navigation.navigate('EditDog', { dogId: dog.id });
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${dog.name}'s profile on our App! 🐶`,
            });
            setMenuVisible(false);
        } catch (error: any) {
            console.log(error.message);
        }
    };

    const handleDelete = () => {
        setMenuVisible(false);
        Alert.alert("Delete Profile", `Are you sure you want to delete ${dog.name}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => console.log("Deleted") }
        ]);
    };

    // --- Render Functions ---

    const DetailRow = ({ icon, label, value, isAlert = false }: { icon: string, label: string, value: string, isAlert?: boolean }) => (
        <View style={[styles.detailRow, { borderBottomColor: theme.cardBorder }]}>
            <View style={[styles.iconContainer, { backgroundColor: isAlert ? '#FFEBEE' : theme.secondaryBg }]}>
                <Ionicons name={icon as any} size={20} color={isAlert ? theme.danger : theme.primary} />
            </View>
            <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>{label}</Text>
                <Text style={[styles.detailValue, { color: theme.subText }]}>{value}</Text>
            </View>
        </View>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={[styles.sectionHeaderTitle, { color: theme.text, backgroundColor: theme.background }]}>
            {title}
        </Text>
    );

    const renderDetailsTab = () => (
        <View style={styles.detailsList}>
            <SectionHeader title="General Info" />

            <DetailRow icon="paw-outline" label="Breed" value={dog.breed || 'Unknown'} />
            <DetailRow icon="qr-code-outline" label="Chip Number" value={dog.chipNumber || 'Not set'} />
            <DetailRow icon="calendar-outline" label="Birthday" value={dog.birthDate || 'Not set'} />
            <DetailRow icon="male-female-outline" label="Gender" value={`${dog.gender} • ${dog.isSterilized ? 'Neutered' : 'Intact'}`} />

            <SectionHeader title="Food & Care" />
            <DetailRow icon="nutrition-outline" label="Food Brand" value={dog.foodHabits?.foodBrand || 'Not set'} />
            <DetailRow icon="scale-outline" label="Daily Amount" value={dog.foodHabits?.dailyAmount ? `${dog.foodHabits.dailyAmount} ${dog.foodHabits.unit}` : 'Not set'} />
            {dog.allergies ? <DetailRow icon="alert-circle-outline" label="Allergies" value={dog.allergies} isAlert={true} /> : null}

            <SectionHeader title="Personality" />
            <DetailRow icon="flash-outline" label="Energy Level" value={dog.energyLevel || 'Unknown'} />
            <DetailRow icon="people-outline" label="Social" value={dog.socialInfo || 'Unknown'} />
        </View>
    );

    const renderMedicalTab = () => (
        <View style={styles.tabContentContainer}>
            <View style={[styles.vetCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.vetHeader}>
                    <View style={[styles.vetIconBg, { backgroundColor: theme.secondaryBg }]}>
                        <Ionicons name="medkit" size={24} color={theme.danger} />
                    </View>
                    <View>
                        <Text style={[styles.vetName, { color: theme.text }]}>{dog.vetContact?.name || 'No Vet Listed'}</Text>
                        <Text style={[styles.vetSubtext, { color: theme.subText }]}>Primary Veterinarian</Text>
                    </View>
                </View>
                <View style={styles.vetContactRow}>
                    <Ionicons name="call" size={16} color={theme.subText} />
                    <Text style={[styles.vetContactText, { color: theme.subText }]}>{dog.vetContact?.phone || 'No phone'}</Text>
                </View>
                <View style={styles.vetContactRow}>
                    <Ionicons name="location" size={16} color={theme.subText} />
                    <Text style={[styles.vetContactText, { color: theme.subText }]}>{dog.vetContact?.address || 'No address'}</Text>
                </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Vaccination Record</Text>
            {MOCK_VACCINES.map((v) => (
                <View key={v.id} style={[styles.vaccineRow, { borderBottomColor: theme.cardBorder }]}>
                    <View style={styles.vaccineInfo}>
                        <Text style={[styles.vaccineName, { color: theme.text }]}>{v.name}</Text>
                        <Text style={[styles.vaccineDate, { color: theme.subText }]}>Given on: {v.date}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        v.status === 'valid' ? { backgroundColor: isDarkMode ? '#1b5e20' : '#E8F5E9' } : { backgroundColor: isDarkMode ? '#b71c1c' : '#FFEBEE' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            v.status === 'valid' ? { color: isDarkMode ? '#fff' : '#2E7D32' } : { color: isDarkMode ? '#fff' : '#C62828' }
                        ]}>
                            {v.status === 'valid' ? 'Valid' : 'Expired'}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderGalleryTab = () => (
        <View style={styles.galleryGrid}>
            {MOCK_GALLERY.map((imgUri, index) => (
                <View key={index} style={[styles.galleryItem, { backgroundColor: theme.cardBorder }]}>
                    <Image source={{ uri: imgUri }} style={styles.galleryImage} />
                </View>
            ))}
            <TouchableOpacity style={[styles.galleryItem, styles.addPhotoItem, { borderColor: theme.cardBorder, backgroundColor: theme.card }]}>
                <Ionicons name="add" size={30} color={theme.subText} />
            </TouchableOpacity>
        </View>
    );

    const RenderBottomSheet = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isMenuVisible}
            onRequestClose={() => setMenuVisible(false)}
        >
            <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.bottomSheetContainer, { backgroundColor: theme.card }]}>
                            <View style={styles.sheetHandleContainer}>
                                <View style={[styles.sheetHandle, { backgroundColor: theme.cardBorder }]} />
                            </View>

                            <TouchableOpacity style={styles.sheetOption} onPress={handleShare}>
                                <Ionicons name="share-outline" size={24} color={theme.text} />
                                <Text style={[styles.sheetOptionText, { color: theme.text }]}>Share via...</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sheetOption} onPress={handleEditProfile}>
                                <Ionicons name="create-outline" size={24} color={theme.text} />
                                <Text style={[styles.sheetOptionText, { color: theme.text }]}>Edit Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sheetOption} onPress={() => { setMenuVisible(false); alert('Coming soon'); }}>
                                <Ionicons name="document-text-outline" size={24} color={theme.text} />
                                <Text style={[styles.sheetOptionText, { color: theme.text }]}>Export Medical Records</Text>
                            </TouchableOpacity>

                            <View style={[styles.sheetDivider, { backgroundColor: theme.cardBorder }]} />

                            <TouchableOpacity style={styles.sheetOption} onPress={() => { setMenuVisible(false); alert('Marked as Lost - Alert Sent'); }}>
                                <Ionicons name="alert-circle-outline" size={24} color={theme.danger} />
                                <Text style={[styles.sheetOptionText, { color: theme.danger }]}>Mark as Lost</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sheetOption} onPress={handleDelete}>
                                <Ionicons name="trash-outline" size={24} color={theme.danger} />
                                <Text style={[styles.sheetOptionText, { color: theme.danger }]}>Delete Dog Profile</Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    if (!dog) return null;

    const coverSource = dog.coverImageUri
        ? { uri: dog.coverImageUri }
        : { uri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1000&auto=format&fit=crop' };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                <View style={styles.headerContainer}>
                    <Image source={coverSource} style={styles.headerImage} />
                </View>

                <View style={[styles.profileSection, { backgroundColor: theme.background }]}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: dog.imageUri }} style={[styles.avatar, { borderColor: theme.background }]} />
                    </View>

                    <View style={styles.topActions}>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: theme.secondaryBg, borderColor: theme.cardBorder }]}
                            onPress={handleEditProfile}
                        >
                            <Text style={[styles.editButtonText, { color: theme.text }]}>Edit Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.moreButton, { borderColor: theme.cardBorder }]}
                            onPress={() => setMenuVisible(true)}
                        >
                            <Ionicons name="ellipsis-horizontal" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={[styles.name, { color: theme.text }]}>{dog.name}</Text>
                        <Text style={[styles.handle, { color: theme.subText }]}>
                            @{dog.name}The{dog.gender === 'male' ? 'Boy' : 'Girl'}
                        </Text>

                        {dog.notes ? <Text style={[styles.bioText, { color: theme.text }]}>{dog.notes}</Text> : null}

                        <View style={styles.statsRow}>
                            <Text style={[styles.statText, { color: theme.subText }]}>3 Years Old</Text>
                            <Text style={[styles.statDivider, { color: theme.subText }]}>•</Text>
                            <Text style={[styles.statText, { color: theme.subText }]}>{dog.weight}kg</Text>
                            <Text style={[styles.statDivider, { color: theme.subText }]}>•</Text>
                            <Text style={[styles.statText, { color: theme.subText }]}>{dog.gender === 'male' ? 'Male' : 'Female'}</Text>
                        </View>
                    </View>

                    <View style={[styles.tabBar, { borderBottomColor: theme.cardBorder }]}>
                        <TouchableOpacity onPress={() => setActiveTab('details')} style={[styles.tabItem, activeTab === 'details' && { borderBottomColor: theme.primary }]}>
                            <Text style={[styles.tabText, { color: activeTab === 'details' ? theme.text : theme.subText }]}>Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('medical')} style={[styles.tabItem, activeTab === 'medical' && { borderBottomColor: theme.primary }]}>
                            <Text style={[styles.tabText, { color: activeTab === 'medical' ? theme.text : theme.subText }]}>Medical</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('gallery')} style={[styles.tabItem, activeTab === 'gallery' && { borderBottomColor: theme.primary }]}>
                            <Text style={[styles.tabText, { color: activeTab === 'gallery' ? theme.text : theme.subText }]}>Gallery</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contentArea}>
                        {activeTab === 'details' && renderDetailsTab()}
                        {activeTab === 'medical' && renderMedicalTab()}
                        {activeTab === 'gallery' && renderGalleryTab()}
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <RenderBottomSheet />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    headerContainer: { height: 240, width: '100%', backgroundColor: '#ccc' },
    headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },

    backButton: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },

    profileSection: { marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, minHeight: 500 },
    avatarContainer: { position: 'absolute', top: -50, left: 20, zIndex: 1 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4 },
    topActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 15, height: 40, marginBottom: 5 },
    editButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, borderWidth: 1 },
    editButtonText: { fontWeight: '700', fontSize: 14 },
    moreButton: { padding: 8, borderRadius: 20, borderWidth: 1 },

    infoContainer: { marginTop: 25 },
    name: { fontSize: 26, fontWeight: '800', marginBottom: 2 },
    handle: { fontSize: 15, marginBottom: 8 },
    bioText: { ...Typography.body, marginBottom: 15, lineHeight: 22 },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    statText: { ...Typography.body },
    statDivider: { marginHorizontal: 6 },

    tabBar: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 20 },
    tabItem: { paddingVertical: 14, marginRight: 25, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabText: { ...Typography.cardTitle },
    contentArea: { minHeight: 200 },

    detailsList: { marginTop: 0 },

    // Updated to match Home Screen styles
    sectionHeaderTitle: {
        ...Typography.sectionTitle,
        marginTop: 15,
        marginBottom: 10,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
    iconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    detailContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { ...Typography.cardTitle, fontWeight: '500' },
    detailValue: { ...Typography.body },

    tabContentContainer: { paddingTop: 10 },
    vetCard: { borderRadius: 16, padding: 16, marginBottom: 25, borderWidth: 1 },
    vetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    vetIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    vetName: { ...Typography.cardTitle },
    vetSubtext: { ...Typography.caption },
    vetContactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
    vetContactText: { ...Typography.body },

    sectionTitle: { ...Typography.sectionTitle, marginBottom: 15 },
    vaccineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    vaccineInfo: {},
    vaccineName: { ...Typography.cardTitle, marginBottom: 4 },
    vaccineDate: { ...Typography.caption },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusText: { fontSize: 12, fontWeight: '600' },

    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    galleryItem: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 12, overflow: 'hidden' },
    galleryImage: { width: '100%', height: '100%' },
    addPhotoItem: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'flex-end' },
    bottomSheetContainer: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, paddingHorizontal: 20, paddingTop: 10 },
    sheetHandleContainer: { alignItems: 'center', marginBottom: 20 },
    sheetHandle: { width: 40, height: 4, borderRadius: 2 },
    sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15 },
    sheetOptionText: { fontSize: 16, fontWeight: '500' },
    sheetDivider: { height: 1, marginVertical: 10 },
});