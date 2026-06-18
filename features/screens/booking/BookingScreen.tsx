import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ActivityIndicator, Text, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import Animated, {useAnimatedScrollHandler, useSharedValue} from "react-native-reanimated";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {Screen} from "@/components/ui/Screen";
import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {
    SelectionChipsSheet,
    type SelectionChipOption,
} from "@/components/ui/bottom-sheet/SelectionChipsSheet";
import {getBookingCategories, getBookings} from "@/services/bookings";
import {useAppDataStore} from "@/store/app-data-store";
import type {Booking, BookingCategory} from "@/types/booking";
import {themeColors} from "@/utils/theme-colors";

import styles from "./booking.styles";
import {BookingCard} from "./components/BookingCard";
import {BookingDetailsSheet} from "./components/BookingDetailsSheet";
import {BookingHero} from "./components/BookingHero";
import {FilterButton} from "./components/FilterButton";

export function BookingScreen() {
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);
    const categorySheetRef = useRef<AppBottomSheetRef>(null);
    const organizationSheetRef = useRef<AppBottomSheetRef>(null);
    const topInset = Math.max(insets.top, 0);
    const organizations = useAppDataStore((state) => state.organizations);
    const [categories, setCategories] = useState<BookingCategory[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    useEffect(() => {
        const controller = new AbortController();

        setIsLoading(true);
        setErrorMessage("");

        Promise.all([
            getBookingCategories(controller.signal),
            getBookings(controller.signal),
        ])
            .then(([nextCategories, nextBookings]) => {
                setCategories(nextCategories);
                setBookings(nextBookings);
            })
            .catch((error) => {
                if (controller.signal.aborted) {
                    return;
                }

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Не удалось загрузить бронирования",
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, []);

    const categoryOptions = useMemo<SelectionChipOption[]>(
        () => categories.map((category) => ({
            id: category.id,
            title: category.title,
        })),
        [categories],
    );

    const availableOrganizationIds = useMemo(
        () => new Set(bookings.map((booking) => booking.organizationId).filter(Boolean)),
        [bookings],
    );

    const organizationOptions = useMemo<SelectionChipOption[]>(
        () => {
            const optionsById = new Map<string, SelectionChipOption>();

            bookings.forEach((booking) => {
                if (booking.organizationId && booking.organization?.name) {
                    optionsById.set(booking.organizationId, {
                        id: booking.organizationId,
                        title: booking.organization.name,
                    });
                }
            });

            organizations
                .filter((organization) => availableOrganizationIds.has(organization.id))
                .forEach((organization) => {
                    optionsById.set(organization.id, {
                        id: organization.id,
                        title: organization.name,
                        description: `${organization.city}, ${organization.address}`,
                    });
                });

            return Array.from(optionsById.values());
        },
        [availableOrganizationIds, bookings, organizations],
    );

    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const categoryMatches = !selectedCategoryId || booking.categoryId === selectedCategoryId;
            const organizationMatches =
                !selectedOrganizationId || booking.organizationId === selectedOrganizationId;

            return categoryMatches && organizationMatches;
        });
    }, [bookings, selectedCategoryId, selectedOrganizationId]);

    const selectedCategoryTitle =
        categoryOptions.find((option) => option.id === selectedCategoryId)?.title ?? null;
    const selectedOrganizationTitle =
        organizationOptions.find((option) => option.id === selectedOrganizationId)?.title ?? null;

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
                        <BookingHero scrollY={scrollY} bookings={bookings} />

                        <View
                            style={[
                                styles.stickyFiltersWrapper,
                                {
                                    paddingTop: topInset,
                                    marginTop: -topInset,
                                },
                            ]}
                        >
                            <View style={styles.content}>
                                <View style={styles.filtersRow}>
                                    <FilterButton
                                        icon="filter-variant"
                                        label="Тип"
                                        value={selectedCategoryTitle}
                                        onPress={() => categorySheetRef.current?.open()}
                                    />

                                    <FilterButton
                                        icon="silverware-fork-knife"
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

                            {isLoading ? (
                                <View style={styles.bookingState}>
                                    <ActivityIndicator color={themeColors.primary} />
                                    <Text style={styles.bookingStateText}>Загружаем бронирования</Text>
                                </View>
                            ) : errorMessage ? (
                                <View style={styles.bookingState}>
                                    <Text style={styles.bookingStateText}>{errorMessage}</Text>
                                </View>
                            ) : filteredBookings.length === 0 ? (
                                <View style={styles.bookingState}>
                                    <Text style={styles.bookingStateText}>Бронирований пока нет</Text>
                                </View>
                            ) : (
                                <View style={styles.cardsList}>
                                    {filteredBookings.map((booking) => (
                                        <BookingCard
                                            key={booking.id}
                                            booking={booking}
                                            organizations={organizations}
                                            onPress={() => setSelectedBooking(booking)}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    </Animated.ScrollView>

                    <BookingDetailsSheet
                        booking={selectedBooking}
                        organizations={organizations}
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
