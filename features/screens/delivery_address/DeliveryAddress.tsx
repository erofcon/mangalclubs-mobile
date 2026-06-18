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
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {Screen} from "@/components/ui/Screen";
import {
    getCurrentDeviceCoordinates,
    getHumanLocationError,
} from "@/services/device-location";
import {
    checkDeliveryZone,
    getDeliverySettings,
    type DeliveryCheckAddress,
    type DeliverySettings,
} from "@/services/delivery-zones";
import {MAX_SAVED_ADDRESSES, useAddressStore} from "@/store/address-store";
import {useAppDataStore} from "@/store/app-data-store";
import {themeColors} from "@/utils/theme-colors";

import {AddressMap, AddressMapRef} from "./components/AddressMap";
import {CenterPin} from "./components/CenterPin";
import {
    ADDRESS_SHEET_SNAP_POINT,
    AddressBottomSheet,
} from "./components/AddressBottomSheet";

const LOCATION_BUTTON_GAP = 24;
const FALLBACK_MAP_CENTER = {
    latitude: 43.359307,
    longitude: 45.697802,
    accuracy: null,
};

const DEFAULT_STATUS_TEXT =
    "Переместите карту или нажмите на самолетик, чтобы определить адрес.";

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
    deliveryPrice: number | null;
};

const formatDeliveryPrice = (price: number) => (
    `${price.toLocaleString("ru-RU")} ₽`
);

const normalizeBackendAddress = (
    address: DeliveryCheckAddress | null,
    coords: {latitude: number; longitude: number},
    deliveryPrice: number | null
): DraftAddress | null => {
    if (!address) {
        return null;
    }

    const city = address.city?.trim() ?? "";
    const street = address.street?.trim() ?? "";
    const house = address.house?.trim() ?? "";
    const formatted = address.formatted?.trim() ?? "";
    const shortAddress = formatted || [city, street, house].filter(Boolean).join(", ");

    if (!shortAddress || !city || !street) {
        return null;
    }

    return {
        city,
        address: [street, house].filter(Boolean).join(", "),
        house,
        shortAddress,
        isPrecise: Boolean(house),
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: null,
        deliveryPrice,
    };
};

