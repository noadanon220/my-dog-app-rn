import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ICONS } from '../../assets/icons';
import { useAppData } from '../context/AppDataContext';

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

// Define the actions for the floating menu
const QUICK_ACTIONS = [
    { id: 'walk', label: 'Walk', icon: 'walk', color: '#4CAF50', bgColor: '#E8F5E9' },
    { id: 'food', label: 'Food', icon: 'food', color: '#FF9800', bgColor: '#FFF3E0' },
    { id: 'poop', label: 'Poop', icon: 'poop', color: '#607D8B', bgColor: '#ECEFF1' },
    { id: 'weight', label: 'Weight', icon: 'default', color: '#9C27B0', bgColor: '#F3E5F5' },
    { id: 'vet', label: 'Vet', icon: 'vet', color: '#F44336', bgColor: '#FFEBEE' },
];

export default function HomeScreen() {
    const { dogs, selectedDogId, selectDog, getRelevantLogs, theme, isDarkMode } = useAppData();
    const navigation = useNavigation<any>();

    const [isMenuVisible, setMenuVisible] = useState(false);

    const dogsListDisplay = [
        { id: 'all', name: 'All', imageUri: null },
        ...dogs,
        { id: 'add_new', name: 'Add', isAction: true }
    ];

    const relevantLogs = getRelevantLogs();
    const currentDog = dogs.find(d => d.id === selectedDogId);

    const stats = useMemo(() => {
        const todaysLogs = relevantLogs.filter(log => isToday(log.timestamp));
        const walkLogs = todaysLogs.filter(l => l.type === 'walk');
        const totalWalkMinutes = walkLogs.reduce((sum, log) => sum + (log.details?.durationMinutes || 0), 0);
        const walkGoal = 60;
        const walkProgress = Math.min(totalWalkMinutes / walkGoal, 1);
        const lastFoodLog = todaysLogs.find(l => l.type === 'food');
        let lastMealTime = '--:--';
        if (lastFoodLog) {
            lastMealTime = new Date(lastFoodLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return { walkMinutes: totalWalkMinutes, walkProgress, lastMealTime, hasEatenToday: !!lastFoodLog };
    }, [relevantLogs]);

    // Handle Quick Action Press
    const handleActionPress = (actionId: string) => {
        setMenuVisible(false);
        navigation.navigate('AddLog', { initialAction: actionId });
    };

    const renderDogItem = ({ item }: { item: any }) => {
        if (item.id === 'add_new') {
            return (
                <TouchableOpacity style={styles.dogItem} onPress={() => navigation.navigate('AddDog')}>
                    <View style={[styles.dogImageContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderStyle: 'dashed', borderWidth: 1 }]}>
                        <Ionicons name="add" size={24} color={theme.subText} />
                    </View>
                    <Text style={[styles.dogName, { color: theme.subText }]}>Add</Text>
                </TouchableOpacity>
            );
        }

        const isSelected = selectedDogId === item.id;
        const imageSource = item.imageUri ? { uri: item.imageUri } : null;

        return (
            <TouchableOpacity
                style={styles.dogItem}
                onPress={() => selectDog(item.id)}
                activeOpacity={0.8}
            >
                <View style={[
                    styles.dogImageContainer,
                    { backgroundColor: theme.secondaryBg },
                    isSelected && { borderColor: theme.primary, borderWidth: 2 }
                ]}>
                    {imageSource ? (
                        <Image source={imageSource} style={styles.dogImage} />
                    ) : (
                        <View style={[styles.allDogsIcon, { backgroundColor: theme.card }]}>
                            <Ionicons name="apps" size={24} color={isSelected ? theme.primary : '#999'} />
                        </View>
                    )}
                </View>
                <Text style={[styles.dogName, isSelected ? { color: theme.primary, fontWeight: '700' } : { color: theme.subText }]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderActivityItem = ({ item }: { item: any }) => {
        const IconComponent = ICONS[item.type as keyof typeof ICONS] || ICONS.default;
        const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let subtitle = item.details?.note || 'Logged activity';
        if (item.type === 'walk' && item.details?.durationMinutes) subtitle = `${item.details.durationMinutes} min walk`;
        else if (item.type === 'food' && item.details?.amountEaten) subtitle = `${item.details.amountEaten}g food`;

        return (
            <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={[styles.activityIconContainer, { backgroundColor: theme.secondaryBg }]}>
                    <IconComponent width={24} height={24} color={theme.primary} />
                </View>
                <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: theme.text }]}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                    <Text style={[styles.activitySubtitle, { color: theme.subText }]} numberOfLines={1}>{subtitle}</Text>
                </View>
                <Text style={[styles.activityTime, { color: theme.subText }]}>{timeString}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            <View style={styles.header}>
                <View>
                    <Text style={[styles.greetingText, { color: theme.text }]}>Good Morning, Noa 👋</Text>
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </Text>
                </View>
                <TouchableOpacity style={[styles.notificationButton, { backgroundColor: theme.secondaryBg }]}>
                    <Ionicons name="notifications-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                <View style={styles.sectionContainer}>
                    <FlatList
                        data={dogsListDisplay}
                        renderItem={renderDogItem}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.dogsList}
                    />
                </View>

                {selectedDogId !== 'all' && currentDog && (
                    <View style={styles.profileLinkContainer}>
                        <TouchableOpacity
                            style={[styles.profileLinkButton, { backgroundColor: theme.secondaryBg }]}
                            onPress={() => navigation.navigate('DogProfile')}
                        >
                            <Text style={[styles.profileLinkText, { color: theme.primary }]}>
                                View {currentDog.name}'s Profile
                            </Text>
                            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Goals</Text>
                    <View style={styles.cardsRow}>
                        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="footsteps" size={20} color={theme.primary} />
                                <Text style={styles.cardLabel}>Walk</Text>
                            </View>
                            <Text style={[styles.cardValue, { color: theme.text }]}>
                                {stats.walkMinutes} <Text style={styles.cardUnit}>min</Text>
                            </Text>
                            <Text style={styles.cardSubtext}>Goal: 60 min</Text>
                            <View style={[styles.progressBarBg, { backgroundColor: theme.secondaryBg }]}>
                                <View style={[styles.progressBarFill, { width: `${stats.walkProgress * 100}%`, backgroundColor: theme.primary }]} />
                            </View>
                        </View>

                        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="restaurant" size={20} color={theme.primary} />
                                <Text style={styles.cardLabel}>Food</Text>
                            </View>
                            <Text style={[styles.cardValue, { color: theme.text }]}>{stats.lastMealTime}</Text>
                            <Text style={styles.cardSubtext}>{stats.hasEatenToday ? 'Last Meal Today' : 'No meals yet'}</Text>
                            <View style={[styles.nextMealBadge, { backgroundColor: stats.hasEatenToday ? theme.secondaryBg : '#FFF3E0' }]}>
                                <Text style={[styles.nextMealText, { color: stats.hasEatenToday ? theme.primary : '#EF6C00' }]}>
                                    {stats.hasEatenToday ? 'Done' : 'Waiting'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
                        <TouchableOpacity><Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text></TouchableOpacity>
                    </View>
                    {relevantLogs.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No activity yet today.</Text>
                            <Text style={styles.emptyStateSubtext}>Tap the + button to add one!</Text>
                        </View>
                    ) : (
                        relevantLogs.map((log) => <View key={log.id} style={{ marginBottom: 12 }}>{renderActivityItem({ item: log })}</View>)
                    )}
                </View>
            </ScrollView>

            {/* --- Floating Menu Overlay & Container --- */}

            {/* 1. Transparent Overlay to close menu when clicking outside */}
            {isMenuVisible && (
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                />
            )}

            {/* 2. The Menu Itself (Positioned above FAB) */}
            {isMenuVisible && (
                <View style={[styles.menuContainer, { backgroundColor: theme.card, shadowColor: theme.text }]}>
                    <Text style={[styles.menuHeader, { color: theme.subText }]}>Quick Log</Text>
                    {QUICK_ACTIONS.map((action, index) => {
                        const IconComponent = ICONS[action.icon as keyof typeof ICONS] || ICONS.default;
                        return (
                            <TouchableOpacity
                                key={action.id}
                                style={[
                                    styles.menuItem,
                                    index !== QUICK_ACTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }
                                ]}
                                onPress={() => handleActionPress(action.id)}
                            >
                                <View style={[styles.menuIconContainer, { backgroundColor: action.bgColor }]}>
                                    <IconComponent width={20} height={20} color={action.color} />
                                </View>
                                <Text style={[styles.menuText, { color: theme.text }]}>{action.label}</Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.subText} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* 3. Floating Action Button (Always on top) */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    { backgroundColor: theme.primary },
                    isMenuVisible && { transform: [{ rotate: '45deg' }] }
                ]}
                onPress={() => setMenuVisible(!isMenuVisible)}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    greetingText: { fontSize: 22, fontWeight: '700' },
    dateText: { fontSize: 14, color: '#888', marginTop: 2 },
    notificationButton: { padding: 8, borderRadius: 20 },

    sectionContainer: { marginTop: 20, paddingHorizontal: 20 },
    dogsList: { paddingRight: 20 },
    dogItem: { alignItems: 'center', marginRight: 20 },
    dogImageContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    dogImage: { width: 56, height: 56, borderRadius: 28 },
    allDogsIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    dogName: { marginTop: 8, fontSize: 12, fontWeight: '500' },

    profileLinkContainer: { marginTop: 15, paddingHorizontal: 20 },
    profileLinkButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 12, gap: 5
    },
    profileLinkText: { fontSize: 14, fontWeight: '600' },

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
    cardsRow: { flexDirection: 'row', gap: 15 },
    summaryCard: { flex: 1, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    cardLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
    cardValue: { fontSize: 24, fontWeight: '800' },
    cardUnit: { fontSize: 14, fontWeight: '500', color: '#888' },
    cardSubtext: { fontSize: 12, color: '#999', marginTop: 4, marginBottom: 10 },
    progressBarBg: { height: 6, borderRadius: 3, width: '100%' },
    progressBarFill: { height: 6, borderRadius: 3 },
    nextMealBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
    nextMealText: { fontSize: 12, fontWeight: '600' },

    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    seeAllText: { fontWeight: '600' },
    activityCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
    activityIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    activityContent: { flex: 1 },
    activityTitle: { fontSize: 16, fontWeight: '600' },
    activitySubtitle: { fontSize: 13, marginTop: 2 },
    activityTime: { fontSize: 12, fontWeight: '500' },
    emptyState: { alignItems: 'center', paddingVertical: 20 },
    emptyStateText: { color: '#999', fontSize: 16, marginBottom: 5 },
    emptyStateSubtext: { color: '#ccc', fontSize: 14 },

    // FAB Styles
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 20 // High zIndex so it stays on top of the overlay
    },

    // Floating Menu Styles
    menuOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slightly dimmed background
        zIndex: 10 // Below the FAB but above content
    },
    menuContainer: {
        position: 'absolute',
        bottom: 90, // Positioned above the FAB (60 height + 20 bottom + 10 margin)
        right: 20,
        width: 220,
        borderRadius: 20,
        paddingVertical: 10,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 15 // Above overlay
    },
    menuHeader: { fontSize: 12, fontWeight: '700', paddingHorizontal: 16, marginBottom: 5, marginTop: 5, textTransform: 'uppercase' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    menuIconContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    menuText: { fontSize: 16, fontWeight: '600', flex: 1 }
});