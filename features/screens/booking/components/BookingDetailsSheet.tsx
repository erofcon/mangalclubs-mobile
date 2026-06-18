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
import type {Organization} from "@/types/organization";
import {themeColors} from "@/utils/theme-colors";

import styles from "../booking.styles";
import {
    getBookingImages,
    getBookingOrganizationName,
    getBookingOrganizationPhone,
    getBookingOrganizationWhatsAppPhone,
    getCategoryTitle,
    getOrganization,
    getPhoneDigits,
    openExternalUrl,
} from "../booking.utils";
import {InfoRow} from "./InfoRow";

type BookingDetailsSheetProps = {
    booking: Booking | null;
    organizations: Organization[];
    onDismiss: () => void;
};

export function BookingDetailsSheet({
    booking,
    organizations,
    onDismiss,
}: BookingDetailsSheetProps) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const {width} = useWindowDimensions();
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const snapPoints = useMemo(() => ["92%"], []);
    const images = useMemo(() => getBookingImages(booking), [booking]);
    const organization = useMemo(
        () => getOrganization(organizations, booking?.organizationId),
        [booking?.organizationId, organizations],
    );
    const organizationName = booking ? getBookingOrganizationName(booking, organization) : "";
    const organizationPhone = booking ? getBookingOrganizationPhone(booking, organization) : "";
    const organizationWhatsAppPhone = booking
        ? getBookingOrganizationWhatsAppPhone(booking, organization)
        : "";
    const callPhone = organizationPhone;
    const whatsAppPhone = organizationWhatsAppPhone || organizationPhone;
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
        const normalizedPhone = callPhone.replace(/[^\d+]/g, "");

        openExternalUrl(`tel:${normalizedPhone}`);
    }, [callPhone]);

    const handleWhatsApp = useCallback(() => {
        const digits = getPhoneDigits(whatsAppPhone);
        const text = encodeURIComponent(`Здравствуйте! Хочу забронировать ${booking?.title ?? "зону"}.`);

        openExternalUrl(
            `whatsapp://send?phone=${digits}&text=${text}`,
            `https://wa.me/${digits}?text=${text}`,
        );
    }, [booking?.title, whatsAppPhone]);

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
            if (!booking || (!callPhone && !whatsAppPhone)) {
                return null;
            }

            return (
                <BottomSheetFooter {...props} bottomInset={0}>
                    <View style={[styles.detailsFooter, {paddingBottom: insets.bottom + 12}]}>
                        {callPhone ? (
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
                        ) : null}

                        {whatsAppPhone ? (
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
                        ) : null}
                    </View>
                </BottomSheetFooter>
            );
        },
        [booking, callPhone, handleCall, handleWhatsApp, insets.bottom, whatsAppPhone],
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
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <Image
                                    key={`${booking?.id}-${index}`}
                                    source={image}
                                    style={[styles.galleryImage, {width}]}
                                    contentFit="cover"
                                />
                            ))
                        ) : (
                            <View style={[styles.galleryPlaceholder, {width}]}>
                                <Ionicons
                                    name="image-outline"
                                    size={38}
                                    color={themeColors.textSecondary}
                                />
                            </View>
                        )}
                    </ScrollView>

                    {images.length > 0 ? (
                        <View style={styles.galleryCounter}>
                            <Text style={styles.galleryCounterText}>
                                {activeImageIndex + 1}/{images.length}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {booking ? (
                    <View style={styles.detailsBody}>
                        <View style={styles.detailsMetaRow}>
                            <View style={styles.detailsMetaPill}>
                                <Text style={styles.detailsMetaText}>{organizationName}</Text>
                            </View>

                            <View style={styles.detailsMetaPill}>
                                <Text style={styles.detailsMetaText}>
                                    {getCategoryTitle(booking)}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.detailsTitle}>{booking.title}</Text>

                        <Text style={styles.detailsDescription}>
                            {booking.longDescription ?? booking.description}
                        </Text>

                        <View style={styles.infoBlock}>
                            {organization ? (
                                <InfoRow
                                    icon="map-marker-outline"
                                    label="Адрес"
                                    value={`${organization.city}, ${organization.address}`}
                                />
                            ) : null}
                            {organization?.schedule ? (
                                <InfoRow
                                    icon="clock-outline"
                                    label="График"
                                    value={organization.scheduleLines?.length ? organization.scheduleLines : organization.schedule}
                                />
                            ) : null}
                            {callPhone ? (
                                <InfoRow icon="phone-outline" label="Телефон" value={callPhone} />
                            ) : null}
                        </View>
                    </View>
                ) : null}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}
