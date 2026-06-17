import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

export const MANGAL_CLUBS_RESTAURANT_ID = "mangal-club";

export type DeliveryType = "delivery" | "takeaway";
export type SelectedDeliveryType = DeliveryType | null;
export type DeliveryTimeMode = "asap" | "scheduled";
export type DeliveryScheduleDay = "today" | "tomorrow" | "dayAfterTomorrow";

export type DeliveryTimeSlot = {
    day: DeliveryScheduleDay;
    startMinutes: number;
};

export type DeliveryTime = {
    mode: DeliveryTimeMode;
    selectedTime: DeliveryTimeSlot | null;
};

type DeliveryStore = {
    type: SelectedDeliveryType;
    deliveryTime: DeliveryTime;
    takeawayRestaurantId: string | null;
    sourceRestaurantId: string | null;
    hasSelectedType: boolean;
    hasHydrated: boolean;
    setType: (type: DeliveryType) => void;
    setDeliveryTime: (
        value: DeliveryTime | ((previous: DeliveryTime) => DeliveryTime)
    ) => void;
    setTakeawayRestaurantId: (restaurantId: string) => void;
    clearDelivery: () => void;
    setHasHydrated: (value: boolean) => void;
};

export function emptyDeliveryTime(): DeliveryTime {
    return {mode: "asap", selectedTime: null};
}

export function getDeliveryRestaurantId(
    type: SelectedDeliveryType,
    takeawayRestaurantId: string | null
): string | null {
    return type === "delivery"
        ? null
        : takeawayRestaurantId;
}

export const useDeliveryStore = create<DeliveryStore>()(
    persist(
        (set) => ({
            type: null,
            deliveryTime: emptyDeliveryTime(),
            takeawayRestaurantId: null,
            sourceRestaurantId: null,
            hasSelectedType: false,
            hasHydrated: false,
            setType: (type) =>
                set((state) => ({
                    type,
                    hasSelectedType: true,
                    sourceRestaurantId: getDeliveryRestaurantId(
                        type,
                        state.takeawayRestaurantId
                    ),
                })),
            setDeliveryTime: (value) =>
                set((state) => ({
                    deliveryTime:
                        typeof value === "function"
                            ? value(state.deliveryTime)
                            : value,
                })),
            setTakeawayRestaurantId: (restaurantId) =>
                set((state) => ({
                    takeawayRestaurantId: restaurantId,
                    sourceRestaurantId: getDeliveryRestaurantId(
                        state.type,
                        restaurantId
                    ),
                })),
            clearDelivery: () => set({
                type: null,
                deliveryTime: emptyDeliveryTime(),
                takeawayRestaurantId: null,
                sourceRestaurantId: null,
                hasSelectedType: false,
            }),
            setHasHydrated: (value) => set({hasHydrated: value}),
        }),
        {
            name: "delivery-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                type: state.type,
                deliveryTime: state.deliveryTime,
                takeawayRestaurantId: state.takeawayRestaurantId,
                sourceRestaurantId: state.sourceRestaurantId,
                hasSelectedType: state.hasSelectedType,
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) {
                    return;
                }

                if (!state.hasSelectedType) {
                    state.type = null;
                    state.sourceRestaurantId = null;
                }

                state.setHasHydrated(true);
            },
        }
    )
);
