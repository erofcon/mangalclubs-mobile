import {Pressable, Text, View} from "react-native";

import type {DeliveryScheduleDay, DeliveryTimeSlot} from "@/store/delivery-store";
import {formatDayLabel, formatSlotRange} from "../order-type.utils";
import styles from "../order-type.styles";

type Props = {
    now: Date;
    sheetDay: DeliveryScheduleDay;
    sheetDraftTime: DeliveryTimeSlot | null;
    scheduleSlots: Record<DeliveryScheduleDay, DeliveryTimeSlot[]>;
    onDayPress: (day: DeliveryScheduleDay) => void;
    onSlotPress: (slot: DeliveryTimeSlot) => void;
    onSave: () => void;
};

export function DeliveryTimeSheetContent({
                                             now,
                                             sheetDay,
                                             sheetDraftTime,
                                             scheduleSlots,
                                             onDayPress,
                                             onSlotPress,
                                             onSave,
                                         }: Props) {
    return (
        <>
            <View style={styles.sheetContent}>
                <View style={styles.dayTabs}>
                    {(["today", "tomorrow"] as DeliveryScheduleDay[]).map((day) => {
                        const slots = scheduleSlots[day];
                        const active = day === sheetDay;

                        return (
                            <Pressable
                                key={day}
                                onPress={() => onDayPress(day)}
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
                                    onPress={() => onSlotPress(slot)}
                                    style={styles.slotRow}
                                >
                                    <Text style={styles.slotText}>
                                        {formatSlotRange(slot.startMinutes)}
                                    </Text>
                                    <View style={[styles.radio, selected && styles.radioSelected]}>
                                        {selected ? <View style={styles.radioInner} /> : null}
                                    </View>
                                </Pressable>
                            );
                        })
                    ) : (
                        <View style={styles.sheetEmptyState}>
                            <Text style={styles.sheetEmptyText}>
                                На этот день нет доступных слотов.
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <Pressable style={styles.sheetSaveButton} onPress={onSave}>
                <Text style={styles.sheetSaveButtonText}>Сохранить</Text>
            </Pressable>
        </>
    );
}