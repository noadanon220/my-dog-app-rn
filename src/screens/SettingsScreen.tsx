import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppData } from '../context/AppDataContext';

export default function SettingsScreen() {
    // 1. Grab theme and toggle function from context
    const { user, isDarkMode, toggleTheme, theme } = useAppData();
    const [language, setLanguage] = useState<'en' | 'he'>('en');

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'he' : 'en';
        setLanguage(newLang);
        Alert.alert("Language Changed", `App language set to ${newLang === 'en' ? 'English' : 'Hebrew'}`);
    };

    const handleEditProfile = () => {
        Alert.alert("Edit Profile", "Here you will be able to change your name and photo.");
    };

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: () => console.log("Logged out") }
        ]);
    };

    // Helper Component for a Setting Row
    const SettingRow = ({
        icon, label, value, isSwitch = false, onPress
    }: {
        icon: string, label: string, value?: string | boolean, isSwitch?: boolean, onPress?: () => void
    }) => (
        <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: theme.cardBorder }]}
            onPress={isSwitch ? toggleTheme : onPress}
            activeOpacity={isSwitch ? 1 : 0.7}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.iconBg }]}>
                    <Ionicons name={icon as any} size={22} color={theme.primary} />
                </View>
                {/* Dynamic Text Color */}
                <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
            </View>

            <View style={styles.rowRight}>
                {isSwitch ? (
                    <Switch
                        trackColor={{ false: "#e0e0e0", true: theme.primary }}
                        thumbColor={"#fff"}
                        onValueChange={toggleTheme} // Use global toggle
                        value={value as boolean}
                    />
                ) : (
                    <>
                        {value && <Text style={[styles.rowValue, { color: theme.subText }]}>{value}</Text>}
                        <Ionicons name="chevron-forward" size={20} color={theme.subText} />
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        // Dynamic Container Background
        <SafeAreaView style={[styles.container, { backgroundColor: theme.secondaryBg }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <View style={[styles.header, { backgroundColor: theme.card }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Section - Dynamic Card Color */}
                <View style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: isDarkMode ? '#000' : '#ccc' }]}>
                    <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                    <View style={styles.profileInfo}>
                        <Text style={[styles.userName, { color: theme.text }]}>{user.displayName}</Text>
                        <Text style={[styles.userEmail, { color: theme.subText }]}>{user.email}</Text>
                        <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: theme.secondaryBg }]}
                            onPress={handleEditProfile}
                        >
                            <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Preferences Group */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={[styles.sectionContent, { backgroundColor: theme.card }]}>
                        <SettingRow
                            icon="moon-outline"
                            label="Dark Mode"
                            isSwitch
                            value={isDarkMode}
                        />
                        <SettingRow
                            icon="globe-outline"
                            label="Language"
                            value={language === 'en' ? 'English' : 'עברית'}
                            onPress={toggleLanguage}
                        />
                        <SettingRow
                            icon="notifications-outline"
                            label="Notifications"
                            value="On"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Support Group */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <View style={[styles.sectionContent, { backgroundColor: theme.card }]}>
                        <SettingRow
                            icon="help-circle-outline"
                            label="Help Center"
                            onPress={() => { }}
                        />
                        <SettingRow
                            icon="information-circle-outline"
                            label="About"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Log Out */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(255, 82, 82, 0.1)' : '#FFEBEB' }]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color={theme.danger} />
                    <Text style={[styles.logoutText, { color: theme.danger }]}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0 (Beta)</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingVertical: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800' },
    scrollContent: { paddingBottom: 40 },

    // Profile Card
    profileCard: {
        flexDirection: 'row', alignItems: 'center',
        margin: 20, padding: 20, borderRadius: 20,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3
    },
    avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#eee' },
    profileInfo: { marginLeft: 15, flex: 1 },
    userName: { fontSize: 20, fontWeight: '700' },
    userEmail: { fontSize: 14, marginBottom: 8 },
    editButton: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    editButtonText: { fontSize: 12, fontWeight: '600' },

    // Sections
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#999', marginLeft: 25, marginBottom: 10, textTransform: 'uppercase' },
    sectionContent: { marginHorizontal: 20, borderRadius: 16, paddingVertical: 5 },

    settingRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 15, paddingHorizontal: 15,
        borderBottomWidth: 1
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rowLabel: { fontSize: 16, fontWeight: '500' },
    rowRight: { flexDirection: 'row', alignItems: 'center' },
    rowValue: { fontSize: 14, marginRight: 8 },

    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginHorizontal: 20, padding: 15, borderRadius: 16, marginTop: 10
    },
    logoutText: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
    versionText: { textAlign: 'center', marginTop: 30, color: '#ccc', fontSize: 12 }
});