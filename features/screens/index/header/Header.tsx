import {Pressable, StyleSheet, Text, View} from "react-native";
import {Feather, MaterialCommunityIcons} from "@expo/vector-icons";

import {themeColors} from "@/utils/theme-colors";

export function Header() {
    return (
        <View style={styles.container}>
            <View style={styles.info}>
                <View style={styles.statusRow}>
                    <MaterialCommunityIcons
                        name="silverware-fork-knife"
                        size={14}
                        color={themeColors.primary}
                    />

                    <Text style={styles.statusText} numberOfLines={1}>
                        Ресторан работает с 10:00 до 22:00
                    </Text>
                </View>

                <View style={styles.addressRow}>
                    <Text style={styles.addressText} numberOfLines={1}>
                        Краснодар, ул Уральск...
                    </Text>

                    <Feather
                        name="chevron-right"
                        size={22}
                        color={themeColors.text}
                    />
                </View>
            </View>

            <View style={styles.actions}>
                <Pressable style={styles.iconButton}>
                    <MaterialCommunityIcons
                        name="calendar-outline"
                        size={20}
                        color={themeColors.text}
                    />
                </Pressable>

                <Pressable style={styles.iconButton}>
                    <MaterialCommunityIcons
                        name="chef-hat"
                        size={20}
                        color={themeColors.text}
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 72,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        paddingHorizontal: 22,
        paddingTop:4,
    },

    info: {
        flex: 1,
        maxWidth: 230,
    },

    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        marginBottom: 4,
    },

    statusText: {
        flex: 1,
        color: themeColors.primary,
        fontFamily: "Point-Book",
        fontSize: 13,
        lineHeight: 14,
    },

    addressRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    addressText: {
        flex: 1,
        color: themeColors.text,
        fontFamily: "Point-Bold",
        fontSize: 18,
        lineHeight: 18,
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 42,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: themeColors.border,
    },
});