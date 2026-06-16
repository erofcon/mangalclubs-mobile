import type {Coordinates, Organization, WorkingHour} from "@/types/organization";
import type {DeliveryScheduleDay, DeliveryTimeSlot} from "@/store/delivery-store";

const SLOT_START = 9 * 60 + 15;
const SLOT_END = 23 * 60 + 45;
export const ORDER_SLOT_STEP_MINUTES = 30;

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
    return formatTime(startMinutes);
}

export function getDateForDay(baseDate: Date, day: DeliveryScheduleDay): Date {
    const result = new Date(baseDate);
    result.setHours(0, 0, 0, 0);

    if (day === "tomorrow") {
        result.setDate(result.getDate() + 1);
    } else if (day === "dayAfterTomorrow") {
        result.setDate(result.getDate() + 2);
    }

    return result;
}

export function getStartMinutesForToday(now: Date): number {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedUp = Math.ceil(currentMinutes / ORDER_SLOT_STEP_MINUTES) * ORDER_SLOT_STEP_MINUTES;
    return Math.max(SLOT_START, roundedUp);
}

export function getSlotsForDay(now: Date, day: DeliveryScheduleDay): DeliveryTimeSlot[] {
    const startMinutes = day === "today" ? getStartMinutesForToday(now) : SLOT_START;

    if (startMinutes > SLOT_END) {
        return [];
    }

    const slots: DeliveryTimeSlot[] = [];

    for (let minutes = startMinutes; minutes + ORDER_SLOT_STEP_MINUTES <= SLOT_END; minutes += ORDER_SLOT_STEP_MINUTES) {
        slots.push({day, startMinutes: minutes});
    }

    return slots;
}

function parseTimeToMinutes(value?: string | null): number | null {
    if (!value) {
        return null;
    }

    const [hoursText = "", minutesText = ""] = value.replace("Z", "").split(":");
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    return hours * 60 + minutes;
}

function getWeekdayForDay(now: Date, day: DeliveryScheduleDay): number {
    const date = getDateForDay(now, day);

    return (date.getDay() + 6) % 7;
}

function getWorkingHourByWeekday(
    workingHours: WorkingHour[] | undefined,
    weekday: number
): WorkingHour | null {
    return workingHours?.find((item) => item.weekday === weekday) ?? null;
}

function addWindow(
    windows: Array<{start: number; end: number}>,
    start: number,
    end: number
) {
    const normalizedStart = Math.max(0, start);
    const normalizedEnd = Math.min(24 * 60, end);

    if (normalizedStart < normalizedEnd) {
        windows.push({start: normalizedStart, end: normalizedEnd});
    }
}

function getOrderWindowsForDay(
    now: Date,
    day: DeliveryScheduleDay,
    organization?: Organization | null
): Array<{start: number; end: number}> {
    const workingHours = organization?.working_hours;

    if (!workingHours?.length) {
        return [{start: SLOT_START, end: SLOT_END}];
    }

    const weekday = getWeekdayForDay(now, day);
    const windows: Array<{start: number; end: number}> = [];
    const todayHours = getWorkingHourByWeekday(workingHours, weekday);

    if (todayHours && !todayHours.is_closed) {
        const opensAt = parseTimeToMinutes(todayHours.opens_at);
        const closesAt = parseTimeToMinutes(todayHours.closes_at);

        if (opensAt !== null && closesAt !== null) {
            addWindow(
                windows,
                opensAt,
                todayHours.closes_next_day ? 24 * 60 : closesAt
            );
        }
    }

    const previousHours = getWorkingHourByWeekday(workingHours, (weekday + 6) % 7);

    if (previousHours && !previousHours.is_closed && previousHours.closes_next_day) {
        const closesAt = parseTimeToMinutes(previousHours.closes_at);

        if (closesAt !== null) {
            addWindow(windows, 0, closesAt);
        }
    }

    return windows.sort((first, second) => first.start - second.start);
}

export function getSlotsForOrganizationDay(
    now: Date,
    day: DeliveryScheduleDay,
    organization?: Organization | null
): DeliveryTimeSlot[] {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const minStart =
        day === "today"
            ? Math.ceil(currentMinutes / ORDER_SLOT_STEP_MINUTES) * ORDER_SLOT_STEP_MINUTES
            : 0;
    const slots: DeliveryTimeSlot[] = [];

    getOrderWindowsForDay(now, day, organization).forEach((window) => {
        let start = window.start;

        if (start < minStart) {
            const stepsToCurrentTime = Math.ceil(
                (minStart - window.start) / ORDER_SLOT_STEP_MINUTES
            );

            start = window.start + stepsToCurrentTime * ORDER_SLOT_STEP_MINUTES;
        }

        for (
            let minutes = start;
            minutes + ORDER_SLOT_STEP_MINUTES <= window.end;
            minutes += ORDER_SLOT_STEP_MINUTES
        ) {
            slots.push({day, startMinutes: minutes});
        }
    });

    return slots;
}

export function getScheduleSlots(
    now: Date,
    organization?: Organization | null
): Record<DeliveryScheduleDay, DeliveryTimeSlot[]> {
    return {
        today: getSlotsForOrganizationDay(now, "today", organization),
        tomorrow: getSlotsForOrganizationDay(now, "tomorrow", organization),
        dayAfterTomorrow: getSlotsForOrganizationDay(now, "dayAfterTomorrow", organization),
    };
}

export function getDefaultScheduledTime(
    now: Date,
    organization?: Organization | null
): DeliveryTimeSlot | null {
    const todaySlots = getSlotsForOrganizationDay(now, "today", organization);
    if (todaySlots.length > 0) {
        return todaySlots[0] ?? null;
    }

    const tomorrowSlots = getSlotsForOrganizationDay(now, "tomorrow", organization);
    if (tomorrowSlots.length > 0) {
        return tomorrowSlots[0] ?? null;
    }

    const dayAfterTomorrowSlots = getSlotsForOrganizationDay(
        now,
        "dayAfterTomorrow",
        organization
    );

    return dayAfterTomorrowSlots[0] ?? null;
}

export function formatScheduledLabel(selection: DeliveryTimeSlot, now: Date): string {
    const date = getDateForDay(now, selection.day);
    return `${shortDateFormatter.format(date)}, в ${formatTime(selection.startMinutes)}`;
}

export function formatDayLabel(day: DeliveryScheduleDay, now: Date): string {
    const date = getDateForDay(now, day);
    const dayTitle =
        day === "today"
            ? "Сегодня"
            : day === "tomorrow"
                ? "Завтра"
                : "Послезавтра";

    return `${dayTitle}, ${longDateFormatter.format(date)}`;
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
