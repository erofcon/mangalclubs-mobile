import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ImageSourcePropType,
} from "react-native";

import {Ionicons} from "@expo/vector-icons";
import {Image} from "expo-image";
import {router, useLocalSearchParams} from "expo-router";

import {
    AppBottomSheetModal,
    type AppBottomSheetRef,
} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {Screen} from "@/components/ui/Screen";
import {
    MAX_SAVED_ADDRESSES,
    useAddressStore,
    type SavedAddress,
} from "@/store/address-store";
import {SHADOW, themeColors} from "@/utils/theme-colors";

type OrderType = "delivery" | "takeaway";
type DeliveryMode = "asap" | "scheduled";
type ScheduleDay = "today" | "tomorrow";

type ScheduledTime = {
    day: ScheduleDay;
    startMinutes: number;
};

type ScheduleState = {
    mode: DeliveryMode;
    selectedTime: ScheduledTime | null;
};

type TakeawayRestaurant = {
    id: string;
    title: string;
    address: string;
    hours: string;
    distance: string;
    image: ImageSourcePropType;
};

const takeawayRestaurants: TakeawayRestaurant[] = [
    {
        id: "fazenda",
        title: "Аврора и Бармалина",
        address: "ул. Садовническая, д. 82, стр. 2 (БЦ «Аврора Бизнес Парк»)",
        hours: "пн-пт — с 07:45 до 00:00\nсб-вс — с 10:00 до 00:00",
        distance: "1438.60 км",
        image: require("@/assets/mocks/restaurant-images/fazenda/XXXL.webp"),
    },
    {
        id: "mangal-clubs",
        title: "Жажда крови",
        address: "Лесная, д. 9",
        hours: "пн-чт — с 12:00 до 00:00\nпт-сб — с 12:00 до 01:00\nвс — с 12:00 до 00:00",
        distance: "1444.40 км",
        image: require("@/assets/mocks/restaurant-images/mangal-clubs/XXXL.webp"),
    },
];

const SLOT_START = 9 * 60 + 15;
const SLOT_END = 23 * 60 + 45;
const SLOT_STEP = 15;

const shortDateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
});

const longDateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
});

function padTime(value: number): string {
    return String(value).padStart(2, "0");
}

function formatTime(minutes: number): string {
    return `${padTime(Math.floor(minutes / 60))}:${padTime(minutes % 60)}`;
}

function formatSlotRange(startMinutes: number): string {
    return `${formatTime(startMinutes)} - ${formatTime(startMinutes + SLOT_STEP)}`;
}

function getDateForDay(baseDate: Date, day: ScheduleDay): Date {
    const result = new Date(baseDate);
    result.setHours(0, 0, 0, 0);

    if (day === "tomorrow") {
        result.setDate(result.getDate() + 1);
    }

    return result;
}

function getStartMinutesForToday(now: Date): number {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedUp = Math.ceil(currentMinutes / SLOT_STEP) * SLOT_STEP;
    return Math.max(SLOT_START, roundedUp);
}

function getSlotsForDay(now: Date, day: ScheduleDay): ScheduledTime[] {
    const startMinutes = day === "today" ? getStartMinutesForToday(now) : SLOT_START;

    if (startMinutes > SLOT_END) {
        return [];
    }

    const slots: ScheduledTime[] = [];

    for (let minutes = startMinutes; minutes <= SLOT_END; minutes += SLOT_STEP) {
        slots.push({day, startMinutes: minutes});
    }

    return slots;
}

function getDefaultScheduledTime(now: Date): ScheduledTime | null {
    const todaySlots = getSlotsForDay(now, "today");
    if (todaySlots.length > 0) {
        return todaySlots[0] ?? null;
    }

    const tomorrowSlots = getSlotsForDay(now, "tomorrow");
    return tomorrowSlots[0] ?? null;
}

function formatScheduledLabel(selection: ScheduledTime, now: Date): string {
    const date = getDateForDay(now, selection.day);
    return `${shortDateFormatter.format(date)}, в ${formatSlotRange(selection.startMinutes)}`;
}

function formatDayLabel(day: ScheduleDay, now: Date): string {
    const date = getDateForDay(now, day);
    return `${day === "today" ? "Сегодня" : "Завтра"}, ${longDateFormatter.format(date)}`;
}

