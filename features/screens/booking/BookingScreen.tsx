import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";
import {
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
    BottomSheetFooter,
    type BottomSheetFooterProps,
    BottomSheetModal,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {StatusBar} from "expo-status-bar";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import Animated, {
    Extrapolation,
    interpolate,
    type SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {Screen} from "@/components/ui/Screen";
import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {
    SelectionChipsSheet,
    type SelectionChipOption,
} from "@/components/ui/bottom-sheet/SelectionChipsSheet";
import {BookingCategories, BookingMocks, Organizations} from "@/mocks/mocks-data";
import type {Booking} from "@/types/booking";
import type {Organization} from "@/types/organization";
import {SHADOW, themeColors} from "@/utils/theme-colors";

const HERO_HEIGHT = 320;
const BOOKING_PHONE_FALLBACK = "+7 (928) 340-50-50";

const bookingImageMap: Record<string, number> = {
    "@/assets/booking/609686908_18097555516907715_1890579568138563188_n..jpg": require("@/assets/mocks/booking/609686908_18097555516907715_1890579568138563188_n..jpg"),
    "@/assets/booking/609720157_18097555507907715_5416527739075581508_n..jpg": require("@/assets/mocks/booking/609720157_18097555507907715_5416527739075581508_n..jpg"),
    "@/assets/booking/609982327_18097555342907715_1986147056012483252_n..jpg": require("@/assets/mocks/booking/609982327_18097555342907715_1986147056012483252_n..jpg"),
    "@/assets/booking/610002010_18097554682907715_6683000151825881101_n..jpg": require("@/assets/mocks/booking/610002010_18097554682907715_6683000151825881101_n..jpg"),
    "@/assets/booking/610633596_18097555435907715_5781624860738448425_n..jpg": require("@/assets/mocks/booking/610633596_18097555435907715_5781624860738448425_n..jpg"),
    "@/assets/booking/610683031_18097554145907715_1235544446749212874_n..jpg": require("@/assets/mocks/booking/610683031_18097554145907715_1235544446749212874_n..jpg"),
    "@/assets/booking/611264128_18097554673907715_2049357468313814860_n..jpg": require("@/assets/mocks/booking/611264128_18097554673907715_2049357468313814860_n..jpg"),
};

function getBookingImageSource(path?: string) {
    if (!path) {
        return bookingImageMap["@/assets/booking/609686908_18097555516907715_1890579568138563188_n..jpg"];
    }

    return (
        bookingImageMap[path] ??
        bookingImageMap["@/assets/booking/609686908_18097555516907715_1890579568138563188_n..jpg"]
    );
}

function getBookingImages(booking: Booking | null) {
    if (!booking) {
        return [];
    }

    const paths = [booking.image, ...(booking.images ?? [])].filter(Boolean) as string[];
    const uniquePaths = Array.from(new Set(paths));

    return uniquePaths.map(getBookingImageSource);
}

function getOrganization(organizationId?: Organization["id"]) {
    return Organizations.find((organization) => organization.id === organizationId) ?? Organizations[0];
}

function getCategoryTitle(categoryId?: string) {
    return BookingCategories.find((category) => category.id === categoryId)?.title ?? "Бронирование";
}

function getPhoneDigits(phone: string) {
    return phone.replace(/\D/g, "");
}

async function openExternalUrl(url: string, fallbackUrl?: string) {
    try {
        const canOpen = await Linking.canOpenURL(url);
        await Linking.openURL(canOpen ? url : fallbackUrl ?? url);
    } catch {
        if (fallbackUrl) {
            await Linking.openURL(fallbackUrl);
        }
    }
}

export function BookingScreen() {
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);
    const categorySheetRef = useRef<AppBottomSheetRef>(null);
    const organizationSheetRef = useRef<AppBottomSheetRef>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const categoryOptions = useMemo<SelectionChipOption[]>(
        () => BookingCategories,
        [],
    );

    const organizationOptions = useMemo<SelectionChipOption[]>(
        () =>
            Organizations.map((organization) => ({
                id: organization.id,
                title: organization.name,
                description: `${organization.city}, ${organization.address}`,
            })),
        [],
    );

    const filteredBookings = useMemo(() => {
        return BookingMocks.filter((booking) => {
            const categoryMatches = !selectedCategoryId || booking.categoryId === selectedCategoryId;
            const organizationMatches =
                !selectedOrganizationId || booking.organizationId === selectedOrganizationId;

            return categoryMatches && organizationMatches;
        });
    }, [selectedCategoryId, selectedOrganizationId]);

    const selectedCategoryTitle =
        categoryOptions.find((option) => option.id === selectedCategoryId)?.title ?? "Тип";
    const selectedOrganizationTitle =
        organizationOptions.find((option) => option.id === selectedOrganizationId)?.title ?? "Ресторан";

    const handleSelectCategory = useCallback((categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
        categorySheetRef.current?.close();
    }, []);

    const handleSelectOrganization = useCallback((organizationId: string | null) => {
        setSelectedOrganizationId(organizationId);
        organizationSheetRef.current?.close();
    }, []);

    return (
        <>
            <StatusBar style="light" />

            <Screen>
                <View style={styles.root}>
                    <Animated.ScrollView
                        style={styles.scroll}
                        contentContainerStyle={{paddingBottom: insets.bottom + 104}}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={scrollHandler}
                        stickyHeaderIndices={[1]}
                    >
                        <BookingHero scrollY={scrollY} />

                        <View style={styles.stickyFiltersWrapper}>
                            <View style={styles.content}>
                                <View style={styles.filtersRow}>
                                    <FilterButton
                                        icon="tune-variant"
                                        label="Тип"
                                        value={selectedCategoryTitle}
                                        onPress={() => categorySheetRef.current?.open()}
                                    />

                                    <FilterButton
                                        icon="storefront-outline"
                                        label="Ресторан"
                                        value={selectedOrganizationTitle}
                                        onPress={() => organizationSheetRef.current?.open()}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Кабинки и зоны</Text>
                                <Text style={styles.sectionCount}>{filteredBookings.length}</Text>
                            </View>

                            <View style={styles.cardsList}>
                                {filteredBookings.map((booking) => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onPress={() => setSelectedBooking(booking)}
                                    />
                                ))}
                            </View>
                        </View>
                    </Animated.ScrollView>

                    <BookingDetailsSheet
                        booking={selectedBooking}
                        onDismiss={() => setSelectedBooking(null)}
                    />

                    <SelectionChipsSheet
                        ref={categorySheetRef}
                        title="Тип бронирования"
                        options={categoryOptions}
                        activeOptionId={selectedCategoryId}
                        onSelectOption={handleSelectCategory}
                        snapPoints={["48%"]}
                    />

                    <SelectionChipsSheet
                        ref={organizationSheetRef}
                        title="Рестораны"
                        options={organizationOptions}
                        activeOptionId={selectedOrganizationId}
                        onSelectOption={handleSelectOrganization}
                        snapPoints={["42%"]}
                    />
                </View>
            </Screen>
        </>
    );
}

