import {Pressable, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";

import styles from "../order-type.styles";
import {MAX_SAVED_ADDRESSES} from "@/store/address-store";
import {themeColors} from "@/utils/theme-colors";

type Props = {
    canAddMoreAddresses: boolean;
};

export function AddAddressPanel({canAddMoreAddresses}: Props) {
    return (
        <View style={styles.panel}>
            <Pressable
                style={({pressed}) => [
                    styles.addButton,
                    !canAddMoreAddresses && styles.addButtonDisabled,
                    pressed && canAddMoreAddresses && styles.pressed,
                ]}
                onPress={() => {
                    if (canAddMoreAddresses) {
                        router.push("/delivery_address");
                    }
                }}
                disabled={!canAddMoreAddresses}
            >
                <Text style={[styles.addButtonText, !canAddMoreAddresses && styles.addButtonTextDisabled]}>
                    Добавить адрес
                </Text>
            </Pressable>

            {!canAddMoreAddresses ? (
                <Text style={styles.limitText}>Максимум {MAX_SAVED_ADDRESSES} адресов</Text>
            ) : null}
        </View>
    );
}