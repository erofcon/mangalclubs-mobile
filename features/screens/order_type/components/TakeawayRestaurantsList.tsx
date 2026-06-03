import {FlatList, Pressable, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Image} from "expo-image";

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

        return (
            <Pressable
                onPress={() => onSelect(item.id)}
                style={({pressed}) => [
                    styles.restaurantCard,
                    isSelected && styles.restaurantCardSelected,
                    pressed && styles.pressed,
                ]}
            >
                <View style={styles.restaurantImageWrap}>
                    <Image
                        source={item.image}
                        style={styles.restaurantImage}
                        contentFit="cover"
                        transition={180}
                    />
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

                    <Text style={styles.restaurantHours}>Время работы: {item.hours}</Text>
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