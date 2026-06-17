import {Stack} from "expo-router";
import {View} from "react-native";
import {useFonts} from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {useEffect} from "react";
import {AppProviders} from "@/providers/AppProviders";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {themeColors} from "@/utils/theme-colors";


SplashScreen.preventAutoHideAsync().then(r => {
});

export default function RootLayout() {

    const [loaded, error] = useFonts({
        // основной текст
        "Point-Regular": require("@/assets/fonts/point/Point-Regular.ttf"),

        // вторичный/длинный текст, если Book выглядит приятнее Regular
        "Point-Book": require("@/assets/fonts/point/Point-Book.ttf"),

        // кнопки, табы, небольшие заголовки
        "Point-SemiBold": require("@/assets/fonts/point/Point-SemiBold.ttf"),

        // крупные заголовки
        "Point-Black": require("@/assets/fonts/point/Point-Black.ttf"),
        "Point-Bold": require("@/assets/fonts/point/Point-Bold.ttf"),

        // очень крупные акценты
        "Point-ExtraBold": require("@/assets/fonts/point/Point-ExtraBold.ttf"),
    });

    useEffect(() => {
        async function prepare() {

            await SplashScreen.hideAsync();
        }

        prepare();

    }, []);

    if (!loaded && !error) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{flex: 1, backgroundColor: themeColors.background}}>
            <AppProviders>
                <View style={{flex: 1, backgroundColor: themeColors.background}}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            animation: "fade",
                            animationDuration: 220,
                            contentStyle: {
                                backgroundColor: themeColors.background,
                            },
                        }}
                    />
                </View>
            </AppProviders>
        </GestureHandlerRootView>
    );
}
