import React, {
    forwardRef,
    ReactNode,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetView,
    } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import {themeColors} from "@/utils/theme-colors";

export type AppBottomSheetRef = {
    open: () => void;
    close: () => void;
    snapToIndex: (index: number) => void;
    expand: () => void;
    collapse: () => void;
};

type AppBottomSheetProps = {
    children: ReactNode;

    title?: string;
    rightSlot?: ReactNode;
    footer?: ReactNode;

    /**
     * Если не передать snapPoints, BottomSheet сам растянется по контенту.
     * Примеры: ["45%"], ["30%", "70%"], [320, "80%"]
     */
    snapPoints?: (string | number)[];

    /**
     * true = высота зависит от содержимого.
     * Если хочешь полностью ручную высоту через snapPoints, поставь false.
     */
    enableDynamicSizing?: boolean;

    /**
     * Ограничение максимальной высоты при enableDynamicSizing.
     * Удобно для корзины/списков.
     */
    maxDynamicContentSize?: number;

    /**
     * true = контент внутри скроллится.
     * Для длинной корзины лучше true.
     */
    scrollable?: boolean;

    initialIndex?: number;
    showCloseButton?: boolean;
    enablePanDownToClose?: boolean;

    containerStyle?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    footerContainerStyle?: StyleProp<ViewStyle>;

    onChange?: (index: number) => void;
    onDismiss?: () => void;
};

export const AppBottomSheetModal = forwardRef<AppBottomSheetRef, AppBottomSheetProps>(
    (
        {
            children,
            title,
            rightSlot,
            footer,
            snapPoints,
            enableDynamicSizing = true,
            maxDynamicContentSize,
            scrollable = false,
            initialIndex = 0,
            showCloseButton = false,
            enablePanDownToClose = true,
            containerStyle,
            contentContainerStyle,
            footerContainerStyle,
            onChange,
            onDismiss,
        },
        ref,
    ) => {
        const bottomSheetRef = useRef<BottomSheetModal>(null);

        const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

        const open = useCallback(() => {
            bottomSheetRef.current?.present();
        }, []);

        const close = useCallback(() => {
            bottomSheetRef.current?.dismiss();
        }, []);

        useImperativeHandle(
            ref,
            () => ({
                open,
                close,
                snapToIndex: (index: number) => {
                    bottomSheetRef.current?.snapToIndex(index);
                },
                expand: () => {
                    bottomSheetRef.current?.expand();
                },
                collapse: () => {
                    bottomSheetRef.current?.collapse();
                },
            }),
            [open, close],
        );

        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.55}
                    pressBehavior="close"
                />
            ),
            [],
        );

        const hasHeader = Boolean(title || rightSlot || showCloseButton);

        const ContentComponent = scrollable ? BottomSheetScrollView : BottomSheetView;

        return (
            <BottomSheetModal
                ref={bottomSheetRef}
                index={initialIndex}
                snapPoints={memoizedSnapPoints}
                enableDynamicSizing={enableDynamicSizing}
                maxDynamicContentSize={maxDynamicContentSize}
                enablePanDownToClose={enablePanDownToClose}
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.background}
                handleIndicatorStyle={styles.handleIndicator}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                android_keyboardInputMode="adjustResize"
                onChange={onChange}
                onDismiss={onDismiss}
            >
                <ContentComponent
                    style={[styles.container, containerStyle]}
                    contentContainerStyle={[
                        scrollable && styles.scrollContent,
                        contentContainerStyle,
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {hasHeader && (
                        <View style={styles.header}>
                            <View style={styles.titleWrap}>
                                {title ? (
                                    <Text style={styles.title} numberOfLines={1}>
                                        {title}
                                    </Text>
                                ) : null}
                            </View>

                            {rightSlot}

                            {showCloseButton && (
                                <Pressable
                                    onPress={close}
                                    style={styles.closeButton}
                                    hitSlop={10}
                                >
                                    <Ionicons
                                        name="close"
                                        size={22}
                                        color={themeColors.text}
                                    />
                                </Pressable>
                            )}
                        </View>
                    )}

                    <View style={styles.body}>
                        {children}
                    </View>

                    {footer ? (
                        <View style={[styles.footer, footerContainerStyle]}>
                            {footer}
                        </View>
                    ) : null}
                </ContentComponent>
            </BottomSheetModal>
        );
    },
);

AppBottomSheetModal.displayName = "AppBottomSheet";

const styles = StyleSheet.create({
    background: {
        backgroundColor: themeColors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    handleIndicator: {
        width: 42,
        height: 4,
        borderRadius: 999,
        backgroundColor: themeColors.border,
    },

    container: {
        backgroundColor: themeColors.card,
    },

    scrollContent: {
        paddingBottom: 8,
    },

    header: {
        minHeight: 52,
        paddingHorizontal: 16,
        paddingBottom: 8,

        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    titleWrap: {
        flex: 1,
        minWidth: 0,
    },

    title: {
        color: themeColors.text,
        fontSize: 20,
        fontFamily: "Point-Bold",
    },

    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: themeColors.cardSecondary,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    body: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },

    footer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,

        borderTopWidth: 1,
        borderTopColor: themeColors.cardBorder,
    },
});
