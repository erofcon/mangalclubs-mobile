import {StyleSheet, Text, View, Pressable, ScrollView} from "react-native";
import {Screen} from "@/components/ui/Screen";
import {SHADOW, themeColors} from "@/utils/theme-colors";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Categories} from "@/features/screens/index/categories/Categories";
import {Stories} from "@/features/screens/index/stories/Stories";
import {RestaurantsList} from "@/features/screens/index/restaurants/RestaurantsList";
import {router} from "expo-router";


export function IndexScreen() {

    return (
        <Screen withTopInset>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >

                {/* Header */}
                <View style={styles.headerContainer}>
                    <Pressable style={styles.addressContainer}
                               onPress={() =>
                                   router.push({
                                       pathname: "/order_type",
                                       params: {
                                           type: "delivery",
                                       },
                                   })
                               }
                    >

                        <View style={styles.locationIconContainer}>
                            <Ionicons
                                name="location-outline"
                                size={24}
                                color={themeColors.primary}
                            />
                        </View>

                        <View style={styles.addressTextContainer}>
                            <View style={styles.addressRow}>
                                <Text
                                    style={styles.addressTitle}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    г. Грозный ул. Светлая 124
                                </Text>

                                <MaterialCommunityIcons
                                    name="chevron-down"
                                    size={18}
                                    color={themeColors.textSecondary}
                                />
                            </View>

                            <Text style={styles.deliveryText}>
                                Доставка
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable style={styles.accountButton}>
                        <MaterialCommunityIcons
                            name="account-outline"
                            size={24}
                            color={themeColors.primary}
                        />
                    </Pressable>
                </View>

                {/* Search */}
                <View style={styles.searchWrapper}>
                    <Pressable style={styles.searchContainer}>
                        <View style={styles.searchLeft}>
                            <Ionicons
                                name="search-outline"
                                size={24}
                                color={themeColors.border}
                            />

                            <Text style={styles.searchPlaceholder}>
                                Поиск блюд и ресторанов
                            </Text>
                        </View>

                        <Pressable style={styles.filterButton}>
                            <MaterialCommunityIcons
                                name="tune-variant"
                                size={24}
                                color={themeColors.primary}
                            />
                        </Pressable>
                    </Pressable>
                </View>

                <Categories/>

                <Stories/>

                <RestaurantsList/>

            </ScrollView>

        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 64,
    },

    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 14,
    },

    addressContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,

        flex: 1,
    },

    locationIconContainer: {
        width: 42,
        height: 42,

        alignItems: "center",
        justifyContent: "center",
    },

    addressTextContainer: {
        flex: 1,
        minWidth: 0,
    },

    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },

    addressTitle: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
        letterSpacing: -0.4,

        maxWidth: 180,
    },

    deliveryText: {
        marginTop: 2,

        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
    },

    accountButton: {
        width: 42,
        height: 42,
        borderRadius: 999,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderColor: themeColors.border,

        backgroundColor: themeColors.card,

        ...SHADOW,
    },

    /* Search */

    searchWrapper: {
        paddingVertical: 18,
        paddingHorizontal: 12,
    },

    searchContainer: {
        height: 52,
        borderRadius: 17,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingLeft: 18,
        paddingRight: 10,

        backgroundColor: themeColors.card,

        borderWidth: 1,
        borderColor: themeColors.border,

        ...SHADOW,
    },

    searchLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,

        flex: 1,
    },

    searchPlaceholder: {
        color: themeColors.textSecondary,
        fontSize: 16,
        fontFamily: "Point-Regular",

        flex: 1,
    },

    filterButton: {
        width: 44,
        height: 44,

        alignItems: "center",
        justifyContent: "center",
    },
});
