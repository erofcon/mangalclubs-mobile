import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Pressable,
    Text,
    useWindowDimensions,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
    BottomSheetFooter,
    type BottomSheetFooterProps,
    BottomSheetModal,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {Image} from "expo-image";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import type {Booking} from "@/types/booking";
import {themeColors} from "@/utils/theme-colors";

import {BOOKING_PHONE_FALLBACK} from "../booking.constants";
import styles from "../booking.styles";
import {
    getBookingImages,
    getCategoryTitle,
    getOrganization,
    getPhoneDigits,
    openExternalUrl,
} from "../booking.utils";
import {InfoRow} from "./InfoRow";

type BookingDetailsSheetProps = {
    booking: Booking | null;
    onDismiss: () => void;
};

export function BookingDetailsSheet({booking, onDismiss}: BookingDetailsSheetProps) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const {width} = useWindowDimensions();
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const snapPoints = useMemo(() => ["92%"], []);
    const images = useMemo(() => getBookingImages(booking), [booking]);
    const organization = useMemo(() => getOrganization(booking?.organizationId), [booking?.organizationId]);
    const imageHeight = Math.min(320, width * 0.78);

    useEffect(() => {
        if (booking) {
            setActiveImageIndex(0);
            sheetRef.current?.present();
        }
    }, [booking]);

    const handleDismiss = useCallback(() => {
        setActiveImageIndex(0);
        onDismiss();
    }, [onDismiss]);

    const handleGalleryScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setActiveImageIndex(nextIndex);
        },
        [width],
    );

    const handleCall = useCallback(() => {
        const phone = organization?.phone ?? BOOKING_PHONE_FALLBACK;
        const normalizedPhone = phone.replace(/[^\d+]/g, "");

        openExternalUrl(`tel:${normalizedPhone}`);
    }, [organization?.phone]);

    const handleWhatsApp = useCallback(() => {
        const phone = organization?.phone ?? BOOKING_PHONE_FALLBACK;
        const digits = getPhoneDigits(phone);
        const text = encodeURIComponent(`Здравствуйте! Хочу забронировать ${booking?.title ?? "зону"}.`);

        openExternalUrl(`whatsapp://send?phone=${digits}&text=${text}`, `https://wa.me/${digits}?text=${text}`);
    }, [booking?.title, organization?.phone]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.72}
                pressBehavior="close"
            />
        ),
        [],
    );

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => {
            if (!booking) {
                return null;
            }

            return (
                <BottomSheetFooter {...props} bottomInset={0}>
                    <View style={[styles.detailsFooter, {paddingBottom: insets.bottom + 12}]}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Позвонить для бронирования"
                            style={styles.reserveButton}
                            onPress={handleCall}
                        >
                            <Ionicons name="call" size={19} color={themeColors.textOnPrimary} />
                            <Text style={styles.reserveButtonText} numberOfLines={1}>
                                Забронировать
                            </Text>
                        </Pressable>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Написать в WhatsApp"
                            style={styles.whatsappButton}
                            onPress={handleWhatsApp}
                        >
                            <MaterialCommunityIcons name="whatsapp" size={21} color={themeColors.text} />
                            <Text style={styles.whatsappButtonText} numberOfLines={1}>
                                WhatsApp
                            </Text>
                        </Pressable>
                    </View>
                </BottomSheetFooter>
            );
        },
        [booking, handleCall, handleWhatsApp, insets.bottom],
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            footerComponent={renderFooter}
            handleIndicatorStyle={styles.detailsHandle}
            backgroundStyle={styles.detailsBackground}
            onDismiss={handleDismiss}
        >
            <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.detailsContent,
                    {paddingBottom: insets.bottom + 116},
                ]}
            >
                <View style={[styles.gallery, {height: imageHeight}]}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        onMomentumScrollEnd={handleGalleryScrollEnd}
                    >
                        {images.map((image, index) => (
                            <Image
                                key={`${booking?.id}-${index}`}
                                source={image}
                                style={[styles.galleryImage, {width}]}
                                contentFit="cover"
                            />
                        ))}
                    </ScrollView>

                    <View style={styles.galleryCounter}>
                        <Text style={styles.galleryCounterText}>
                            {activeImageIndex + 1}/{Math.max(images.length, 1)}
                        </Text>
                    </View>
                </View>

                {booking ? (
                    <View style={styles.detailsBody}>
                        <View style={styles.detailsMetaRow}>
                            <View style={styles.detailsMetaPill}>
                                <MaterialCommunityIcons
                                    name="storefront-outline"
                                    size={15}
                                    color={themeColors.primary}
                                />
                                <Text style={styles.detailsMetaText}>{organization.name}</Text>
                            </View>

                            <View style={styles.detailsMetaPill}>
                                <MaterialCommunityIcons
                                    name="calendar-check-outline"
                                    size={15}
                                    color={themeColors.primary}
                                />
                                <Text style={styles.detailsMetaText}>
                                    {getCategoryTitle(booking.categoryId)}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.detailsTitle}>{booking.title}</Text>

                        <Text style={styles.detailsDescription}>
                            {booking.longDescription ?? booking.description}
                        </Text>

                        <View style={styles.infoBlock}>
                            <InfoRow
                                icon="map-marker-outline"
                                label="Адрес"
                                value={`${organization.city}, ${organization.address}`}
                            />
                            <InfoRow icon="clock-outline" label="График" value={organization.schedule} />
                            <InfoRow icon="phone-outline" label="Телефон" value={organization.phone} />
                        </View>
                    </View>
                ) : null}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}
