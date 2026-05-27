import React, {useRef} from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import * as Location from "expo-location";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";

import {Screen} from "@/components/ui/Screen";
import {themeColors} from "@/utils/theme-colors";

import {
    AddressMap,
    AddressMapRef,
} from "./components/AddressMap";

import {CenterPin} from "./components/CenterPin";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {AddressBottomSheet} from "@/features/screens/delivery_address/components/AddressBottomSheet";

export function DeliveryAddress() {

    const mapRef = useRef<AddressMapRef>(null);

    async function handleCurrentLocation() {
        const {status} =
            await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            return;
        }

        const location =
            await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;

        mapRef.current?.moveTo(latitude, longitude);
    }

    return (
        <Screen>
            <GestureHandlerRootView style={{flex: 1}}>
                <View style={styles.container}>
                    <AddressMap
                        ref={mapRef}
                        onCenterChanged={(coords) => {

                        }}
                    />

                    <CenterPin/>

                    {/* Header */}
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

                        <View style={styles.headerSpacer}/>
                    </View>

                    {/* Current location button */}
                    <Pressable
                        style={styles.locationButton}
                        onPress={handleCurrentLocation}
                    >
                        <Ionicons
                            name="locate"
                            size={22}
                            color={themeColors.text}
                        />
                    </Pressable>
                </View>

                <AddressBottomSheet />

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
        bottom: 262,

        width: 52,
        height: 52,
        borderRadius: 999,

        backgroundColor: themeColors.background,

        justifyContent: "center",
        alignItems: "center",
    },
});