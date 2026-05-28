import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import * as Location from "expo-location";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";

import {Screen} from "@/components/ui/Screen";
import {themeColors} from "@/utils/theme-colors";

import {
    AddressMap,
    AddressMapRef,
} from "./components/AddressMap";
import {CenterPin} from "./components/CenterPin";
import {AddressBottomSheet} from "./components/AddressBottomSheet";

const DEFAULT_ADDRESS_TEXT = "с. Псыгансу, ул. Бекалдиева, дом 16";

export function DeliveryAddress() {
    const mapRef = useRef<AddressMapRef>(null);
    const pendingMoveToCurrentLocationRef = useRef(false);

    const [isLocating, setIsLocating] = useState(false);
    const [locationStatusText, setLocationStatusText] = useState(
        "Разрешите доступ к геолокации, чтобы быстро подставить текущий адрес."
    );

    const spinValue = useRef(new Animated.Value(0)).current;
    const spinnerAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

    const startSpinner = useCallback(() => {
        spinValue.setValue(0);
        spinnerAnimationRef.current?.stop();

        spinnerAnimationRef.current = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 850,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        );

        spinnerAnimationRef.current.start();
    }, [spinValue]);

    const stopSpinner = useCallback(() => {
        spinnerAnimationRef.current?.stop();
        spinnerAnimationRef.current = null;
        spinValue.setValue(0);
    }, [spinValue]);

    useEffect(() => {
        if (isLocating) {
            startSpinner();
        } else {
            stopSpinner();
        }

        return () => {
            stopSpinner();
        };
    }, [isLocating, startSpinner, stopSpinner]);

    const rotate = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const handleCurrentLocation = useCallback(async () => {
        if (isLocating) {
            return;
        }

        setIsLocating(true);
        setLocationStatusText("Поиск местоположения...");

        try {
            const {status} = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setLocationStatusText("Доступ к геолокации не разрешён.");
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
                mayShowUserSettingsDialog: true,
            });

            if (!location) {
                const lastKnown = await Location.getLastKnownPositionAsync();
                if (lastKnown) {
                    location = lastKnown;
                    setLocationStatusText("Используем последнее известное местоположение.");
                }
            }

            const latitude = location.coords.latitude;
            const longitude = location.coords.longitude;

            pendingMoveToCurrentLocationRef.current = true;
            mapRef.current?.moveTo(latitude, longitude);
            setLocationStatusText("Ищем точку на карте...");
        } catch {
            pendingMoveToCurrentLocationRef.current = false;
            setLocationStatusText("Не удалось определить местоположение.");
            setIsLocating(false);
        }
    }, [isLocating]);

    const handleCenterChanged = useCallback(() => {
        if (pendingMoveToCurrentLocationRef.current) {
            pendingMoveToCurrentLocationRef.current = false;
            setIsLocating(false);
            setLocationStatusText("Текущее местоположение найдено.");
        }
    }, []);

    return (
        <Screen>
            <GestureHandlerRootView style={{flex: 1}}>
                <View style={styles.container}>
                    <AddressMap
                        ref={mapRef}
                        onCenterChanged={handleCenterChanged}
                    />

                    <CenterPin />

                    <View style={styles.header}>
                        <Pressable
                            style={styles.iconButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={22}
                                color={themeColors.text}
                            />
                        </Pressable>

                        <Text style={styles.headerTitle}>
                            Новый адрес
                        </Text>

                        <View style={styles.headerSpacer} />
                    </View>

                    <Pressable
                        style={[
                            styles.locationButton,
                            isLocating && styles.locationButtonActive,
                        ]}
                        onPress={handleCurrentLocation}
                        disabled={isLocating}
                    >
                        <Animated.View
                            style={{
                                transform: [{rotate}],
                            }}
                        >
                            <Ionicons
                                name="locate"
                                size={22}
                                color={themeColors.text}
                            />
                        </Animated.View>
                    </Pressable>
                </View>

                <AddressBottomSheet
                    addressText={DEFAULT_ADDRESS_TEXT}
                    locationStatusText={locationStatusText}
                />
            </GestureHandlerRootView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: "absolute",
        top: 24,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: "Point-Bold",
        color: themeColors.textOnPrimary,
    },
    headerSpacer: {
        width: 46,
    },
    iconButton: {
        width: 46,
        height: 46,
        borderRadius: 999,
        backgroundColor: themeColors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    locationButton: {
        position: "absolute",
        right: 16,
        bottom: "35%",
        width: 52,
        height: 52,
        borderRadius: 999,
        backgroundColor: themeColors.background,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 20,
    },
    locationButtonActive: {
        opacity: 0.9,
    },
});