function BookingHero({scrollY}: {scrollY: SharedValue<number>}) {
    const imageStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HERO_HEIGHT * 0.6, HERO_HEIGHT],
            [1, 0.5, 0],
            Extrapolation.CLAMP,
        );
        const scale = interpolate(scrollY.value, [0, HERO_HEIGHT], [1, 1.08], Extrapolation.CLAMP);

        return {
            opacity,
            transform: [{scale}],
        };
    });

    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, HERO_HEIGHT * 0.45], [1, 0], Extrapolation.CLAMP);
        const translateY = interpolate(scrollY.value, [0, HERO_HEIGHT], [0, -32], Extrapolation.CLAMP);

        return {
            opacity,
            transform: [{translateY}],
        };
    });

    return (
        <View style={styles.hero}>
            <Animated.View style={[styles.heroImageLayer, imageStyle]}>
                <Image
                    source={require("@/assets/mocks/booking/610633596_18097555435907715_5781624860738448425_n..jpg")}
                    style={styles.heroImage}
                    contentFit="cover"
                />

                <View style={styles.heroOverlay} />

                <LinearGradient
                    colors={[themeColors.background, "transparent"]}
                    style={styles.heroTopGradient}
                />

                <LinearGradient
                    colors={["transparent", themeColors.background]}
                    style={styles.heroBottomGradient}
                />
            </Animated.View>

            <Animated.View style={[styles.heroContent, contentStyle]}>
                <View style={styles.heroPill}>
                    <MaterialCommunityIcons name="calendar-clock" size={15} color={themeColors.primary} />
                    <Text style={styles.heroPillText}>Бронирование</Text>
                </View>

                <Text style={styles.heroTitle}>Приватные зоны Mangal Clubs</Text>

                <Text style={styles.heroSubtitle} numberOfLines={2}>
                    Выберите кабинку, сауну или столик и свяжитесь с рестораном удобным способом.
                </Text>
            </Animated.View>
        </View>
    );
}

