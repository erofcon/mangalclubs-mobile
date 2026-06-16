import {StyleSheet, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

import {
    DEFAULT_UNAVAILABLE_MESSAGE,
    getUnavailableOrganizations,
} from "@/services/availability";
import {useAppDataStore} from "@/store/app-data-store";
import {themeColors} from "@/utils/theme-colors";

export function OrderAvailabilityBar() {
    const organizations = useAppDataStore((state) => state.organizations);
    const availabilityByOrganizationId = useAppDataStore(
        (state) => state.availabilityByOrganizationId
    );
    const unavailableOrganizations = getUnavailableOrganizations(
        organizations,
        availabilityByOrganizationId
    );

    if (unavailableOrganizations.length === 0) {
        return null;
    }

    const isEveryOrganizationUnavailable =
        unavailableOrganizations.length === organizations.length;
    const unavailableNames = unavailableOrganizations
        .map((organization) => organization.name)
        .join(", ");
    const firstMessage = unavailableOrganizations
        .map((organization) => availabilityByOrganizationId[organization.id]?.message)
        .find(Boolean);
    const message = isEveryOrganizationUnavailable
        ? firstMessage || DEFAULT_UNAVAILABLE_MESSAGE
        : `Онлайн-заказы временно недоступны в ${unavailableNames}. В других ресторанах можно оформить заказ.`;

    return (
        <View style={styles.container}>
            <Ionicons
                name="warning-outline"
                size={16}
                color={themeColors.primary}
            />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 42,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(236,172,24,0.35)",
        backgroundColor: "#2a1c0a",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    text: {
        flex: 1,
        color: "#ffe5b0",
        fontSize: 12,
        lineHeight: 17,
        fontFamily: "Point-SemiBold",
    },
});
