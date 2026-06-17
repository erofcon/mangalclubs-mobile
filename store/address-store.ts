import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

import type {Coordinates} from "@/utils/location-config";

export const MAX_SAVED_ADDRESSES = 5;

export type SavedAddress = {
    id: string;
    city: string;
    address: string;
    house: string;
    shortAddress: string;
    latitude: number;
    longitude: number;
    accuracy: number | null;
    isPrecise: boolean;
    deliveryPrice: number | null;
    createdAt: number;
    updatedAt: number;
};

export type SavedAddressInput = Omit<
    SavedAddress,
    "id" | "createdAt" | "updatedAt"
>;

type AddressStore = {
    addresses: SavedAddress[];
    selectedAddressId: string | null;
    hasHydrated: boolean;
    addAddress: (address: SavedAddressInput) => {
        id: string;
        created: boolean;
        limitReached?: boolean;
    };
    deleteAddress: (id: string) => void;
    selectAddress: (id: string) => void;
    setHasHydrated: (value: boolean) => void;
};

function normalizeAddressKey(value: string): string {
    return value
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-z0-9а-я\s-]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function createAddressId(): string {
    return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isSameAddress(
    left: SavedAddress,
    right: SavedAddressInput
): boolean {
    if (normalizeAddressKey(left.shortAddress) !== normalizeAddressKey(right.shortAddress)) {
        return false;
    }

    return (
        Math.abs(left.latitude - right.latitude) < 0.000001 &&
        Math.abs(left.longitude - right.longitude) < 0.000001
    );
}

function getNextSelectedAddressId(
    addresses: SavedAddress[],
    removedAddressId: string
): string | null {
    const next = addresses.find((address) => address.id !== removedAddressId);
    return next?.id ?? null;
}

export const useAddressStore = create<AddressStore>()(
    persist(
        (set, get) => ({
            addresses: [],
            selectedAddressId: null,
            hasHydrated: false,
            addAddress: (address) => {
                const now = Date.now();
                const {addresses} = get();
                const existing = addresses.find((item) =>
                    isSameAddress(item, address)
                );

                if (existing) {
                    set({
                        addresses: [
                            {
                                ...existing,
                                ...address,
                                createdAt: existing.createdAt,
                                updatedAt: now,
                            },
                            ...addresses.filter((item) => item.id !== existing.id),
                        ],
                        selectedAddressId: existing.id,
                    });

                    return {
                        id: existing.id,
                        created: false,
                    };
                }

                if (addresses.length >= MAX_SAVED_ADDRESSES) {
                    return {
                        id: "",
                        created: false,
                        limitReached: true,
                    };
                }

                const id = createAddressId();

                set({
                    addresses: [
                        {
                            ...address,
                            id,
                            createdAt: now,
                            updatedAt: now,
                        },
                        ...addresses,
                    ],
                    selectedAddressId: id,
                });

                return {
                    id,
                    created: true,
                };
            },
            deleteAddress: (id) => {
                const {addresses, selectedAddressId} = get();
                const nextAddresses = addresses.filter(
                    (address) => address.id !== id
                );

                set({
                    addresses: nextAddresses,
                    selectedAddressId:
                        selectedAddressId === id
                            ? getNextSelectedAddressId(nextAddresses, id)
                            : selectedAddressId,
                });
            },
            selectAddress: (id) => {
                const addressExists = get().addresses.some(
                    (address) => address.id === id
                );

                if (!addressExists) {
                    return;
                }

                set({selectedAddressId: id});
            },
            setHasHydrated: (value) => set({hasHydrated: value}),
        }),
        {
            name: "address-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                addresses: state.addresses,
                selectedAddressId: state.selectedAddressId,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);

                if (!state) {
                    return;
                }

                if (!state.selectedAddressId && state.addresses.length > 0) {
                    state.selectAddress(state.addresses[0].id);
                }
            },
        }
    )
);
