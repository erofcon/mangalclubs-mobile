import React, {forwardRef, useCallback} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";

import BottomSheet, {
    BottomSheetFooter,
    BottomSheetScrollView,
    type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {themeColors} from "@/utils/theme-colors";

export const ADDRESS_SHEET_SNAP_POINT = "42%";
const FOOTER_BUTTON_HEIGHT = 56;
const FOOTER_VERTICAL_SPACE = 24;

type Props = {
    addressText: string;
    deliveryPriceText?: string;
    locationStatusText: string;
    locationStatusTone?: "default" | "error";
    canSave?: boolean;
    onSavePress?: () => void;
};

export const AddressBottomSheet = forwardRef<
    React.ElementRef<typeof BottomSheet>,
    Props
>(function AddressBottomSheet(
    {
        addressText,
        deliveryPriceText,
        locationStatusText,
        locationStatusTone = "default",
        canSave = true,
        onSavePress,
    },
    ref
) {
    const insets = useSafeAreaInsets();
    const footerBottomInset = Math.max(insets.bottom, 12);
    const scrollBottomPadding =
        FOOTER_BUTTON_HEIGHT + FOOTER_VERTICAL_SPACE + footerBottomInset;

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => (
            <BottomSheetFooter {...props} bottomInset={footerBottomInset}>
                <View style={styles.footerContainer}>
                    <Pressable
                        style={[styles.button, !canSave && styles.buttonDisabled]}
                        onPress={onSavePress}
                        disabled={!canSave}
                    >
                        <Text style={styles.buttonText}>Сохранить адрес</Text>
                    </Pressable>
                </View>
            </BottomSheetFooter>
        ),
        [canSave, footerBottomInset, onSavePress]
    );

    return (
        <BottomSheet
            ref={ref}
            snapPoints={[ADDRESS_SHEET_SNAP_POINT]}
            index={0}
            enablePanDownToClose={false}
            enableHandlePanningGesture={false}
            footerComponent={renderFooter}
            backgroundStyle={styles.background}
            handleIndicatorStyle={styles.handle}
        >
            <BottomSheetScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.contentContainer,
                    {paddingBottom: scrollBottomPadding},
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.addressContainer}>
                    <Text style={styles.descriptionText}>
                        Переместите карту, чтобы уточнить адрес
                    </Text>

                    <Text style={styles.addressText}>
                        {addressText || "Адрес пока не определен"}
                    </Text>
                </View>

                {deliveryPriceText ? (
                    <Text style={styles.deliveryPriceText}>
                        {deliveryPriceText}
                    </Text>
                ) : null}

                {locationStatusText ? (
                    <Text
                        style={[
                            styles.searchStatusText,
                            locationStatusTone === "error" &&
                            styles.searchStatusTextError,
                        ]}
                    >
                        {locationStatusText}
                    </Text>
                ) : null}
            </BottomSheetScrollView>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    background: {
        backgroundColor: themeColors.background,
    },
    handle: {
        backgroundColor: themeColors.background,
    },
    scroll: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 12,
    },
    footerContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        backgroundColor: themeColors.background,
    },
    button: {
        height: 56,
        borderRadius: 18,
        backgroundColor: themeColors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDisabled: {
        opacity: 0.55,
    },
    buttonText: {
        color: themeColors.textOnPrimary,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },
    addressContainer: {
        gap: 4,
        backgroundColor: themeColors.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderColor: themeColors.border,
        borderWidth: 1,
    },
    descriptionText: {
        color: themeColors.textSecondary,
        fontFamily: "Point-Regular",
        letterSpacing: -0.5,
        fontSize: 14,
    },
    addressText: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-SemiBold",
        letterSpacing: -0.5,
    },
    deliveryPriceText: {
        color: themeColors.primary,
        fontFamily: "Point-SemiBold",
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: -0.2,
        paddingHorizontal: 4,
    },
    searchStatusText: {
        color: themeColors.textSecondary,
        fontFamily: "Point-Regular",
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: -0.3,
        paddingHorizontal: 4,
    },
    searchStatusTextError: {
        color: themeColors.notification,
    },
});
