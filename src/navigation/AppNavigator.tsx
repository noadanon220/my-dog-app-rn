import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Import Screens
import { useAppData } from '../context/AppDataContext';
import AddDogScreen from '../screens/AddDogScreen';
import AddLogScreen from '../screens/AddLogScreen';
import DogProfileScreen from '../screens/DogProfileScreen';
import EditDogScreen from '../screens/EditDogScreen';
import ExploreScreen from '../screens/ExploreScreen'; // New Map Screen
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. Tab Navigator (Only Top-Level Screens)
function TabNavigator() {
    const { theme } = useAppData();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: theme.tabBar,
                    borderTopColor: theme.cardBorder,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

// 2. Main App Navigator
export default function AppNavigator() {
    return (
        <Wrapper />
    );
}

function Wrapper() {
    const { isDarkMode } = useAppData();

    return (
        <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* Main Tabs (Home, Explore, Settings) */}
                <Stack.Screen name="MainTabs" component={TabNavigator} />

                {/* Feature Screens (Pushed on top of tabs) */}
                <Stack.Screen name="DogProfile" component={DogProfileScreen} />

                {/* Modals */}
                <Stack.Screen
                    name="AddLog"
                    component={AddLogScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="AddDog"
                    component={AddDogScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="EditDog"
                    component={EditDogScreen}
                    options={{ presentation: 'modal' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}