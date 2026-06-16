const RU_COUNTRY_CODE = "7";
const RU_PHONE_DIGITS_LENGTH = 11;
const RU_NATIONAL_DIGITS_LENGTH = 10;

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const normalizeRuPhoneInput = (value: string) => {
    const digits = onlyDigits(value);

    if (!digits) {
        return "";
    }

    if (digits.startsWith(RU_COUNTRY_CODE)) {
        return digits.slice(0, RU_PHONE_DIGITS_LENGTH);
    }

    if (digits.startsWith("8")) {
        return `${RU_COUNTRY_CODE}${digits.slice(1)}`.slice(0, RU_PHONE_DIGITS_LENGTH);
    }

    return `${RU_COUNTRY_CODE}${digits}`.slice(0, RU_PHONE_DIGITS_LENGTH);
};

export const formatRuPhoneInput = (value: string) => {
    const normalized = normalizeRuPhoneInput(value);

    if (!normalized) {
        return "";
    }

    const national = normalized.slice(1, RU_PHONE_DIGITS_LENGTH);
    const area = national.slice(0, 3);
    const prefix = national.slice(3, 6);
    const firstPair = national.slice(6, 8);
    const secondPair = national.slice(8, 10);

    let formatted = "+7";

    if (area) {
        formatted += ` (${area}`;
    }

    if (area.length === 3) {
        formatted += ")";
    }

    if (prefix) {
        formatted += ` ${prefix}`;
    }

    if (firstPair) {
        formatted += `-${firstPair}`;
    }

    if (secondPair) {
        formatted += `-${secondPair}`;
    }

    return formatted;
};

export const formatRuPhoneDisplay = (phone: string) => formatRuPhoneInput(phone) || phone;

export const getRuPhoneE164 = (value: string) => {
    const normalized = normalizeRuPhoneInput(value);

    return normalized.length === RU_PHONE_DIGITS_LENGTH ? `+${normalized}` : null;
};

export const isRuPhoneComplete = (value: string) => Boolean(getRuPhoneE164(value));

export const getRuPhonePlaceholder = () => "+7 (___) ___-__-__";

export const getRuPhoneDigits = (value: string) => normalizeRuPhoneInput(value).slice(1);

export const getRuPhoneNationalLength = () => RU_NATIONAL_DIGITS_LENGTH;
