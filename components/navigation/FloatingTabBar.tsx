import type {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useQuery} from "@tanstack/react-query";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {themeColors} from "@/utils/theme-colors";
import {getCartItemsCount, useCartStore} from "@/store/cart-store";
import {openAuthSheet} from "@/features/auth/AuthSheetController";
import {isProfileAuthenticated, useProfileStore} from "@/store/profile-store";
import {
    getUnreadNotifications,
    unreadNotificationsQueryKey,
} from "@/services/notifications";

const TAB_META: Record<
    string,
    {
        label: string;
        icon: keyof typeof MaterialCommunityIcons.glyphMap;
        activeIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    }
> = {
    index: {
        label: "Главная",
        icon: "home-outline",
        activeIcon: "home",
    },
    menu: {
        label: "Меню",
        icon: "view-grid-outline",
        activeIcon: "view-grid",
    },
    cart: {
        label: "Корзина",
        icon: "shopping-outline",
        activeIcon: "shopping",
    },
    booking: {
        label: "Бронь",
        icon: "calendar-check-outline",
        activeIcon: "calendar-check",
    },
    profile: {
        label: "Профиль",
        icon: "account-outline",
        activeIcon: "account",
    },
};

export function FloatingTabBar({state, descriptors, navigation}: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const cartItems = useCartStore((store) => store.items);
    const hasHydrated = useProfileStore((store) => store.hasHydrated);
    const user = useProfileStore((store) => store.user);
    const cartItemsCount = getCartItemsCount(cartItems);
    const unreadNotificationsQuery = useQuery({
        queryKey: unreadNotificationsQueryKey,
        queryFn: getUnreadNotifications,
        enabled: hasHydrated && Boolean(user),
        refetchInterval: 30000,
    });
    const profileBadgeCount = unreadNotificationsQuery.data?.count ?? 0;

    return (
        <View
            pointerEvents="box-none"
            style={[
                styles.wrapper,
                {
                    paddingBottom: Math.max(insets.bottom, 0),
                },
            ]}
        >
            <View style={styles.container}>
                {state.routes.map((route, index) => {
                    const focused = state.index === index;
                    const options = descriptors[route.key]?.options;

                    const meta = TAB_META[route.name] ?? {
                        label: options?.title ?? route.name,
                        icon: "circle-outline" as const,
                    };

                    const iconName = focused
                        ? meta.activeIcon ?? meta.icon
                        : meta.icon;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (event.defaultPrevented) {
                            return;
                        }

                        if (route.name === "profile" && !isProfileAuthenticated()) {
                            openAuthSheet({
                                onSuccess: () => {
                                    navigation.navigate(route.name);
                                },
                            });
                            return;
                        }

                        if (!focused) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        });
                    };

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={focused ? {selected: true} : {}}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.item}
                        >
                            <View>
                                <MaterialCommunityIcons
                                    name={iconName}
                                    size={22}
                                    color={focused ? themeColors.primary : themeColors.textSecondary}
                                />

                                {route.name === "cart" && cartItemsCount > 0 ? (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText} numberOfLines={1}>
                                            {cartItemsCount > 99 ? "99+" : cartItemsCount}
                                        </Text>
                                    </View>
                                ) : null}
                                {route.name === "profile" && profileBadgeCount > 0 ? (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText} numberOfLines={1}>
                                            {profileBadgeCount > 99 ? "99+" : profileBadgeCount}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.label,
                                    focused && styles.activeLabel,
                                ]}
                            >
                                {meta.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#050505",
    },

    container: {
        height: 64,
        paddingHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "#050505",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(255, 255, 255, 0.08)",
    },

    item: {
        flex: 1,
        height: 58,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },

    label: {
        color: themeColors.textSecondary,
        fontSize: 10,
        lineHeight: 12,
        fontFamily: "Point-Regular",
    },

    activeLabel: {
        color: themeColors.primary,
        fontFamily: "Point-SemiBold",
    },

    badge: {
        position: "absolute",
        top: -8,
        right: -12,
        minWidth: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
        borderRadius: 9,
        backgroundColor: themeColors.notification,
        borderWidth: 1,
        borderColor: "#050505",
    },

    badgeText: {
        color: themeColors.text,
        fontSize: 10,
        lineHeight: 12,
        fontFamily: "Point-Bold",
    },
});
