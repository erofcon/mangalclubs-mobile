import {Pressable, StyleSheet, Text, View} from "react-native";
import {themeColors} from "@/utils/theme-colors";
import {router} from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

type SearchBannerProps = {
    onCategoriesPress?: () => void;
};

export function SearchBanner({onCategoriesPress}: SearchBannerProps) {
    return (
        <View style={styles.searchPanel}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Открыть поиск блюд и ресторанов"
                style={styles.searchLeft}
                onPress={() => router.push("/search")}
            >
                <Ionicons
                    name="search-outline"
                    size={23}
                    color={themeColors.textSecondary}
                />

                <Text style={styles.searchPlaceholder} numberOfLines={1}>
                    Найти стейк, шашлык или салат
                </Text>
            </Pressable>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Открыть категории"
                style={styles.filterButton}
                onPress={onCategoriesPress}
                hitSlop={8}
            >
                <MaterialCommunityIcons
                    name="tune-variant"
                    size={23}
                    color={themeColors.textSecondary}
                />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    searchPanel: {
        height: 44,
        marginHorizontal: 12,
        marginBottom: 22,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 16,
        paddingRight: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
    },
    searchLeft: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    searchPlaceholder: {
        flex: 1,
        color: themeColors.textSecondary,
        fontSize: 15,
        lineHeight: 18,
        fontFamily: "Point-Regular",
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
})