function FilterButton({
                          icon,
                          label,
                          value,
                          onPress,
                      }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value}`}
            style={styles.filterButton}
            onPress={onPress}
        >
            <View style={styles.filterIconWrap}>
                <MaterialCommunityIcons name={icon} size={20} color={themeColors.primary} />
            </View>

            <View style={styles.filterTextWrap}>
                <Text style={styles.filterLabel}>{label}</Text>
                <Text style={styles.filterValue} numberOfLines={1}>
                    {value}
                </Text>
            </View>

            <Ionicons name="chevron-down" size={16} color={themeColors.textSecondary} />
        </Pressable>
    );
}

function BookingCard({booking, onPress}: {booking: Booking; onPress: () => void}) {
    const organization = getOrganization(booking.organizationId);
    const categoryTitle = getCategoryTitle(booking.categoryId);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={booking.title}
            style={styles.bookingCard}
            onPress={onPress}
        >
            <Image
                source={getBookingImageSource(booking.image)}
                style={styles.cardImage}
                contentFit="cover"
            />

            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.86)"]}
                style={styles.cardGradient}
            />

            <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                    <View style={styles.cardPill}>
                        <Text style={styles.cardPillText} numberOfLines={1}>
                            {categoryTitle}
                        </Text>
                    </View>

                    <View style={styles.cardPillMuted}>
                        <MaterialCommunityIcons name="map-marker" size={13} color={themeColors.text} />
                        <Text style={styles.cardPillMutedText} numberOfLines={1}>
                            {organization.name}
                        </Text>
                    </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                    {booking.title}
                </Text>

                <Text style={styles.cardDescription} numberOfLines={2}>
                    {booking.description}
                </Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>Бронь по звонку</Text>
                    <Ionicons name="arrow-forward" size={17} color={themeColors.primary} />
                </View>
            </View>
        </Pressable>
    );
}

function BookingDetailsSheet({
                                 booking,
                                 onDismiss,
                             }: {
    booking: Booking | null;
    onDismiss: () => void;
}) {
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

function InfoRow({
                     icon,
                     label,
                     value,
                 }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <MaterialCommunityIcons name={icon} size={18} color={themeColors.primary} />
            </View>

            <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    scroll: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    hero: {
        height: HERO_HEIGHT,
        position: "relative",
        backgroundColor: themeColors.background,
    },
    heroImageLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.42)",
    },
    heroTopGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    heroBottomGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 184,
    },
    heroContent: {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 54,
    },
    heroPill: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        backgroundColor: "rgba(7,8,8,0.62)",
    },
    heroPillText: {
        color: themeColors.text,
        fontSize: 12,
        fontFamily: "Point-SemiBold",
    },
    heroTitle: {
        marginTop: 9,
        color: themeColors.primary,
        fontSize: 22,
        lineHeight: 27,
        fontFamily: "Point-Black",
    },
    heroSubtitle: {
        marginTop: 8,
        maxWidth: 360,
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: "Point-Regular",
    },

    stickyFiltersWrapper: {
        zIndex: 20,
        backgroundColor: themeColors.background,
    },
    content: {
        marginTop: -34,
        paddingHorizontal: 12,
        backgroundColor: themeColors.background,
    },
    filtersRow: {
        flexDirection: "row",
        gap: 8,
        paddingBottom: 18,
    },
    filterButton: {
        flex: 1,
        minWidth: 0,
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "#151411",
    },
    filterIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(236,172,24,0.12)",
    },
    filterTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    filterLabel: {
        color: themeColors.textSecondary,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: "Point-Regular",
    },
    filterValue: {
        marginTop: 2,
        color: themeColors.text,
        fontSize: 13,
        lineHeight: 16,
        fontFamily: "Point-SemiBold",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 2,
        marginBottom: 12,
    },
    sectionTitle: {
        color: themeColors.text,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: "Point-Bold",
    },
    sectionCount: {
        minWidth: 28,
        height: 28,
        borderRadius: 8,
        overflow: "hidden",
        textAlign: "center",
        textAlignVertical: "center",
        color: themeColors.textOnPrimary,
        fontSize: 13,
        lineHeight: 28,
        fontFamily: "Point-Bold",
        backgroundColor: themeColors.primary,
    },
    cardsList: {
        gap: 14,
    },
    bookingCard: {
        height: 220,
        overflow: "hidden",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: themeColors.card,
        ...SHADOW,
    },
    cardImage: {
        ...StyleSheet.absoluteFillObject,
    },
    cardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    cardContent: {
        flex: 1,
        justifyContent: "space-between",
        padding: 12,
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    cardPill: {
        maxWidth: "58%",
        minHeight: 28,
        justifyContent: "center",
        paddingHorizontal: 9,
        borderRadius: 7,
        backgroundColor: themeColors.primary,
    },
    cardPillText: {
        color: themeColors.textOnPrimary,
        fontSize: 12,
        lineHeight: 15,
        fontFamily: "Point-Bold",
    },
    cardPillMuted: {
        flex: 1,
        minWidth: 0,
        minHeight: 28,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(7,8,8,0.56)",
    },
    cardPillMutedText: {
        flex: 1,
        minWidth: 0,
        color: themeColors.text,
        fontSize: 12,
        lineHeight: 15,
        fontFamily: "Point-SemiBold",
    },
    cardTitle: {
        marginTop: "auto",
        color: themeColors.text,
        fontSize: 23,
        lineHeight: 28,
        fontFamily: "Point-Bold",
    },
    cardDescription: {
        marginTop: 7,
        color: "rgba(255,255,255,0.78)",
        fontSize: 14,
        lineHeight: 19,
        fontFamily: "Point-Regular",
    },
    cardFooter: {
        marginTop: 13,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardFooterText: {
        color: themeColors.primary,
        fontSize: 13,
        lineHeight: 16,
        fontFamily: "Point-Bold",
    },
    detailsBackground: {
        backgroundColor: themeColors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    detailsHandle: {
        width: 42,
        height: 4,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.22)",
    },
    detailsContent: {
        backgroundColor: themeColors.background,
    },
    gallery: {
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#11110f",
    },
    galleryImage: {
        height: "100%",
    },
    galleryCounter: {
        position: "absolute",
        right: 14,
        bottom: 14,
        minWidth: 48,
        minHeight: 28,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        borderRadius: 7,
        backgroundColor: "rgba(7,8,8,0.72)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    galleryCounterText: {
        color: themeColors.text,
        fontSize: 12,
        lineHeight: 15,
        fontFamily: "Point-SemiBold",
    },
    detailsBody: {
        paddingHorizontal: 14,
        paddingTop: 18,
    },
    detailsMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    detailsMetaPill: {
        minHeight: 32,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },
    detailsMetaText: {
        color: themeColors.text,
        fontSize: 12,
        lineHeight: 15,
        fontFamily: "Point-SemiBold",
    },
    detailsTitle: {
        marginTop: 18,
        color: themeColors.text,
        fontSize: 24,
        lineHeight: 29,
        fontFamily: "Point-Bold",
    },
    detailsDescription: {
        marginTop: 12,
        color: themeColors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
        fontFamily: "Point-Regular",
    },
    infoBlock: {
        marginTop: 20,
        overflow: "hidden",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        backgroundColor: themeColors.card,
    },
    infoRow: {
        minHeight: 64,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.cardBorder,
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(236,172,24,0.10)",
    },
    infoTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    infoLabel: {
        color: themeColors.textSecondary,
        fontSize: 12,
        lineHeight: 15,
        fontFamily: "Point-Regular",
    },
    infoValue: {
        marginTop: 2,
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 18,
        fontFamily: "Point-SemiBold",
    },
    detailsFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingTop: 12,
        paddingHorizontal: 14,
        backgroundColor: themeColors.background,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
    },
    reserveButton: {
        flex: 1.15,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: themeColors.primary,
    },
    reserveButtonText: {
        color: themeColors.textOnPrimary,
        fontSize: 14,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },
    whatsappButton: {
        flex: 0.85,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "#1f7a45",
    },
    whatsappButtonText: {
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },
});