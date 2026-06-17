import {useEffect, useMemo, useRef, useState} from "react";
import type {ImageSourcePropType} from "react-native";
import {router, useLocalSearchParams, useNavigation} from "expo-router";

import {
    MAX_SAVED_ADDRESSES,
    useAddressStore,
    type SavedAddress,
} from "@/store/address-store";
import {
    useDeliveryStore,
    type DeliveryScheduleDay,
    type DeliveryTimeSlot,
    type DeliveryType,
} from "@/store/delivery-store";
import {useAppDataStore} from "@/store/app-data-store";
import {
    cancelPendingCartFlow,
    continuePendingCartFlow,
    useCartGateStore,
} from "@/store/cart-gate-store";
import type {Organization} from "@/types/organization";
import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {resolveApiAssetUrl} from "@/services/api";
import {
    getOrganizationAvailability,
    isOrganizationUnavailable,
} from "@/services/availability";

import {
    formatDistanceKm,
    formatScheduledLabel,
    getDefaultScheduledTime,
    getScheduleSlots,
} from "./order-type.utils";
import type {TakeawayRestaurant} from "./order-type.types";

const restaurantImages: Record<string, ImageSourcePropType> = {
    fazenda: require("@/assets/mocks/restaurant-images/fazenda/XXXL.webp"),
    "mangal-club": require("@/assets/mocks/restaurant-images/mangal-clubs/XXXL.webp"),
    "mangal-clubs": require("@/assets/mocks/restaurant-images/mangal-clubs/XXXL.webp"),
};

const scheduleDays: DeliveryScheduleDay[] = [
    "today",
    "tomorrow",
    "dayAfterTomorrow",
];

const getOrganizationByIdOrSlug = (
    organizations: Organization[],
    idOrSlug?: string | null
) => (
    organizations.find((organization) =>
        organization.id === idOrSlug || organization.slug === idOrSlug
    ) ?? null
);

