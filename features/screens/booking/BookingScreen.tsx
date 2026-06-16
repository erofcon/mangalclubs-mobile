import {useCallback, useMemo, useRef, useState} from "react";
import {Text, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import Animated, {useAnimatedScrollHandler, useSharedValue} from "react-native-reanimated";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {Screen} from "@/components/ui/Screen";
import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {
    SelectionChipsSheet,
    type SelectionChipOption,
} from "@/components/ui/bottom-sheet/SelectionChipsSheet";
import {BookingCategories, BookingMocks, Organizations} from "@/mocks/mocks-data";
import type {Booking} from "@/types/booking";

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
                        <BookingHero scrollY={scrollY} />

                        <View
                            style={[
                                styles.stickyFiltersWrapper,
                                {paddingTop: Math.max(insets.top, 0)},
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
