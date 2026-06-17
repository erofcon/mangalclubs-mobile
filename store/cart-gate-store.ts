import {Alert} from "react-native";
import {router} from "expo-router";
import {create} from "zustand";

import {openAuthSheet} from "@/features/auth/AuthSheetController";
import {useAddressStore} from "@/store/address-store";
import {useAppDataStore} from "@/store/app-data-store";
import {useCartStore} from "@/store/cart-store";
import {useDeliveryStore} from "@/store/delivery-store";
import {isProfileAuthenticated} from "@/store/profile-store";
import type {MenuCategory, MenuItem} from "@/types/products";

type PendingCartItem = {
    item: MenuItem;
    quantity: number;
};

type ContinuePendingCartFlowOptions = {
    refreshMenu?: boolean;
};

type CartGateStore = {
    pendingCartItem: PendingCartItem | null;
    setPendingCartItem: (pendingCartItem: PendingCartItem) => void;
    clearPendingCartItem: () => void;
};

export const useCartGateStore = create<CartGateStore>((set) => ({
    pendingCartItem: null,
    setPendingCartItem: (pendingCartItem) => set({pendingCartItem}),
    clearPendingCartItem: () => set({pendingCartItem: null}),
}));

const hasCompleteOrderSelection = () => {
    const deliveryState = useDeliveryStore.getState();

    if (deliveryState.type === "takeaway") {
        return Boolean(deliveryState.takeawayRestaurantId);
    }

    if (deliveryState.type === "delivery") {
        const addressState = useAddressStore.getState();

        return Boolean(addressState.selectedAddressId || addressState.addresses[0]);
    }

    return false;
};

const findFreshMenuItem = (
    menu: MenuCategory[],
    requestedItem: MenuItem
) => {
    for (const category of menu) {
        const item = category.items.find((candidate) => {
            if (candidate.id === requestedItem.id) {
                return true;
            }

            return Boolean(requestedItem.sku && candidate.sku === requestedItem.sku);
        });

        if (item) {
            return item;
        }
    }

    return null;
};

const openOrderTypeScreen = () => {
    router.push("/order_type");
};

export const cancelPendingCartFlow = () => {
    useCartGateStore.getState().clearPendingCartItem();
};

export const continuePendingCartFlow = async (
    options: ContinuePendingCartFlowOptions = {}
) => {
    const pendingCartItem = useCartGateStore.getState().pendingCartItem;

    if (!pendingCartItem) {
        return false;
    }

    if (!isProfileAuthenticated()) {
        openAuthSheet({
            onSuccess: () => {
                void continuePendingCartFlow(options);
            },
            onCancel: cancelPendingCartFlow,
        });
        return false;
    }

    if (!hasCompleteOrderSelection()) {
        openOrderTypeScreen();
        return false;
    }

    if (options.refreshMenu) {
        try {
            await useAppDataStore.getState().refreshMenuForCurrentOrder("cart-gate");
        } catch (error) {
            cancelPendingCartFlow();
            Alert.alert(
                "Не удалось обновить меню",
                error instanceof Error
                    ? error.message
                    : "Проверьте интернет и попробуйте добавить блюдо ещё раз."
            );
            return false;
        }
    }

    const freshItem = options.refreshMenu
        ? findFreshMenuItem(useAppDataStore.getState().menu, pendingCartItem.item)
        : pendingCartItem.item;

    if (!freshItem) {
        cancelPendingCartFlow();
        Alert.alert(
            "Блюдо недоступно",
            "После выбора способа заказа меню обновилось, и это блюдо сейчас нельзя добавить."
        );
        return false;
    }

    useCartStore.getState().addItem(freshItem, pendingCartItem.quantity);
    cancelPendingCartFlow();

    return true;
};

export const requestCartAddPermission = (item: MenuItem, quantity = 1) => {
    if (isProfileAuthenticated() && hasCompleteOrderSelection()) {
        return true;
    }

    useCartGateStore.getState().setPendingCartItem({item, quantity});

    if (!isProfileAuthenticated()) {
        openAuthSheet({
            onSuccess: () => {
                void continuePendingCartFlow();
            },
            onCancel: cancelPendingCartFlow,
        });
        return false;
    }

    openOrderTypeScreen();
    return false;
};
