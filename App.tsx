import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
// 1. Import SafeAreaProvider
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from './src/context/AppDataContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        // 2. Wrap everything with SafeAreaProvider AND AppDataProvider
        <SafeAreaProvider>
            <AppDataProvider>
                <View style={styles.container}>
                    <AppNavigator />
                    <StatusBar style="auto" />
                </View>
            </AppDataProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});