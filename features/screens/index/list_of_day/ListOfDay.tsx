import {MaterialCommunityIcons} from "@expo/vector-icons";
import {View, Text, Pressable, ScrollView, StyleSheet} from "react-native";
import {Image} from "expo-image";
import {router} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import {useMemo} from "react";
import {menus} from "@/mocks/mocks-data";
import {SHADOW, themeColors} from "@/utils/theme-colors";


export function ListOfDay() {
    const availableCategories = useMemo(
        () => menus.filter((category) => category.items.length > 0),
        []
    );

    const featuredItems = useMemo(
        () =>
            availableCategories
                .flatMap((category) =>
                    category.items.map((item) => ({
                        ...item,
                        categoryTitle: category.title,
                    }))
                )
                .slice(0, 3),
        [availableCategories]
    );

    return (

        <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionEyebrow}>Выбор кухни</Text>
                    <Text style={styles.sectionTitle}>Попробуйте сегодня</Text>
                </View>

                <Pressable
                    style={styles.sectionLink}
                    onPress={() => router.push("/menu")}
                >
                    <Text style={styles.sectionLinkText}>Все меню</Text>
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={18}
                        color={themeColors.primary}
                    />
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
            >
                {featuredItems.map((item) => (
                    <Pressable
                        key={item.id}
                        style={({pressed}) => [
                            styles.featuredCard,
                            pressed && styles.pressed,
                        ]}
                        onPress={() => router.push("/menu")}
                    >
                        <Image
                            source={item.image}
                            style={styles.featuredImage}
                            contentFit="cover"
                            transition={180}
                            cachePolicy="memory-disk"
                        />

                        <LinearGradient
                            pointerEvents="none"
                            colors={["rgba(9,9,8,0)", "rgba(9,9,8,0.92)"]}
                            style={styles.featuredOverlay}
                        />

                        <View style={styles.featuredMeta}>
                            <Text style={styles.featuredCategory} numberOfLines={1}>
                                {item.categoryTitle}
                            </Text>
                            <Text style={styles.featuredTitle} numberOfLines={2}>
                                {item.name}
                            </Text>
                            <Text style={styles.featuredPrice} numberOfLines={1}>
                                {item.price.toLocaleString("ru-RU")} ₽
                            </Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({

    featuredSection: {
        marginBottom: 8,
    },
    sectionHeader: {
        paddingHorizontal: 12,
        marginBottom: 13,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
    },
    sectionEyebrow: {
        color: themeColors.primary,
        fontSize: 12,
        lineHeight: 14,
        fontFamily: "Point-SemiBold",
        textTransform: "uppercase",
    },
    sectionTitle: {
        marginTop: 3,
        color: themeColors.text,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: "Point-Bold",
    },
    sectionLink: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 2,
    },
    sectionLinkText: {
        color: themeColors.primary,
        fontSize: 13,
        lineHeight: 16,
        fontFamily: "Point-Bold",
    },
    featuredList: {
        paddingHorizontal: 12,
        paddingBottom: 16,
    },
    featuredCard: {
        width: 188,
        height: 236,
        marginRight: 12,
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#141311",
        ...SHADOW,
    },
    featuredImage: {
        width: "100%",
        height: "100%",
    },
    featuredOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    featuredMeta: {
        position: "absolute",
        left: 13,
        right: 13,
        bottom: 13,
    },
    featuredCategory: {
        color: themeColors.primary,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: "Point-SemiBold",
    },
    featuredTitle: {
        marginTop: 4,
        minHeight: 42,
        color: themeColors.text,
        fontSize: 16,
        lineHeight: 20,
        fontFamily: "Point-Bold",
    },
    featuredPrice: {
        marginTop: 8,
        color: "rgba(255,255,255,0.74)",
        fontSize: 13,
        lineHeight: 16,
        fontFamily: "Point-SemiBold",
    },
    pressed: {
        opacity: 0.86,
        transform: [{scale: 0.985}],
    },
})