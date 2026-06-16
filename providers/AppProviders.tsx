import {PropsWithChildren, useEffect} from 'react';
import {
    ThemeProvider,
    DarkTheme,
} from '@react-navigation/native';
import {StatusBar} from 'expo-status-bar';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {themeColors} from "@/utils/theme-colors";
import * as SystemUI from 'expo-system-ui';
import {HealthGate} from "@/components/HealthGate";
import {AppDataSync} from "@/components/AppDataSync";
import {AuthGate} from "@/features/auth/AuthGate";


const CustomTheme = {
    ...DarkTheme,
    dark: true,
    colors: {
        ...DarkTheme.colors,
        ...themeColors
    },
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Сколько раз повторять запрос при ошибке.
            retry: 1,
        },
    },
});

function NavigationThemeProvider({children}: PropsWithChildren) {
    return (
        <ThemeProvider value={CustomTheme}>
            <StatusBar style="light"/>
            {children}
        </ThemeProvider>
    );
}

export function AppProviders({children}: PropsWithChildren) {
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(themeColors.background).catch(() => {
            // Ignore platform-specific failures and keep the app rendering.
        });
    }, []);

    return (
        <GestureHandlerRootView style={{flex: 1, backgroundColor: themeColors.background}}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <BottomSheetModalProvider>
                        <NavigationThemeProvider>
                            <HealthGate>
                                <AppDataSync />
                                <AuthGate>
                                    {children}
                                </AuthGate>
                            </HealthGate>
                        </NavigationThemeProvider>
                    </BottomSheetModalProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
