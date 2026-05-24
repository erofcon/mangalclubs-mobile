import {Stack} from "expo-router";
import {View} from "react-native";
import {useFonts} from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {useEffect} from "react";
import {AppProviders} from "@/providers/AppProviders";
import {GestureHandlerRootView} from "react-native-gesture-handler";


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
        "Point-Bold": require("@/assets/fonts/point/Point-Bold.ttf"),

        // очень крупные акценты
        "Point-ExtraBold": require("@/assets/fonts/point/Point-ExtraBold.ttf"),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync().then(r => {
            });
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <AppProviders>
                <View style={{flex: 1, paddingTop: 10}}>
                    <Stack screenOptions={{headerShown: false}}>
                        <Stack.Screen name="(index)"/>
                    </Stack>
                </View>
            </AppProviders>
        </GestureHandlerRootView>
    );
}
