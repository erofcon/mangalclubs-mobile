import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {GestureHandlerRootView} from "react-native-gesture-handler";

import {Screen} from "@/components/ui/Screen";
import {
    getCurrentDeviceCoordinates,
    getHumanLocationError,
} from "@/services/device-location";
import {reverseGeocodeDeliveryPoint} from "@/services/geoapify";
import {MAX_SAVED_ADDRESSES, useAddressStore} from "@/store/address-store";
import {themeColors} from "@/utils/theme-colors";

import {AddressMap, AddressMapRef} from "./components/AddressMap";
import {CenterPin} from "./components/CenterPin";
import {AddressBottomSheet} from "./components/AddressBottomSheet";

const DEFAULT_STATUS_TEXT =
    "Переместите карту или нажмите на самолётик, чтобы определить адрес.";

type AddressStatusTone = "default" | "error";

type DraftAddress = {
    city: string;
    address: string;
    house: string;
    shortAddress: string;
    isPrecise: boolean;
    latitude: number;
    longitude: number;
    accuracy: number | null;
};

export function DeliveryAddress() {
    const mapRef = useRef<AddressMapRef>(null);
    const pendingMoveToCurrentLocationRef = useRef(false);
    const geocodeRequestIdRef = useRef(0);

    const addAddress = useAddressStore((state) => state.addAddress);

    const [isLocating, setIsLocating] = useState(false);
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);
    const [draftAddress, setDraftAddress] = useState<DraftAddress | null>(null);
    const [locationStatusText, setLocationStatusText] =
        useState(DEFAULT_STATUS_TEXT);
    const [locationStatusTone, setLocationStatusTone] =
        useState<AddressStatusTone>("default");

    useEffect(() => {
        return () => {
            geocodeRequestIdRef.current += 1;
        };
    }, []);

    const resolveAddressForCenter = useCallback(
        async (
            coords: {latitude: number; longitude: number},
            options?: {finishCurrentLocationSearch?: boolean}
        ) => {
            const requestId = geocodeRequestIdRef.current + 1;
            geocodeRequestIdRef.current = requestId;

            setIsResolvingAddress(true);
            setLocationStatusTone("default");
            setLocationStatusText("Определяем адрес...");

            try {
                const resolvedAddress = await reverseGeocodeDeliveryPoint({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: null,
                });

                if (geocodeRequestIdRef.current !== requestId) {
                    return;
                }

                setDraftAddress({
                    ...resolvedAddress,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: null,
                });
                setLocationStatusTone("default");
                setLocationStatusText("");
            } catch {
                if (geocodeRequestIdRef.current !== requestId) {
                    return;
                }

                setDraftAddress(null);
                setLocationStatusTone("error");
                setLocationStatusText(
                    "Не удалось определить адрес по этой точке. Проверьте интернет или переместите карту."
                );
            } finally {
                if (geocodeRequestIdRef.current === requestId) {
                    setIsResolvingAddress(false);
                }

                if (
                    geocodeRequestIdRef.current === requestId &&
                    options?.finishCurrentLocationSearch
                ) {
                    setIsLocating(false);
                }
            }
        },
        []
    );

    const handleSaveCurrentAddress = useCallback(() => {
        if (!draftAddress) {
            setLocationStatusTone("error");
            setLocationStatusText(
                "Сначала определите адрес на карте, а потом сохраните его."
            );
            return;
        }

        const result = addAddress(draftAddress);

        if (result.limitReached) {
            setLocationStatusTone("error");
            setLocationStatusText(
                `Можно сохранить не больше ${MAX_SAVED_ADDRESSES} адресов.`
            );
            return;
        }

        setLocationStatusTone("default");
        setLocationStatusText(
            result.created
                ? "Адрес сохранён."
                : "Адрес уже сохранён."
        );
        router.back();
    }, [addAddress, draftAddress]);

    const handleCurrentLocation = useCallback(async () => {
        if (isLocating) {
            return;
        }

        setIsLocating(true);
        setLocationStatusTone("default");
        setLocationStatusText("Определяем текущее местоположение...");

        try {
            const coords = await getCurrentDeviceCoordinates();

            if (!mapRef.current) {
                setLocationStatusTone("error");
                setLocationStatusText(
                    "Карта ещё загружается. Попробуйте через пару секунд."
                );
                setIsLocating(false);
                return;
            }

            pendingMoveToCurrentLocationRef.current = true;
            mapRef.current.moveTo(coords.latitude, coords.longitude);
            setLocationStatusText("Определяем адрес...");
        } catch (error) {
            pendingMoveToCurrentLocationRef.current = false;
            setLocationStatusTone("error");
            setLocationStatusText(getHumanLocationError(error));
            setIsLocating(false);
        }
    }, [isLocating]);

    const handleCenterChanged = useCallback(
        (coords: {latitude: number; longitude: number}) => {
            const isCurrentLocationSearch = pendingMoveToCurrentLocationRef.current;
            pendingMoveToCurrentLocationRef.current = false;

            if (!isCurrentLocationSearch && isLocating) {
                setIsLocating(false);
            }

            void resolveAddressForCenter(coords, {
                finishCurrentLocationSearch: isCurrentLocationSearch,
            });
        },
        [isLocating, resolveAddressForCenter]
    );

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

                        <Text style={styles.headerTitle}>Новый адрес</Text>

                        <View style={styles.headerSpacer} />
                    </View>

                    <Pressable
                        style={[
                            styles.locationButton,
                            (isLocating || isResolvingAddress) &&
                                styles.locationButtonActive,
                        ]}
                        onPress={handleCurrentLocation}
                        disabled={isLocating || isResolvingAddress}
                    >
                        {isLocating || isResolvingAddress ? (
                            <ActivityIndicator
                                size={22}
                                color={themeColors.text}
                            />
                        ) : (
                            <Ionicons
                                name="paper-plane-outline"
                                size={22}
                                color={themeColors.text}
                            />
                        )}
                    </Pressable>
                </View>

                <AddressBottomSheet
                    addressText={draftAddress?.shortAddress ?? ""}
                    locationStatusText={locationStatusText}
                    locationStatusTone={locationStatusTone}
                    onSavePress={handleSaveCurrentAddress}
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
