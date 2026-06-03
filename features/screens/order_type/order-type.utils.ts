import type {Coordinates} from "@/types/organization";
import type {DeliveryScheduleDay, DeliveryTimeSlot} from "@/store/delivery-store";

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

export function formatTime(minutes: number): string {
    return `${padTime(Math.floor(minutes / 60))}:${padTime(minutes % 60)}`;
}

export function formatSlotRange(startMinutes: number): string {
    return `${formatTime(startMinutes)} - ${formatTime(startMinutes + SLOT_STEP)}`;
}

export function getDateForDay(baseDate: Date, day: DeliveryScheduleDay): Date {
    const result = new Date(baseDate);
    result.setHours(0, 0, 0, 0);

    if (day === "tomorrow") {
        result.setDate(result.getDate() + 1);
    }

    return result;
}

export function getStartMinutesForToday(now: Date): number {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedUp = Math.ceil(currentMinutes / SLOT_STEP) * SLOT_STEP;
    return Math.max(SLOT_START, roundedUp);
}

export function getSlotsForDay(now: Date, day: DeliveryScheduleDay): DeliveryTimeSlot[] {
    const startMinutes = day === "today" ? getStartMinutesForToday(now) : SLOT_START;

    if (startMinutes > SLOT_END) {
        return [];
    }

    const slots: DeliveryTimeSlot[] = [];

    for (let minutes = startMinutes; minutes <= SLOT_END; minutes += SLOT_STEP) {
        slots.push({day, startMinutes: minutes});
    }

    return slots;
}

export function getDefaultScheduledTime(now: Date): DeliveryTimeSlot | null {
    const todaySlots = getSlotsForDay(now, "today");
    if (todaySlots.length > 0) {
        return todaySlots[0] ?? null;
    }

    const tomorrowSlots = getSlotsForDay(now, "tomorrow");
    return tomorrowSlots[0] ?? null;
}

export function formatScheduledLabel(selection: DeliveryTimeSlot, now: Date): string {
    const date = getDateForDay(now, selection.day);
    return `${shortDateFormatter.format(date)}, в ${formatSlotRange(selection.startMinutes)}`;
}

export function formatDayLabel(day: DeliveryScheduleDay, now: Date): string {
    const date = getDateForDay(now, day);
    return `${day === "today" ? "Сегодня" : "Завтра"}, ${longDateFormatter.format(date)}`;
}

export function formatDistanceKm(from: Coordinates, to: Coordinates): string {
    const earthRadiusKm = 6371;
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLng = ((to.longitude - from.longitude) * Math.PI) / 180;
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return `${(earthRadiusKm * c).toFixed(2)} км`;
}