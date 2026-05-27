import React, {forwardRef, useCallback, useMemo} from "react";
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

export const AddressBottomSheet = forwardRef<BottomSheetModal, any>(
    function AddressBottomSheet(_, ref) {

        const renderFooter = useCallback(
            (props: BottomSheetFooterProps) => (
                <BottomSheetFooter {...props} bottomInset={24}>
                    <View style={styles.footerContainer}>
                        <Pressable style={styles.button}>
                            <Text style={styles.buttonText}>
                                Сохранить адрес
                            </Text>
                        </Pressable>
                    </View>
                </BottomSheetFooter>
            ),
            []
        );

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={["30%"]}
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
                        <Text style={styles.descriptionText}>Нажмите для ручного ввода адреса</Text>
                        <Text style={styles.addressText} numberOfLines={2}>с. Псыгансу, ул. Бекалдиева, дом 16</Text>
                    </View>

                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

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
    },

    text: {
        color: "#111",
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
        fontFamily:"Point-Bold",
    },
    addressContainer:{
        flex:1,
        gap:4,
        backgroundColor: themeColors.card,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        borderColor: themeColors.border,
        borderWidth:1,
    },
    descriptionText: {
        color: themeColors.textSecondary,
        fontFamily:"Point-Regular",
        letterSpacing:-0.5,
        fontSize:14,
    },
    addressText:{
        color: themeColors.text,
        fontSize:16,
        fontFamily:"Point-SemiBold",
        letterSpacing:-0.5,
    }
});