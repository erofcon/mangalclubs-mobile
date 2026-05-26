import type {BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {themeColors} from "@/utils/theme-colors";

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

                        if (!focused && !event.defaultPrevented) {
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
                            <MaterialCommunityIcons
                                name={iconName}
                                size={22}
                                color={focused ? themeColors.primary : themeColors.textSecondary}
                            />

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
});