export function useOrderTypeScreen() {
    const params = useLocalSearchParams<{type?: DeliveryType}>();
    const navigation = useNavigation();
    const now = new Date();

    const organizations = useAppDataStore((state) => state.organizations);
    const defaultDeliveryOrganization = useAppDataStore(
        (state) => state.defaultDeliveryOrganization
    );
    const availabilityByOrganizationId = useAppDataStore(
        (state) => state.availabilityByOrganizationId
    );
    const hasPendingCartItem = useCartGateStore((state) => Boolean(state.pendingCartItem));

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
    const selectedTakeawayRestaurantId = useDeliveryStore(
        (state) => state.takeawayRestaurantId
    );
    const setTakeawayRestaurantId = useDeliveryStore(
        (state) => state.setTakeawayRestaurantId
    );

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
            organizations
                .filter((organization) => organization.accepts_pickup !== false)
                .map((organization) => {
                    const availability = getOrganizationAvailability(
                        organization,
                        availabilityByOrganizationId
                    );
                    const image = resolveApiAssetUrl(organization.photo_url);

                    return {
                        id: organization.slug ?? organization.id,
                        title: organization.name,
                        address: `${organization.city}, ${organization.address}`,
                        hours: organization.schedule,
                        distance: selectedAddress
                            ? formatDistanceKm(selectedAddress, organization.coordinates)
                            : "-",
                        image:
                            image ??
                            restaurantImages[organization.slug ?? organization.id] ??
                            restaurantImages[organization.id] ??
                            restaurantImages.fazenda,
                        isUnavailable: availability?.orders_available === false,
                        unavailableMessage: availability?.message,
                    };
                }),
        [availabilityByOrganizationId, organizations, selectedAddress]
    );

    const deliveryRestaurant =
        defaultDeliveryOrganization ?? organizations[0] ?? null;
    const deliveryAvailability = getOrganizationAvailability(
        deliveryRestaurant,
        availabilityByOrganizationId
    );
    const isDeliveryUnavailable =
        deliveryAvailability?.orders_available === false;

    const selectedTakeawayRestaurant =
        takeawayRestaurants.find(
            (restaurant) => restaurant.id === selectedTakeawayRestaurantId
        ) ??
        takeawayRestaurants.find((restaurant) => !restaurant.isUnavailable) ??
        takeawayRestaurants[0];

    const selectedTakeawayOrganization = getOrganizationByIdOrSlug(
        organizations,
        selectedTakeawayRestaurant?.id ?? selectedTakeawayRestaurantId
    );
    const isSelectedTakeawayUnavailable =
        selectedTakeawayRestaurant?.isUnavailable ??
        isOrganizationUnavailable(
            selectedTakeawayOrganization,
            availabilityByOrganizationId
        );
    const scheduleOrganization =
        visibleTab === "delivery" ? deliveryRestaurant : selectedTakeawayOrganization;
    const scheduleSlots = useMemo(
        () => getScheduleSlots(now, scheduleOrganization),
        [now, scheduleOrganization]
    );
    const selectedScheduleSlotAvailable =
        currentSchedule.mode !== "scheduled" ||
        (
            currentSchedule.selectedTime !== null &&
            scheduleSlots[currentSchedule.selectedTime.day].some(
                (slot) => slot.startMinutes === currentSchedule.selectedTime?.startMinutes
            )
        );
    const isCurrentTimeUnavailable =
        currentSchedule.mode === "asap"
            ? scheduleSlots.today.length === 0
            : !selectedScheduleSlotAvailable;

    const sourceRestaurantTitle =
        visibleTab === "delivery"
            ? deliveryRestaurant?.name ?? "Mangal Club"
            : selectedTakeawayRestaurant?.title ?? organizations[0]?.name ?? "Ресторан";

    const orderUnavailableMessage =
        visibleTab === "delivery" && isDeliveryUnavailable
            ? deliveryAvailability?.message || "Доставка временно недоступна."
            : visibleTab === "takeaway" && isSelectedTakeawayUnavailable
                ? selectedTakeawayRestaurant?.unavailableMessage ||
                "В этом ресторане сейчас нельзя оформить заказ."
                : isCurrentTimeUnavailable
                    ? "До закрытия осталось меньше 30 минут. Выберите другое время заказа."
                : "";
    const canContinueOrder =
        visibleTab === "delivery"
            ? !isDeliveryUnavailable && !isCurrentTimeUnavailable && hasSavedAddresses
            : Boolean(selectedTakeawayRestaurant) && !isSelectedTakeawayUnavailable && !isCurrentTimeUnavailable;

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

        if (selectedTakeawayRestaurantId) {
            const selected = takeawayRestaurants.find(
                (restaurant) => restaurant.id === selectedTakeawayRestaurantId
            );

            if (selected && !selected.isUnavailable) {
                return;
            }
        }

        const firstAvailableRestaurant = takeawayRestaurants.find(
            (restaurant) => !restaurant.isUnavailable
        );

        if (firstAvailableRestaurant) {
            setTakeawayRestaurantId(firstAvailableRestaurant.id);
        }
    }, [
        activeTab,
        selectedTakeawayRestaurantId,
        setTakeawayRestaurantId,
        takeawayRestaurants,
    ]);

    useEffect(() => {
        if (addressToDelete && !addresses.some((item) => item.id === addressToDelete.id)) {
            setAddressToDelete(null);
        }
    }, [addresses, addressToDelete]);

    useEffect(() => {
        return navigation.addListener("beforeRemove", () => {
            if (useCartGateStore.getState().pendingCartItem) {
                cancelPendingCartFlow();
            }
        });
    }, [navigation]);

    const openSheet = () => {
        const selectedTime =
            currentSchedule.mode === "scheduled" && currentSchedule.selectedTime
                ? currentSchedule.selectedTime
                : getDefaultScheduledTime(now, scheduleOrganization);

        const nextDay = selectedTime?.day ?? "today";
        const daySlots = scheduleSlots[nextDay];
        const firstAvailableDay =
            scheduleDays.find((day) => scheduleSlots[day].length > 0) ?? nextDay;

        const normalized =
            selectedTime && daySlots.some((slot) => slot.startMinutes === selectedTime.startMinutes)
                ? selectedTime
                : scheduleSlots[firstAvailableDay][0] ??
                getDefaultScheduledTime(now, scheduleOrganization);

        setSheetDay(normalized?.day ?? firstAvailableDay);
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

    const handleContinue = async () => {
        if (!canContinueOrder) {
            return;
        }

        setActiveTab(visibleTab);
        if (hasPendingCartItem) {
            await continuePendingCartFlow({refreshMenu: true});
        }
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
        orderUnavailableMessage,
        canContinueOrder,
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
