import {FlatList, Pressable, Text, View} from "react-native";
import {Image} from "expo-image";
import {Ionicons} from "@expo/vector-icons";

import type {TakeawayRestaurant} from "../order-type.types";
import {themeColors} from "@/utils/theme-colors";
import styles from "../order-type.styles";

type Props = {
    restaurants: TakeawayRestaurant[];
    selectedRestaurantId: string | null;
    onSelect: (restaurantId: string) => void;
    bottomPadding: number;
};

export function TakeawayRestaurantsList({
    restaurants,
    selectedRestaurantId,
    onSelect,
    bottomPadding,
}: Props) {
    const renderRestaurantItem = ({item}: {item: TakeawayRestaurant}) => {
        const isSelected = item.id === selectedRestaurantId;
        const isDisabled = item.isUnavailable;

        return (
            <Pressable
                onPress={() => {
                    if (!isDisabled) {
                        onSelect(item.id);
                    }
                }}
                disabled={isDisabled}
                style={({pressed}) => [
                    styles.restaurantCard,
                    isSelected && styles.restaurantCardSelected,
                    isDisabled && styles.restaurantCardDisabled,
                    pressed && !isDisabled && styles.pressed,
                ]}
            >
                <View style={styles.restaurantImageWrap}>
                    {item.image ? (
                        <Image
                            source={item.image}
                            style={styles.restaurantImage}
                            contentFit="cover"
                            transition={180}
                        />
                    ) : (
                        <Ionicons
                            name="restaurant-outline"
                            size={28}
                            color={themeColors.textSecondary}
                        />
                    )}
                </View>

                <View style={styles.restaurantContent}>
                    <View style={styles.restaurantHeader}>
                        <Text style={styles.restaurantTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                    </View>

                    <Text style={styles.restaurantAddress} numberOfLines={2}>
                        {item.address}
                    </Text>

                    <View style={styles.restaurantHoursBlock}>
                        {(item.hoursLines?.length ? item.hoursLines : [item.hours]).map((line) => (
                            <Text
                                key={line}
                                style={styles.restaurantHours}
                                numberOfLines={1}
                            >
                                {line}
                            </Text>
                        ))}
                    </View>

                </View>
            </Pressable>
        );
    };

    return (
        <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id}
            renderItem={renderRestaurantItem}
            style={styles.list}
            contentContainerStyle={{paddingBottom: bottomPadding}}
            showsVerticalScrollIndicator={false}
        />
    );
}