function emptySchedule(): ScheduleState {
    return {mode: "asap", selectedTime: null};
}

export function OrderTypeScreen() {
    const params = useLocalSearchParams<{type?: OrderType}>();
    const initialTab: OrderType = params.type === "takeaway" ? "takeaway" : "delivery";
    const now = new Date();

    const [activeTab, setActiveTab] = useState<OrderType>(initialTab);
    const [orderSchedule, setOrderSchedule] = useState<ScheduleState>(() => emptySchedule());
    const [selectedTakeawayRestaurantId, setSelectedTakeawayRestaurantId] =
        useState<string>(takeawayRestaurants[0]?.id ?? "");
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [addressToDelete, setAddressToDelete] = useState<SavedAddress | null>(null);
    const [sheetDay, setSheetDay] = useState<ScheduleDay>("today");
    const [sheetDraftTime, setSheetDraftTime] = useState<ScheduledTime | null>(null);
    const sheetRef = useRef<AppBottomSheetRef>(null);

    const addresses = useAddressStore((state) => state.addresses);
    const deleteAddress = useAddressStore((state) => state.deleteAddress);
    const selectAddress = useAddressStore((state) => state.selectAddress);

    const canAddMoreAddresses = addresses.length < MAX_SAVED_ADDRESSES;
    const hasSavedAddresses = addresses.length > 0;
    const showOrderPanel = activeTab === "takeaway" || hasSavedAddresses;
    const bottomPadding = showOrderPanel ? 260 : 132;

    const currentSchedule = orderSchedule;
    const currentScheduleText =
        currentSchedule.mode === "scheduled" && currentSchedule.selectedTime
            ? formatScheduledLabel(currentSchedule.selectedTime, now)
            : null;

    const scheduleSlots = useMemo(
        () => ({
            today: getSlotsForDay(now, "today"),
            tomorrow: getSlotsForDay(now, "tomorrow"),
        }),
        [now]
    );

    const selectedTakeawayRestaurant =
        takeawayRestaurants.find((restaurant) => restaurant.id === selectedTakeawayRestaurantId) ??
        takeawayRestaurants[0];

    useEffect(() => {
        if (addresses.length === 0) {
            setSelectedAddressId(null);
            return;
        }

        const existing = addresses.find((item) => item.id === selectedAddressId);
        if (existing) {
            return;
        }

        const firstAddress = addresses[0];
        if (firstAddress) {
            setSelectedAddressId(firstAddress.id);
            selectAddress(firstAddress.id);
        }
    }, [addresses, selectAddress, selectedAddressId]);

    useEffect(() => {
        if (addressToDelete && !addresses.some((item) => item.id === addressToDelete.id)) {
            setAddressToDelete(null);
        }
    }, [addresses, addressToDelete]);

    const setCurrentSchedule = (updater: (prev: ScheduleState) => ScheduleState) => {
        setOrderSchedule(updater);
    };

    const openSheet = () => {
        const selectedTime =
            currentSchedule.mode === "scheduled" && currentSchedule.selectedTime
                ? currentSchedule.selectedTime
                : getDefaultScheduledTime(now);

        const nextDay = selectedTime?.day ?? "today";
        const daySlots = scheduleSlots[nextDay];
        const normalized =
            selectedTime && daySlots.some((slot) => slot.startMinutes === selectedTime.startMinutes)
                ? selectedTime
                : daySlots[0] ?? getDefaultScheduledTime(now);

        setSheetDay(normalized?.day ?? nextDay);
        setSheetDraftTime(normalized);
        sheetRef.current?.open();
    };

    const handleDayPress = (day: ScheduleDay) => {
        const daySlots = scheduleSlots[day];
        if (daySlots.length === 0) {
            return;
        }

        setSheetDay(day);
        setSheetDraftTime((current) => {
            const match = current && daySlots.find((slot) => slot.startMinutes === current.startMinutes);
            return match ?? daySlots[0] ?? null;
        });
    };

    const handleSlotPress = (slot: ScheduledTime) => {
        setSheetDraftTime(slot);
        setCurrentSchedule(() => ({
            mode: "scheduled",
            selectedTime: slot,
        }));
    };

    const handleSaveSheet = () => {
        sheetRef.current?.close();
    };

    const handleConfirmDelete = () => {
        if (!addressToDelete) {
            return;
        }

        deleteAddress(addressToDelete.id);
        setAddressToDelete(null);
    };

    const renderAddressItem = ({item}: {item: SavedAddress}) => {
        const isSelected = item.id === selectedAddressId;

        return (
            <Pressable
                onPress={() => {
                    setSelectedAddressId(item.id);
                    selectAddress(item.id);
                }}
                style={[styles.card, isSelected && styles.cardSelected]}
            >
                <View style={styles.cardRow}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>

                    <Text style={styles.cardText} numberOfLines={1}>
                        {item.shortAddress}
                    </Text>
                </View>

                <Pressable hitSlop={10} onPress={() => setAddressToDelete(item)} style={styles.iconButton}>
                    <Ionicons name="ellipsis-horizontal" size={22} color={themeColors.textSecondary} />
                </Pressable>
            </Pressable>
        );
    };

    const renderRestaurantItem = ({item}: {item: TakeawayRestaurant}) => {
        const isSelected = item.id === selectedTakeawayRestaurantId;

        return (
            <Pressable
                onPress={() => setSelectedTakeawayRestaurantId(item.id)}
                style={({pressed}) => [
                    styles.restaurantCard,
                    isSelected && styles.restaurantCardSelected,
                    pressed && styles.pressed,
                ]}
            >
                <View style={styles.restaurantImageWrap}>
                    <Image source={item.image} style={styles.restaurantImage} contentFit="cover" transition={180} />
                </View>

                <View style={styles.restaurantContent}>
                    <View style={styles.restaurantHeader}>
                        <Text style={styles.restaurantTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <Text style={styles.restaurantDistance}>{item.distance}</Text>
                    </View>

                    <Text style={styles.restaurantAddress} numberOfLines={2}>
                        {item.address}
                    </Text>

                    <Text style={styles.restaurantHours}>Время работы: {item.hours}</Text>
                </View>

                <View style={[styles.restaurantCheck, isSelected && styles.restaurantCheckSelected]}>
                    {isSelected ? <Ionicons name="checkmark" size={14} color={themeColors.textOnPrimary} /> : null}
                </View>
            </Pressable>
        );
    };

    const renderOrderPanel = () => (
        <View style={styles.panel}>
            <Text style={styles.panelTitle}>
                {activeTab === "takeaway" ? "Время самовывоза" : "Время доставки"}
            </Text>

            <View style={styles.modeList}>
                <Pressable
                    onPress={() => {
                        setCurrentSchedule((prev) => ({...prev, mode: "asap"}));
                    }}
                    style={styles.modeRow}
                >
                    <View style={[styles.radio, currentSchedule.mode === "asap" && styles.radioSelected]}>
                        {currentSchedule.mode === "asap" ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={styles.modeLabel}>Как можно скорее</Text>
                </Pressable>

                <Pressable onPress={openSheet} style={styles.modeRow}>
                    <View style={[styles.radio, currentSchedule.mode === "scheduled" && styles.radioSelected]}>
                        {currentSchedule.mode === "scheduled" ? <View style={styles.radioInner} /> : null}
                    </View>

                    <View style={styles.modeTextWrap}>
                        <Text style={[styles.modeLabel, currentSchedule.mode === "scheduled" && styles.modeLabelActive]}>
                            Ко времени
                        </Text>
                        {currentScheduleText ? <Text style={styles.modeValue}>{currentScheduleText}</Text> : null}
                    </View>

                    <Text style={[styles.modeAction, currentSchedule.mode !== "scheduled" && styles.modeActionHidden]}>
                        Изменить
                    </Text>
                </Pressable>
            </View>

            <View style={styles.sourceBlock}>
                <Text style={styles.sourceLabel}>Из ресторана</Text>
                <Text style={styles.sourceTitle}>
                    {activeTab === "takeaway"
                        ? selectedTakeawayRestaurant?.title ?? "Доставка Покровка"
                        : "Доставка Покровка"}
                </Text>
            </View>

            <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Продолжить</Text>
            </Pressable>
        </View>
    );

    const renderAddAddressPanel = () => (
        <View style={styles.panel}>
            <Pressable
                style={({pressed}) => [
                    styles.addButton,
                    !canAddMoreAddresses && styles.addButtonDisabled,
                    pressed && canAddMoreAddresses && styles.pressed,
                ]}
                onPress={() => {
                    if (canAddMoreAddresses) {
                        router.push("/delivery_address");
                    }
                }}
                disabled={!canAddMoreAddresses}
            >
                <Text style={[styles.addButtonText, !canAddMoreAddresses && styles.addButtonTextDisabled]}>
                    Добавить адрес
                </Text>
                <View style={[styles.addButtonIcon, !canAddMoreAddresses && styles.addButtonIconDisabled]}>
                    <Ionicons
                        name="add"
                        size={22}
                        color={canAddMoreAddresses ? themeColors.notification : themeColors.textSecondary}
                    />
                </View>
            </Pressable>

            {!canAddMoreAddresses ? (
                <Text style={styles.limitText}>Максимум {MAX_SAVED_ADDRESSES} адресов</Text>
            ) : null}
        </View>
    );

    return (
        <Screen withTopInset>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.segment}>
                        <Pressable
                            onPress={() => setActiveTab("delivery")}
                            style={[styles.segmentButton, activeTab === "delivery" && styles.segmentButtonActive]}
                        >
                            <Text style={[styles.segmentText, activeTab === "delivery" && styles.segmentTextActive]}>
                                Доставка
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setActiveTab("takeaway")}
                            style={[styles.segmentButton, activeTab === "takeaway" && styles.segmentButtonActive]}
                        >
                            <Text style={[styles.segmentText, activeTab === "takeaway" && styles.segmentTextActive]}>
                                Навынос
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.topText}>
                        <Text style={styles.title}>
                            {activeTab === "delivery" ? "Сохранённые адреса" : "Выберите ресторан"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {activeTab === "delivery" ? "Выберите адрес для доставки" : "Где вы хотите забрать заказ"}
                        </Text>
                    </View>

                    {activeTab === "delivery" ? (
                        <FlatList
                            data={addresses}
                            keyExtractor={(item) => item.id}
                            renderItem={renderAddressItem}
                            style={styles.list}
                            contentContainerStyle={{paddingBottom: bottomPadding}}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons name="location-outline" size={28} color={themeColors.primary} />
                                    <Text style={styles.emptyTitle}>Адресов пока нет</Text>
                                    <Text style={styles.emptyText}>
                                        Добавьте первый адрес, чтобы выбрать его в списке.
                                    </Text>
                                </View>
                            }
                        />
                    ) : (
                        <FlatList
                            data={takeawayRestaurants}
                            keyExtractor={(item) => item.id}
                            renderItem={renderRestaurantItem}
                            style={styles.list}
                            contentContainerStyle={{paddingBottom: bottomPadding}}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>

                <View style={styles.bottomPanel}>
                    {showOrderPanel ? renderOrderPanel() : renderAddAddressPanel()}
                </View>

                <Modal
                    visible={addressToDelete !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setAddressToDelete(null)}
                >
                    <Pressable style={styles.modalBackdrop} onPress={() => setAddressToDelete(null)}>
                        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
                            <Text style={styles.modalTitle}>Удалить адрес?</Text>
                            <Text style={styles.modalAddress} numberOfLines={2}>
                                {addressToDelete?.shortAddress}
                            </Text>

                            <View style={styles.modalActions}>
                                <Pressable style={styles.modalCancel} onPress={() => setAddressToDelete(null)}>
                                    <Text style={styles.modalCancelText}>Отмена</Text>
                                </Pressable>
                                <Pressable style={styles.modalDelete} onPress={handleConfirmDelete}>
                                    <Text style={styles.modalDeleteText}>Удалить</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>

                <AppBottomSheetModal
                    ref={sheetRef}
                    title={activeTab === "takeaway" ? "Время самовывоза" : "Время доставки"}
                    scrollable
                    snapPoints={["82%"]}
                    enableDynamicSizing={false}
                    onDismiss={() => setSheetDraftTime(null)}
                    footer={
                        <Pressable style={styles.sheetSaveButton} onPress={handleSaveSheet}>
                            <Text style={styles.sheetSaveButtonText}>Сохранить</Text>
                        </Pressable>
                    }
                >
                    <View style={styles.sheetContent}>
                        <View style={styles.dayTabs}>
                            {(["today", "tomorrow"] as ScheduleDay[]).map((day) => {
                                const slots = scheduleSlots[day];
                                const active = day === sheetDay;

                                return (
                                    <Pressable
                                        key={day}
                                        onPress={() => handleDayPress(day)}
                                        disabled={slots.length === 0}
                                        style={[
                                            styles.dayTab,
                                            active && styles.dayTabActive,
                                            slots.length === 0 && styles.dayTabDisabled,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dayTabText,
                                                active && styles.dayTabTextActive,
                                                slots.length === 0 && styles.dayTabTextDisabled,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {formatDayLabel(day, now)}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.slotList}>
                            {scheduleSlots[sheetDay].length > 0 ? (
                                scheduleSlots[sheetDay].map((slot) => {
                                    const selected =
                                        slot.day === sheetDraftTime?.day &&
                                        slot.startMinutes === sheetDraftTime?.startMinutes;

                                    return (
                                        <Pressable
                                            key={`${slot.day}-${slot.startMinutes}`}
                                            onPress={() => handleSlotPress(slot)}
                                            style={styles.slotRow}
                                        >
                                            <Text style={styles.slotText}>{formatSlotRange(slot.startMinutes)}</Text>
                                            <View style={[styles.radio, selected && styles.radioSelected]}>
                                                {selected ? <View style={styles.radioInner} /> : null}
                                            </View>
                                        </Pressable>
                                    );
                                })
                            ) : (
                                <View style={styles.sheetEmptyState}>
                                    <Text style={styles.sheetEmptyText}>На этот день нет доступных слотов.</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </AppBottomSheetModal>
            </View>
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
        paddingHorizontal: 16,
        alignItems: "center",
    },
    segment: {
        flexDirection: "row",
        width: "100%",
        maxWidth: 300,
        padding: 3,
        borderRadius: 10,
        backgroundColor: themeColors.card,
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
        ...SHADOW,
    },
    segmentText: {
        fontSize: 15,
        fontFamily: "Point-SemiBold",
        color: themeColors.textSecondary,
    },
    segmentTextActive: {
        color: themeColors.textOnPrimary,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
        gap: 16,
    },
    topText: {
        gap: 4,
    },
    title: {
        color: themeColors.text,
        fontSize: 20,
        fontFamily: "Point-Bold",
        letterSpacing: -0.4,
    },
    subtitle: {
        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
    },
    list: {
        flex: 1,
    },
    card: {
        minHeight: 58,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        backgroundColor: themeColors.card,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    },
    cardSelected: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.cardHover,
    },
    cardRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
    },
    cardText: {
        flex: 1,
        minWidth: 0,
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-SemiBold",
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: themeColors.border,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    radioSelected: {
        borderColor: themeColors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: themeColors.primary,
    },
    iconButton: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    restaurantCard: {
        minHeight: 128,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        backgroundColor: themeColors.card,
        padding: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 12,
    },
    restaurantCardSelected: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.cardHover,
        ...SHADOW,
    },
    pressed: {
        opacity: 0.94,
    },
    restaurantImageWrap: {
        width: 92,
        height: 92,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: themeColors.cardSecondary,
        flexShrink: 0,
    },
    restaurantImage: {
        width: "100%",
        height: "100%",
    },
    restaurantContent: {
        flex: 1,
        minWidth: 0,
        gap: 6,
        paddingTop: 2,
    },
    restaurantHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
    },
    restaurantTitle: {
        flex: 1,
        minWidth: 0,
        color: themeColors.text,
        fontSize: 17,
        fontFamily: "Point-Bold",
        lineHeight: 22,
    },
    restaurantDistance: {
        color: themeColors.text,
        fontSize: 13,
        fontFamily: "Point-SemiBold",
        flexShrink: 0,
    },
    restaurantAddress: {
        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
        lineHeight: 19,
    },
    restaurantHours: {
        color: themeColors.textSecondary,
        fontSize: 13,
        fontFamily: "Point-Regular",
        lineHeight: 18,
    },
    restaurantCheck: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: themeColors.border,
        backgroundColor: themeColors.cardSecondary,
        flexShrink: 0,
        marginTop: 2,
    },
    restaurantCheckSelected: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.primary,
    },
    bottomPanel: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 16,
        backgroundColor: themeColors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        borderColor: themeColors.cardBorder,
        ...SHADOW,
    },
    panel: {
        gap: 14,
    },
    panelTitle: {
        color: themeColors.text,
        fontSize: 18,
        fontFamily: "Point-Bold",
        letterSpacing: -0.3,
    },
    modeList: {
        gap: 12,
    },
    modeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    modeTextWrap: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    modeLabel: {
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-SemiBold",
    },
    modeLabelActive: {
        color: themeColors.primary,
    },
    modeValue: {
        color: themeColors.primary,
        fontSize: 14,
        fontFamily: "Point-SemiBold",
    },
    modeAction: {
        color: themeColors.notification,
        fontSize: 14,
        fontFamily: "Point-SemiBold",
        flexShrink: 0,
    },
    modeActionHidden: {
        opacity: 0,
    },
    sourceBlock: {
        gap: 2,
    },
    sourceLabel: {
        color: themeColors.textSecondary,
        fontSize: 13,
        fontFamily: "Point-Regular",
    },
    sourceTitle: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },
    primaryButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor: themeColors.notification,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },
    addButton: {
        minHeight: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        backgroundColor: themeColors.card,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    addButtonDisabled: {
        opacity: 0.72,
    },
    addButtonText: {
        color: themeColors.notification,
        fontSize: 16,
        fontFamily: "Point-SemiBold",
    },
    addButtonTextDisabled: {
        color: themeColors.textSecondary,
    },
    addButtonIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: themeColors.notification,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    addButtonIconDisabled: {
        borderColor: themeColors.border,
    },
    limitText: {
        color: themeColors.textSecondary,
        fontSize: 12,
        fontFamily: "Point-Regular",
        lineHeight: 16,
        paddingHorizontal: 4,
    },
    emptyState: {
        flex: 1,
        minHeight: 220,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        gap: 8,
    },
    emptyTitle: {
        color: themeColors.text,
        fontSize: 18,
        fontFamily: "Point-SemiBold",
        textAlign: "center",
    },
    emptyText: {
        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
        textAlign: "center",
        lineHeight: 20,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    modalCard: {
        width: "100%",
        maxWidth: 360,
        borderRadius: 20,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        padding: 20,
        gap: 10,
        ...SHADOW,
    },
    modalTitle: {
        color: themeColors.text,
        fontSize: 18,
        fontFamily: "Point-Bold",
    },
    modalAddress: {
        color: themeColors.textSecondary,
        fontSize: 15,
        fontFamily: "Point-Regular",
        lineHeight: 21,
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    modalCancel: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        backgroundColor: themeColors.cardSecondary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },
    modalCancelText: {
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-SemiBold",
    },
    modalDelete: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        backgroundColor: themeColors.notification,
        alignItems: "center",
        justifyContent: "center",
    },
    modalDeleteText: {
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-Bold",
    },
    sheetContent: {
        gap: 16,
        paddingBottom: 4,
    },
    dayTabs: {
        flexDirection: "row",
        gap: 8,
    },
    dayTab: {
        flex: 1,
        minHeight: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        backgroundColor: themeColors.cardSecondary,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    dayTabActive: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.cardHover,
    },
    dayTabDisabled: {
        opacity: 0.45,
    },
    dayTabText: {
        color: themeColors.textSecondary,
        fontSize: 13,
        fontFamily: "Point-SemiBold",
        textAlign: "center",
    },
    dayTabTextActive: {
        color: themeColors.text,
    },
    dayTabTextDisabled: {
        color: themeColors.textSecondary,
    },
    slotList: {
        gap: 8,
    },
    slotRow: {
        minHeight: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        backgroundColor: themeColors.card,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    slotText: {
        flex: 1,
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-Regular",
    },
    sheetEmptyState: {
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    sheetEmptyText: {
        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
        textAlign: "center",
        lineHeight: 20,
    },
    sheetSaveButton: {
        minHeight: 52,
        borderRadius: 14,
        backgroundColor: themeColors.notification,
        alignItems: "center",
        justifyContent: "center",
    },
    sheetSaveButtonText: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },
});
