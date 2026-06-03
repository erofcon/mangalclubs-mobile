import {useEffect, useMemo, useRef, useState} from "react";
import {ImageSourcePropType} from "react-native";
import {router, useLocalSearchParams} from "expo-router";

import {
    MAX_SAVED_ADDRESSES,
    useAddressStore,
    type SavedAddress,
} from "@/store/address-store";
import {
    MANGAL_CLUBS_RESTAURANT_ID,
    useDeliveryStore,
    type DeliveryScheduleDay,
    type DeliveryTimeSlot,
    type DeliveryType,
} from "@/store/delivery-store";
import {Organizations} from "@/mocks/mocks-data";
import type {Organization} from "@/types/organization";
import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";

import {
    formatDistanceKm,
    formatScheduledLabel,
    getDefaultScheduledTime,
    getSlotsForDay,
} from "./order-type.utils";
import type {TakeawayRestaurant} from "./order-type.types";

const restaurantImages: Record<string, ImageSourcePropType> = {
    fazenda: require("@/assets/mocks/restaurant-images/fazenda/XXXL.webp"),
    "mangal-club": require("@/assets/mocks/restaurant-images/mangal-clubs/XXXL.webp"),
};

export function useOrderTypeScreen() {
    const params = useLocalSearchParams<{type?: DeliveryType}>();
    const now = new Date();

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [addressToDelete, setAddressToDelete] = useState<SavedAddress | null>(null);
    const [sheetDay, setSheetDay] = useState<DeliveryScheduleDay>("today");
    const [sheetDraftTime, setSheetDraftTime] = useState<DeliveryTimeSlot | null>(null);
    const sheetRef = useRef<AppBottomSheetRef>(null);

    const addresses = useAddressStore((state) => state.addresses);
    const deleteAddress = useAddressStore((state) => state.deleteAddress);
    const selectAddress = useAddressStore((state) => state.selectAddress);

    const activeTab = useDeliveryStore((state) => state.type);
    const setActiveTab = useDeliveryStore((state) => state.setType);
    const orderSchedule = useDeliveryStore((state) => state.deliveryTime);
    const setOrderSchedule = useDeliveryStore((state) => state.setDeliveryTime);
    const selectedTakeawayRestaurantId = useDeliveryStore((state) => state.takeawayRestaurantId);
    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);
    const setTakeawayRestaurantId = useDeliveryStore((state) => state.setTakeawayRestaurantId);

    const canAddMoreAddresses = addresses.length < MAX_SAVED_ADDRESSES;
    const hasSavedAddresses = addresses.length > 0;
    const visibleTab = activeTab ?? "delivery";
    const showOrderPanel = visibleTab === "takeaway" || hasSavedAddresses;
    const bottomPadding = showOrderPanel ? 260 : 132;

    const currentSchedule = orderSchedule;
    const currentScheduleText =
        currentSchedule.mode === "scheduled" && currentSchedule.selectedTime
            ? formatScheduledLabel(currentSchedule.selectedTime, now)
            : null;

    const selectedAddress =
        addresses.find((item) => item.id === selectedAddressId) ??
        addresses[0] ??
        null;

    const takeawayRestaurants = useMemo<TakeawayRestaurant[]>(
        () =>
            Organizations.map((organization: Organization) => ({
                id: organization.id,
                title: organization.name,
                address: `${organization.city}, ${organization.address}`,
                hours: organization.schedule,
                distance: selectedAddress
                    ? formatDistanceKm(selectedAddress, organization.coordinates)
                    : "—",
                image: restaurantImages[organization.id] ?? restaurantImages.fazenda,
            })),
        [selectedAddress]
    );

    const deliveryRestaurant =
        Organizations.find((organization) => organization.id === MANGAL_CLUBS_RESTAURANT_ID) ??
        Organizations[0] ??
        null;

    const scheduleSlots = useMemo(
        () => ({
            today: getSlotsForDay(now, "today"),
            tomorrow: getSlotsForDay(now, "tomorrow"),
        }),
        [now]
    );

    const selectedTakeawayRestaurant =
        takeawayRestaurants.find((restaurant) => restaurant.id === selectedTakeawayRestaurantId) ??
        takeawayRestaurants[0];

    const sourceRestaurantTitle =
        sourceRestaurantId === MANGAL_CLUBS_RESTAURANT_ID
            ? deliveryRestaurant?.name ?? "Mangal Club"
            : selectedTakeawayRestaurant?.title ?? Organizations[0]?.name ?? "Ресторан";

    useEffect(() => {
        if (params.type === "delivery" || params.type === "takeaway") {
            setActiveTab(params.type);
        }
    }, [params.type, setActiveTab]);

    useEffect(() => {
        if (addresses.length === 0) {
            setSelectedAddressId(null);
            return;
        }

        const existing = addresses.find((item) => item.id === selectedAddressId);
        if (existing) {
            return;
        }

        const firstAddress = addresses[0];
        if (firstAddress) {
            setSelectedAddressId(firstAddress.id);
            selectAddress(firstAddress.id);
        }
    }, [addresses, selectAddress, selectedAddressId]);

    useEffect(() => {
        if (activeTab !== "takeaway") {
            return;
        }

        if (
            selectedTakeawayRestaurantId &&
            takeawayRestaurants.some((restaurant) => restaurant.id === selectedTakeawayRestaurantId)
        ) {
            return;
        }

        const firstTakeawayRestaurant = takeawayRestaurants[0];
        if (firstTakeawayRestaurant) {
            setTakeawayRestaurantId(firstTakeawayRestaurant.id);
        }
    }, [activeTab, selectedTakeawayRestaurantId, setTakeawayRestaurantId, takeawayRestaurants]);

    useEffect(() => {
        if (addressToDelete && !addresses.some((item) => item.id === addressToDelete.id)) {
            setAddressToDelete(null);
        }
    }, [addresses, addressToDelete]);

    const openSheet = () => {
        const selectedTime =
            currentSchedule.mode === "scheduled" && currentSchedule.selectedTime
                ? currentSchedule.selectedTime
                : getDefaultScheduledTime(now);

        const nextDay = selectedTime?.day ?? "today";
        const daySlots = scheduleSlots[nextDay];

        const normalized =
            selectedTime && daySlots.some((slot) => slot.startMinutes === selectedTime.startMinutes)
                ? selectedTime
                : daySlots[0] ?? getDefaultScheduledTime(now);

        setSheetDay(normalized?.day ?? nextDay);
        setSheetDraftTime(normalized);
        sheetRef.current?.open();
    };

    const handleDayPress = (day: DeliveryScheduleDay) => {
        const daySlots = scheduleSlots[day];
        if (daySlots.length === 0) {
            return;
        }

        setSheetDay(day);
        setSheetDraftTime((current) => {
            const match = current && daySlots.find((slot) => slot.startMinutes === current.startMinutes);
            return match ?? daySlots[0] ?? null;
        });
    };

    const handleSlotPress = (slot: DeliveryTimeSlot) => {
        setSheetDraftTime(slot);
        setOrderSchedule({
            mode: "scheduled",
            selectedTime: slot,
        });
    };

    const handleSaveSheet = () => {
        sheetRef.current?.close();
    };

    const handleAsapPress = () => {
        setOrderSchedule({
            mode: "asap",
            selectedTime: null,
        });
    };

    const handleContinue = () => {
        setActiveTab(visibleTab);
        router.back();
    };

    const handleConfirmDelete = () => {
        if (!addressToDelete) {
            return;
        }

        deleteAddress(addressToDelete.id);
        setAddressToDelete(null);
    };

    const currentScheduleLabel =
        currentSchedule.mode === "scheduled" && currentSchedule.selectedTime
            ? formatScheduledLabel(currentSchedule.selectedTime, now)
            : null;

    return {
        now,
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        addressToDelete,
        setAddressToDelete,
        sheetDay,
        setSheetDay,
        sheetDraftTime,
        setSheetDraftTime,
        sheetRef,

        activeTab,
        setActiveTab,
        visibleTab,

        canAddMoreAddresses,
        hasSavedAddresses,
        showOrderPanel,
        bottomPadding,

        currentSchedule,
        currentScheduleText,
        currentScheduleLabel,

        takeawayRestaurants,
        selectedTakeawayRestaurantId,
        setTakeawayRestaurantId,
        sourceRestaurantTitle,
        scheduleSlots,

        openSheet,
        handleDayPress,
        handleSlotPress,
        handleSaveSheet,
        handleAsapPress,
        handleContinue,
        handleConfirmDelete,

        selectAddress,
        deleteAddress,
    };
}