export function DeliveryAddress() {
    const insets = useSafeAreaInsets();
    const mapRef = useRef<AddressMapRef>(null);
    const pendingMoveToCurrentLocationRef = useRef(false);
    const requestIdRef = useRef(0);

    const addAddress = useAddressStore((state) => state.addAddress);
    const defaultDeliveryOrganization = useAppDataStore(
        (state) => state.defaultDeliveryOrganization
    );

    const [isLocating, setIsLocating] = useState(false);
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);
    const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
    const [draftAddress, setDraftAddress] = useState<DraftAddress | null>(null);
    const [mapContainerHeight, setMapContainerHeight] = useState(0);
    const [locationStatusText, setLocationStatusText] =
        useState(DEFAULT_STATUS_TEXT);
    const [locationStatusTone, setLocationStatusTone] =
        useState<AddressStatusTone>("default");
    const mapInitialCenter =
        defaultDeliveryOrganization?.coordinates ?? FALLBACK_MAP_CENTER;
    const sheetHeightRatio =
        Number.parseFloat(ADDRESS_SHEET_SNAP_POINT) / 100;
    const locationButtonBottom =
        mapContainerHeight * sheetHeightRatio + LOCATION_BUTTON_GAP;

    useEffect(() => {
        const controller = new AbortController();

        getDeliverySettings(controller.signal)
            .then((settings) => {
                setDeliverySettings(settings);
            })
            .catch((error) => {
                if (controller.signal.aborted) {
                    return;
                }

                setLocationStatusTone("error");
                setLocationStatusText(
                    error instanceof Error
                        ? error.message
                        : "Не удалось загрузить зону доставки."
                );
            });

        return () => {
            controller.abort();
            requestIdRef.current += 1;
        };
    }, []);

    const resolveAddressForCenter = useCallback(
        async (
            coords: {latitude: number; longitude: number},
            options?: {finishCurrentLocationSearch?: boolean}
        ) => {
            const requestId = requestIdRef.current + 1;
            requestIdRef.current = requestId;

            setIsResolvingAddress(true);
            setDraftAddress(null);
            setLocationStatusTone("default");
            setLocationStatusText("Проверяем адрес доставки...");

            try {
                const deliveryCheck = await checkDeliveryZone({
                    coordinates: {
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    },
                    organizationSlug: defaultDeliveryOrganization?.slug,
                });

                if (requestIdRef.current !== requestId) {
                    return;
                }

                if (!deliveryCheck.available) {
                    setLocationStatusTone("error");
                    setLocationStatusText(
                        deliveryCheck.reason === "outside_delivery_area"
                            ? "Адрес вне зоны доставки. Сейчас доставляем только по Грозному."
                            : deliveryCheck.reason === "delivery_tariff_not_configured"
                                ? "Для этого расстояния пока не настроен тариф доставки."
                                : "По этому адресу доставка сейчас недоступна."
                    );
                    return;
                }

                const resolvedAddress = normalizeBackendAddress(
                    deliveryCheck.address,
                    coords,
                    deliveryCheck.price
                );

                if (!resolvedAddress) {
                    setLocationStatusTone("error");
                    setLocationStatusText(
                        "Не удалось определить адрес по этой точке. Переместите карту ближе к дому."
                    );
                    return;
                }

                setDraftAddress(resolvedAddress);
                setLocationStatusTone(resolvedAddress.isPrecise ? "default" : "error");
                setLocationStatusText(
                    resolvedAddress.isPrecise
                        ? "Адрес в зоне доставки."
                        : "Адрес найден, но номер дома не определен. Переместите карту ближе к дому."
                );
            } catch {
                if (requestIdRef.current !== requestId) {
                    return;
                }

                setLocationStatusTone("error");
                setLocationStatusText(
                    "Не удалось проверить адрес через сервер. Проверьте интернет или попробуйте другую точку."
                );
            } finally {
                if (requestIdRef.current === requestId) {
                    setIsResolvingAddress(false);
                }

                if (
                    requestIdRef.current === requestId &&
                    options?.finishCurrentLocationSearch
                ) {
                    setIsLocating(false);
                }
            }
        },
        [defaultDeliveryOrganization?.slug]
    );

    const handleSaveCurrentAddress = useCallback(() => {
        if (!draftAddress) {
            setLocationStatusTone("error");
            setLocationStatusText(
                "Сначала выберите адрес внутри зоны доставки."
            );
            return;
        }

        if (!draftAddress.isPrecise) {
            setLocationStatusTone("error");
            setLocationStatusText(
                "Нужен адрес с номером дома. Переместите карту ближе к дому."
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
                    "Карта еще загружается. Попробуйте через пару секунд."
                );
                setIsLocating(false);
                return;
            }

            pendingMoveToCurrentLocationRef.current = true;
            mapRef.current.moveTo(coords.latitude, coords.longitude);
            setLocationStatusText("Проверяем адрес доставки...");
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

    const canSaveAddress = Boolean(draftAddress?.isPrecise) && !isResolvingAddress;
    const deliveryPriceText =
        draftAddress?.deliveryPrice !== null && draftAddress?.deliveryPrice !== undefined
            ? `Стоимость доставки: ${formatDeliveryPrice(draftAddress.deliveryPrice)}`
            : undefined;

    return (
        <Screen>
            <GestureHandlerRootView style={{flex: 1}}>
                <View
                    style={styles.container}
                    onLayout={(event) => {
                        setMapContainerHeight(event.nativeEvent.layout.height);
                    }}
                >
                    <AddressMap
                        ref={mapRef}
                        deliveryArea={deliverySettings?.deliveryArea}
                        initialCenter={mapInitialCenter}
                        onCenterChanged={handleCenterChanged}
                    />

                    <CenterPin />

                    <View style={[styles.header, {top: insets.top + 12}]}>
                        <Pressable
                            style={styles.iconButton}
                            onPress={() => router.back()}
                            hitSlop={10}
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
                            {bottom: locationButtonBottom},
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
                    deliveryPriceText={deliveryPriceText}
                    locationStatusText={locationStatusText}
                    locationStatusTone={locationStatusTone}
                    canSave={canSaveAddress}
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
