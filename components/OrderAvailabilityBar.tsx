import {useEffect} from "react";
import {StyleSheet, Text, View, type LayoutChangeEvent} from "react-native";
import {Ionicons} from "@expo/vector-icons";

import {
    DEFAULT_UNAVAILABLE_MESSAGE,
    getUnavailableOrganizations,
} from "@/services/availability";
import {useAppDataStore} from "@/store/app-data-store";
import {themeColors} from "@/utils/theme-colors";

type Props = {
    topInset?: number;
    onHeightChange?: (height: number) => void;
};

export function OrderAvailabilityBar({topInset = 0, onHeightChange}: Props) {
    const organizations = useAppDataStore((state) => state.organizations);
    const availabilityByOrganizationId = useAppDataStore(
        (state) => state.availabilityByOrganizationId
    );
    const unavailableOrganizations = getUnavailableOrganizations(
        organizations,
        availabilityByOrganizationId
    );

    useEffect(() => {
        if (unavailableOrganizations.length === 0) {
            onHeightChange?.(0);
        }
    }, [onHeightChange, unavailableOrganizations.length]);

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

    const handleLayout = (event: LayoutChangeEvent) => {
        onHeightChange?.(event.nativeEvent.layout.height);
    };

    return (
        <View
            style={[
                styles.container,
                topInset > 0 && {paddingTop: topInset + 8},
            ]}
            onLayout={handleLayout}
        >
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
