import React, {forwardRef, useCallback} from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import BottomSheetModal, {
    BottomSheetFooter,
    BottomSheetView,
    type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";

import {themeColors} from "@/utils/theme-colors";

type Props = {
    addressText: string;
    locationStatusText: string;
    onSavePress?: () => void;
};

export const AddressBottomSheet = forwardRef<
    React.ElementRef<typeof BottomSheetModal>,
    Props
>(function AddressBottomSheet(
    {addressText, locationStatusText, onSavePress},
    ref
) {
    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => (
            <BottomSheetFooter {...props} bottomInset={24}>
                <View style={styles.footerContainer}>
                    <Pressable style={styles.button} onPress={onSavePress}>
                        <Text style={styles.buttonText}>
                            Сохранить адрес
                        </Text>
                    </Pressable>
                </View>
            </BottomSheetFooter>
        ),
        [onSavePress]
    );

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={["32%"]}
            index={1}
            enablePanDownToClose={false}
            enableHandlePanningGesture={false}
            enableContentPanningGesture={false}
            footerComponent={renderFooter}
            backgroundStyle={styles.background}
            handleIndicatorStyle={styles.handle}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.addressContainer}>
                    <Text style={styles.descriptionText}>
                        Нажмите для ручного ввода адреса
                    </Text>

                    <Text style={styles.addressText} numberOfLines={2}>
                        {addressText}
                    </Text>
                </View>

                <Text style={styles.searchStatusText} numberOfLines={2}>
                    {locationStatusText}
                </Text>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    background: {
        backgroundColor: themeColors.background,
    },
    handle: {
        backgroundColor: themeColors.text,
    },
    contentContainer: {
        flex: 1,
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
    searchStatusText: {
        color: themeColors.textSecondary,
        fontFamily: "Point-Regular",
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: -0.3,
        paddingHorizontal: 4,
    },
});