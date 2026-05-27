import React, {useState} from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {Screen} from "@/components/ui/Screen";
import {SHADOW, themeColors} from "@/utils/theme-colors";
import {router, useLocalSearchParams} from "expo-router";

type OrderType = "delivery" | "takeaway";


export function OrderTypeScreen() {
    const params = useLocalSearchParams<{
        type?: OrderType;
    }>();

    const initialTab: OrderType =
        params.type === "takeaway"
            ? "takeaway"
            : "delivery";

    const [activeTab, setActiveTab] =
        useState<OrderType>(initialTab);


    return (
        <Screen withTopInset>
            <View style={styles.header}>
                <View style={styles.segment}>
                    <Pressable
                        onPress={() => setActiveTab("delivery")}
                        style={[
                            styles.segmentButton,
                            activeTab === "delivery" &&
                            styles.segmentButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                activeTab === "delivery" &&
                                styles.segmentTextActive,
                            ]}
                        >
                            Доставка
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("takeaway")}
                        style={[
                            styles.segmentButton,
                            activeTab === "takeaway" &&
                            styles.segmentButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                activeTab === "takeaway" &&
                                styles.segmentTextActive,
                            ]}
                        >
                            Навынос
                        </Text>
                    </Pressable>
                </View>
            </View>

            {activeTab === "delivery" ? (
                <View style={styles.contentContainer}>

                    <View style={styles.centerContent}>
                        <Text style={styles.addressText}>
                            Add address here
                        </Text>
                    </View>

                    <Pressable style={styles.addressButton}
                               onPress={() => router.push("/delivery_address")}
                    >
                        <Text style={styles.addressButtonText}>
                            Добавить адрес
                        </Text>
                    </Pressable>

                </View>
            ) : (
                <View/>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.background,
    },

    header: {
        paddingTop: 16,
        alignItems: "center",
    },

    segment: {
        flexDirection: "row",
        backgroundColor: themeColors.card,
        borderRadius: 10,
        padding: 3,
        maxWidth: 300,
    },

    segmentButton: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    segmentButtonActive: {
        backgroundColor: themeColors.text,
        ...SHADOW
    },

    segmentText: {
        fontSize: 15,
        fontWeight: "600",
        color: themeColors.textSecondary,
    },

    segmentTextActive: {
        color: themeColors.textOnPrimary,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "space-between",
        padding: 24,
    },

    centerContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    addressText: {
        fontSize: 20,
        fontWeight: "600",
        color: themeColors.text,
    },

    addressButton: {
        height: 56,
        borderRadius: 18,
        backgroundColor: themeColors.primary,
        alignItems: "center",
        justifyContent: "center",
    },

    addressButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: themeColors.textOnPrimary,
    },
});