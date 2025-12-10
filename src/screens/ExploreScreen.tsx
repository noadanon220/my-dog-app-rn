import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Park, Typography, useAppData } from '../context/AppDataContext';

export default function ExploreScreen() {
    const { parks, dogs, addCheckIn, checkIns, theme, isDarkMode } = useAppData();
    const mapRef = useRef<MapView>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPark, setSelectedPark] = useState<Park | null>(null);

    // Check-In Logic
    const [checkInPark, setCheckInPark] = useState<Park | null>(null);
    const [isCheckInModalVisible, setCheckInModalVisible] = useState(false);

    const INITIAL_REGION = {
        latitude: 32.0735,
        longitude: 34.7745,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
    };

    const safeParks = parks || [];
    const filteredParks = safeParks.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Changed: Array of selected IDs instead of a single string
    const [selectedDogs, setSelectedDogs] = useState<string[]>([]);

    const [arrivalTime, setArrivalTime] = useState('Now');
    const [shareName, setShareName] = useState(true);
    const [sharePhoto, setSharePhoto] = useState(true);

    // Toggle Selection Helper
    const toggleDogSelection = (dogId: string) => {
        setSelectedDogs(prevSelected => {
            if (prevSelected.includes(dogId)) {
                // Remove if already selected
                return prevSelected.filter(id => id !== dogId);
            } else {
                // Add if not selected
                return [...prevSelected, dogId];
            }
        });
    };

    const handleCheckInSubmit = () => {
        if (!checkInPark) return;

        if (selectedDogs.length === 0) {
            Alert.alert("Choose a Dog", "Please select at least one dog to check in.");
            return;
        }

        // Create a check-in event for EACH selected dog
        selectedDogs.forEach(dogId => {
            addCheckIn(checkInPark.id, dogId, arrivalTime, {
                showName: shareName,
                showPhoto: sharePhoto,
                showBreed: true
            });
        });

        setCheckInModalVisible(false);
        setCheckInPark(null);
        setSelectedDogs([]); // Reset selection
        Alert.alert("Checked In!", `You checked in ${selectedDogs.length} dog(s) successfully.`);
    };

    const handleOpenCheckIn = () => {
        if (selectedPark) {
            setCheckInPark(selectedPark);
            setSelectedPark(null);
            // Default select the first dog if none selected, for convenience
            if (selectedDogs.length === 0 && dogs.length > 0) {
                setSelectedDogs([dogs[0].id]);
            }
            setTimeout(() => {
                setCheckInModalVisible(true);
            }, 300);
        }
    };

    const handleParkSelect = (park: Park) => {
        setSelectedPark(park);
        mapRef.current?.animateToRegion({
            latitude: park.coordinate.latitude,
            longitude: park.coordinate.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 500);
    };

    // --- Render Functions ---

    const renderParkCard = ({ item }: { item: Park }) => (
        <TouchableOpacity
            style={[styles.parkCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => handleParkSelect(item)}
            activeOpacity={0.9}
        >
            <View style={styles.cardImageContainer}>
                <Image source={{ uri: item.imageUri }} style={styles.parkCardImage} resizeMode="cover" />
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
            </View>
            <View style={styles.parkCardContent}>
                <Text style={[styles.parkCardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                <View style={styles.distanceRow}>
                    <Ionicons name="navigate" size={12} color={theme.primary} />
                    <Text style={[styles.parkCardDistance, { color: theme.subText }]}>{item.distance}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderParkDetails = () => {
        if (!selectedPark) return null;
        const visitors = (checkIns || []).filter(c => c.parkId === selectedPark.id);
        return (
            <Modal animationType="slide" transparent={true} visible={!!selectedPark} onRequestClose={() => setSelectedPark(null)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.bottomSheet, { backgroundColor: theme.card }]}>
                        <View style={styles.handleContainer}><View style={[styles.handle, { backgroundColor: theme.cardBorder }]} /></View>
                        <View style={styles.detailsHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.detailsTitle, { color: theme.text }]}>{selectedPark.name}</Text>
                                <Text style={[styles.detailsAddress, { color: theme.subText }]}>{selectedPark.address}</Text>
                            </View>
                            <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.secondaryBg }]} onPress={() => setSelectedPark(null)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Who is here? ({visitors.length})</Text>
                        {visitors.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <Ionicons name="paw-outline" size={40} color={theme.cardBorder} />
                                <Text style={[styles.emptyText, { color: theme.subText }]}>Looks quiet. Be the first!</Text>
                            </View>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.visitorsList}>
                                {visitors.map((visit, idx) => {
                                    const dogInfo = dogs.find(d => d.id === visit.dogId);
                                    if (!dogInfo) return null;
                                    return (
                                        <View key={idx} style={styles.visitorItem}>
                                            <Image source={{ uri: visit.shareSettings.showPhoto ? dogInfo.imageUri : 'https://via.placeholder.com/50' }} style={styles.visitorImage} />
                                            <Text style={[styles.visitorName, { color: theme.text }]}>{visit.shareSettings.showName ? dogInfo.name : 'Guest'}</Text>
                                            <Text style={[styles.visitorTime, { color: theme.primary }]}>{visit.timestamp}</Text>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        )}
                        <TouchableOpacity style={[styles.checkInButton, { backgroundColor: theme.primary }]} onPress={handleOpenCheckIn}>
                            <Ionicons name="location" size={20} color="#fff" />
                            <Text style={styles.checkInButtonText}>I'm Coming!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderCheckInModal = () => (
        <Modal animationType="slide" transparent={true} visible={isCheckInModalVisible} onRequestClose={() => setCheckInModalVisible(false)}>
            <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={[styles.checkInDialog, { backgroundColor: theme.card }]}>
                    <Text style={[styles.dialogTitle, { color: theme.text }]}>Check In</Text>
                    <Text style={[styles.dialogSubtitle, { color: theme.subText }]}>
                        Let others know you are coming to {checkInPark?.name}
                    </Text>

                    <Text style={[styles.label, { color: theme.text }]}>Who is coming? (Select all that apply)</Text>

                    {/* Multi-Select Dog List */}
                    <ScrollView horizontal contentContainerStyle={{ gap: 10, marginBottom: 20 }}>
                        {dogs.map(dog => {
                            const isSelected = selectedDogs.includes(dog.id);
                            return (
                                <TouchableOpacity
                                    key={dog.id}
                                    style={[
                                        styles.dogSelector,
                                        {
                                            borderColor: isSelected ? theme.primary : theme.cardBorder,
                                            backgroundColor: isSelected ? theme.secondaryBg : 'transparent',
                                            borderWidth: isSelected ? 2 : 1
                                        }
                                    ]}
                                    onPress={() => toggleDogSelection(dog.id)}
                                >
                                    <Image source={{ uri: dog.imageUri }} style={styles.selectorImage} />
                                    <Text style={[
                                        styles.selectorText,
                                        { color: isSelected ? theme.primary : theme.text, fontWeight: isSelected ? '700' : '500' }
                                    ]}>
                                        {dog.name}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.checkBadge}>
                                            <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <Text style={[styles.label, { color: theme.text }]}>When?</Text>
                    <View style={styles.timeRow}>
                        {['Now', '15 min', '17:00', '18:00'].map(time => (
                            <TouchableOpacity key={time} style={[styles.timeChip, { backgroundColor: arrivalTime === time ? theme.primary : theme.secondaryBg }]} onPress={() => setArrivalTime(time)}>
                                <Text style={[styles.timeText, { color: arrivalTime === time ? '#fff' : theme.text }]}>{time}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: theme.text, marginTop: 20 }]}>Share Options</Text>
                    <View style={styles.switchRow}><Text style={[styles.switchLabel, { color: theme.text }]}>Show Name</Text><Switch value={shareName} onValueChange={setShareName} trackColor={{ true: theme.primary }} /></View>
                    <View style={styles.switchRow}><Text style={[styles.switchLabel, { color: theme.text }]}>Show Photo</Text><Switch value={sharePhoto} onValueChange={setSharePhoto} trackColor={{ true: theme.primary }} /></View>

                    <View style={styles.dialogActions}>
                        <TouchableOpacity onPress={() => setCheckInModalVisible(false)} style={styles.cancelButton}><Text style={[styles.cancelButtonText, { color: theme.subText }]}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleCheckInSubmit} style={[styles.confirmButton, { backgroundColor: theme.success }]}>
                            <Text style={styles.confirmButtonText}>Announce ({selectedDogs.length})</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.card, zIndex: 20 }}>
                <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Explore</Text>
                </View>
            </SafeAreaView>

            {/* Main Content */}
            <View style={styles.contentContainer}>
                {/* Search Bar */}
                <View style={[styles.searchContainer, { top: 10 }]}>
                    <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Ionicons name="search" size={20} color={theme.subText} />
                        <TextInput
                            placeholder="Search dog parks..."
                            placeholderTextColor={theme.subText}
                            style={[styles.searchInput, { color: theme.text }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Map */}
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={INITIAL_REGION}
                    provider={PROVIDER_DEFAULT}
                    userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
                    showsUserLocation={true}
                >
                    {filteredParks.map(park => (
                        <Marker key={park.id} coordinate={park.coordinate} title={park.name} onPress={() => handleParkSelect(park)}>
                            <View style={styles.customMarker}>
                                <View style={[styles.markerBubble, { backgroundColor: theme.primary }]}>
                                    <Ionicons name="paw" size={14} color="#fff" />
                                </View>
                                <View style={[styles.markerArrow, { borderTopColor: theme.primary }]} />
                            </View>
                        </Marker>
                    ))}
                </MapView>

                {/* Bottom List */}
                <View style={styles.parksListContainer}>
                    <FlatList
                        data={filteredParks}
                        renderItem={renderParkCard}
                        keyExtractor={p => p.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
                        snapToInterval={260 + 15}
                        decelerationRate="fast"
                    />
                </View>
            </View>

            {renderParkDetails()}
            {renderCheckInModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
    headerTitle: { ...Typography.header },

    contentContainer: { flex: 1, position: 'relative' },

    searchContainer: { position: 'absolute', left: 20, right: 20, zIndex: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 16, paddingHorizontal: 15, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

    map: { width: '100%', height: '100%' },
    customMarker: { alignItems: 'center', justifyContent: 'center' },
    markerBubble: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 } },
    markerArrow: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },

    parksListContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, height: 200, zIndex: 20 },
    parkCard: { width: 260, height: 180, marginRight: 15, borderRadius: 16, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
    cardImageContainer: { height: 110, backgroundColor: '#ccc' },
    parkCardImage: { width: '100%', height: '100%' },
    ratingBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    parkCardContent: { padding: 12, justifyContent: 'center' },
    parkCardTitle: { ...Typography.cardTitle },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    parkCardDistance: { ...Typography.caption, fontWeight: '500' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
    bottomSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '80%' },
    handleContainer: { alignItems: 'center', marginBottom: 15 },
    handle: { width: 40, height: 4, borderRadius: 2 },
    detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    detailsTitle: { ...Typography.header },
    detailsAddress: { ...Typography.body, marginTop: 4 },
    closeButton: { padding: 8, borderRadius: 20 },
    divider: { height: 1, marginBottom: 20 },
    sectionTitle: { ...Typography.sectionTitle, marginBottom: 15 },
    emptyStateContainer: { alignItems: 'center', marginVertical: 20, opacity: 0.7 },
    emptyText: { fontStyle: 'italic', marginTop: 10 },
    visitorsList: { marginBottom: 20 },
    visitorItem: { marginRight: 20, alignItems: 'center' },
    visitorImage: { width: 56, height: 56, borderRadius: 28, marginBottom: 8, borderWidth: 2, borderColor: '#fff' },
    visitorName: { fontSize: 13, fontWeight: '600' },
    visitorTime: { fontSize: 11, fontWeight: '500', marginTop: 2 },

    checkInButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16, gap: 10, marginTop: 10 },
    checkInButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    checkInDialog: { width: '85%', borderRadius: 24, padding: 24 },
    dialogTitle: { ...Typography.header, marginBottom: 5, textAlign: 'center' },
    dialogSubtitle: { ...Typography.body, textAlign: 'center', marginBottom: 25 },
    label: { ...Typography.cardTitle, marginBottom: 10, opacity: 0.7 },

    // Updated Dog Selector for Multi-Select
    dogSelector: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingRight: 15, borderRadius: 20, marginRight: 10 },
    selectorImage: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
    selectorText: { fontSize: 14 },
    checkBadge: { marginLeft: 5 },

    timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    timeChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
    timeText: { fontWeight: '600' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    switchLabel: { fontSize: 16, fontWeight: '500' },
    dialogActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
    cancelButton: { padding: 15 },
    cancelButtonText: { fontWeight: '600', fontSize: 16 },
    confirmButton: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 14 },
    confirmButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});