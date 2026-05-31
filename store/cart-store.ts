import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

import type {MenuItem} from "@/types/products";

export const CART_DELIVERY_FEE = 540;
export const CART_UTENSILS_PRICE = 50;

export type CartItem = MenuItem & {
    quantity: number;
    comment: string;
};

type CartStore = {
    items: CartItem[];
    promoCode: string;
    addUtensils: boolean;
    addBread: boolean;
    hasHydrated: boolean;
    addItem: (item: MenuItem, quantity?: number) => void;
    incrementItem: (id: string) => void;
    decrementItem: (id: string) => void;
    removeItem: (id: string) => void;
    setItemComment: (id: string, comment: string) => void;
    setPromoCode: (promoCode: string) => void;
    toggleUtensils: () => void;
    toggleBread: () => void;
    clearCart: () => void;
    setHasHydrated: (value: boolean) => void;
};

export function getCartItemsCount(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartExtrasTotal(addUtensils: boolean): number {
    return addUtensils ? CART_UTENSILS_PRICE : 0;
}

export function getCartTotal(items: CartItem[], addUtensils: boolean): number {
    return getCartSubtotal(items) + CART_DELIVERY_FEE + getCartExtrasTotal(addUtensils);
}

function normalizeQuantity(quantity: number): number {
    return Math.max(1, Math.floor(quantity));
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            promoCode: "",
            addUtensils: false,
            addBread: false,
            hasHydrated: false,
            addItem: (item, quantity = 1) =>
                set((state) => {
                    const nextQuantity = normalizeQuantity(quantity);
                    const existingItem = state.items.find((cartItem) => cartItem.id === item.id);

                    if (existingItem) {
                        return {
                            items: state.items.map((cartItem) =>
                                cartItem.id === item.id
                                    ? {
                                        ...cartItem,
                                        ...item,
                                        quantity: cartItem.quantity + nextQuantity,
                                    }
                                    : cartItem
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                ...item,
                                quantity: nextQuantity,
                                comment: "",
                            },
                        ],
                    };
                }),
            incrementItem: (id) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id
                            ? {...item, quantity: item.quantity + 1}
                            : item
                    ),
                })),
            decrementItem: (id) =>
                set((state) => ({
                    items: state.items
                        .map((item) =>
                            item.id === id
                                ? {...item, quantity: item.quantity - 1}
                                : item
                        )
                        .filter((item) => item.quantity > 0),
                })),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),
            setItemComment: (id, comment) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? {...item, comment} : item
                    ),
                })),
            setPromoCode: (promoCode) => set({promoCode}),
            toggleUtensils: () =>
                set((state) => ({addUtensils: !state.addUtensils})),
            toggleBread: () =>
                set((state) => ({addBread: !state.addBread})),
            clearCart: () =>
                set({
                    items: [],
                    promoCode: "",
                    addUtensils: false,
                    addBread: false,
                }),
            setHasHydrated: (value) => set({hasHydrated: value}),
        }),
        {
            name: "cart-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                items: state.items,
                promoCode: state.promoCode,
                addUtensils: state.addUtensils,
                addBread: state.addBread,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
