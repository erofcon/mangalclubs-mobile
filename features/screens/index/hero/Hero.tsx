import {ImageSourcePropType, Pressable, StyleSheet, Text, View} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {SHADOW, themeColors} from "@/utils/theme-colors";
import {Image} from "expo-image";
import {router} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {LinearGradient} from "expo-linear-gradient";
import {useDeliveryStore} from "@/store/delivery-store";
import {useMemo} from "react";
import {Organizations} from "@/mocks/mocks-data";


const heroImages: Record<string, ImageSourcePropType> = {
    fazenda: require("@/assets/mocks/restaurant-images/fazenda/XXXL.webp"),
    "mangal-club": require("@/assets/mocks/restaurant-images/mangal-clubs/XXXL.webp"),
};

export function Hero() {

    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);


    const sourceRestaurant = useMemo(
        () =>
            Organizations.find((organization) => organization.id === sourceRestaurantId) ??
            Organizations[0] ??
            null,
        [sourceRestaurantId]
    );

    const heroImage = sourceRestaurant
        ? heroImages[sourceRestaurant.id] ?? heroImages.fazenda
        : heroImages.fazenda;

    return (

        <View style={styles.hero}>
            <Image
                source={heroImage}
                style={styles.heroImage}
                contentFit="cover"
                transition={220}
                cachePolicy="memory-disk"
            />

            <LinearGradient
                pointerEvents="none"
                colors={["rgba(7,8,8,0.12)", "rgba(7,8,8,0.58)", "#070808"]}
                locations={[0, 0.48, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>
                    Искусство живого огня
                </Text>

                <Text style={styles.heroSubtitle1} numberOfLines={2}>
                    Мясо, за которым возвращаются
                </Text>

                <Text style={styles.heroSubtitle2} numberOfLines={2}>
                    Авторские стейки, мангал и приватные залы для тех вечеров, где важны вкус, огонь и спокойная
                    атмосфера
                </Text>

                <View style={styles.heroActions}>
                    <Pressable
                        style={({pressed}) => [
                            styles.primaryAction,
                            pressed && styles.pressed,
                        ]}
                        onPress={() => router.push("/menu")}
                    >
                        <Text style={styles.primaryActionText}>Открыть меню</Text>
                        <MaterialCommunityIcons
                            name="arrow-right"
                            size={18}
                            color={themeColors.textOnPrimary}
                        />
                    </Pressable>

                    <Pressable
                        style={({pressed}) => [
                            styles.bookingAction,
                            pressed && styles.pressed,
                        ]}
                        onPress={() => router.push("/booking")}
                    >
                        <Text style={styles.bookingActionText}>Бронирование</Text>
                        <MaterialCommunityIcons
                            name="calendar"
                            size={18}
                            color={themeColors.text}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    hero: {
        minHeight: 420,
        overflow: "hidden",
        position: "relative",
        paddingHorizontal: 12,
        paddingTop: 20,
        paddingBottom: 24,
        justifyContent: "flex-end",
        backgroundColor: "#070808",
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
    },
    heroContent: {
        zIndex: 2,
        paddingTop: 72,
    },
    heroTitle: {
        marginTop: 14,
        color: themeColors.text,
        fontSize: 42,
        lineHeight: 44,
        fontFamily: "Point-Black",
    },
    heroSubtitle1: {
        fontSize: 22,
        marginTop: 10,
        maxWidth: 330,
        fontFamily: "Point-Regular",
        color: "#fcb001",
    },
    heroSubtitle2: {
        marginTop: 10,
        maxWidth: 330,
        color: "rgba(255,255,255,0.72)",
        fontSize: 16,
        lineHeight: 22,
        fontFamily: "Point-Regular",
    },
    heroActions: {
        marginTop: 22,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    primaryAction: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 18,
        borderRadius: 16,
        backgroundColor: themeColors.primary,
    },
    bookingAction:{
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 18,
        borderRadius: 16,
        backgroundColor:"#4a2808",

    },
    primaryActionText: {
        color: themeColors.textOnPrimary,
        fontSize: 15,
        lineHeight: 18,
        fontFamily: "Point-Bold",
    },
    bookingActionText: {
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 18,
        fontFamily: "Point-Bold",
    },
    searchAction: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.13)",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    pressed: {
        opacity: 0.86,
        transform: [{scale: 0.985}],
    },
})