import React from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import {themeColors} from "@/utils/theme-colors";

const quickActions: {
    title: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    onPress: () => void;
}[] = [
    {
        title: "Доставка\nеды",
        icon: "truck-fast-outline",
        onPress: () =>
            router.push({
                pathname: "/order_type",
                params: {type: "delivery"},
            }),
    },
    {
        title: "Еда\nнавынос",
        icon: "shopping-outline",
        onPress: () =>
            router.push({
                pathname: "/order_type",
                params: {type: "takeaway"},
            }),
    },
    {
        title: "VIP\nкабинки",
        icon: "star-four-points-outline",
        onPress: () => router.push("/booking"),
    },
];

export function QuickActions() {
    return (
        <View style={styles.container}>
            {quickActions.map((action) => (
                <Pressable
                    key={action.title}
                    onPress={action.onPress}
                    style={({pressed}) => [
                        styles.item,
                        pressed && styles.pressed,
                    ]}
                >
                    <View style={styles.iconBox}>
                        <MaterialCommunityIcons
                            name={action.icon}
                            size={20}
                            color={themeColors.primary}
                        />
                    </View>

                    <Text style={styles.title}>
                        {action.title}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#080808",
        borderRadius: 18,
        paddingVertical: 22,
        marginBottom: 18,
    },

    item: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 10,
    },

    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.35)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(236,172,24,0.05)",
    },

    title: {
        color: "#FFFFFF",
        fontSize: 13,
        lineHeight: 16,
        fontFamily: "Point-Medium",
    },

    pressed: {
        opacity: 0.8,
    },
});