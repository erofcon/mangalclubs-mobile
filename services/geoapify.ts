import type {Coordinates} from "@/utils/location-config";

type GeoapifyGeocodeResult = {
    place_id?: string | number;
    lat?: number | string;
    lon?: number | string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    suburb?: string;
    county?: string;
    state?: string;
    rank?: {
        confidence?: number;
        confidence_street_level?: number;
        match_type?: string;
    };
};

type GeoapifyGeocodeResponse = {
    results?: GeoapifyGeocodeResult[];
};

export type DeliveryAddressSuggestion = {
    id: string;
    title: string;
    subtitle: string;
    shortAddress: string;
    point: Coordinates;
    distanceMeters?: number | null;
    isPrecise: boolean;
};

export type ResolvedDeliveryAddress = {
    city: string;
    address: string;
    house: string;
    shortAddress: string;
    isPrecise: boolean;
};

function getApiKey(): string {
    const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;

    if (!apiKey) {
        throw new Error("Не найден EXPO_PUBLIC_GEOAPIFY_KEY.");
    }

    return apiKey;
}

function toNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function getLocality(result: GeoapifyGeocodeResult): string {
    return (
        result.city?.trim() ||
        result.town?.trim() ||
        result.village?.trim() ||
        result.hamlet?.trim() ||
        result.municipality?.trim() ||
        ""
    );
}

function extractStreetFromAddressLine(addressLine?: string): string {
    if (!addressLine) {
        return "";
    }

    return addressLine
        .trim()
        .replace(/(?:,\s*)?\d+[a-zа-я0-9\-\/]*$/i, "")
        .replace(/,\s*$/, "")
        .trim();
}

function extractHouseFromAddressLine(addressLine?: string): string {
    if (!addressLine) {
        return "";
    }

    const match = addressLine.trim().match(/(\d+[a-zа-я0-9\-\/]*)$/i);
    return match?.[1]?.trim() ?? "";
}

function getHouseNumber(result: GeoapifyGeocodeResult): string {
    return (
        result.housenumber?.trim() ||
        extractHouseFromAddressLine(result.address_line1) ||
        ""
    );
}

function getStreetName(result: GeoapifyGeocodeResult): string {
    return (
        result.street?.trim() ||
        extractStreetFromAddressLine(result.address_line1) ||
        ""
    );
}

function hasStreetAndHouse(result: GeoapifyGeocodeResult): boolean {
    return Boolean(getStreetName(result) && getHouseNumber(result));
}

function buildShortAddress(result: GeoapifyGeocodeResult): string {
    const locality = getLocality(result);
    const street = getStreetName(result);
    const house = getHouseNumber(result);
    const parts = [locality, street, house].filter(Boolean);

    if (parts.length > 0) {
        return parts.join(", ");
    }

    return result.address_line1?.trim() || result.formatted?.trim() || "";
}

function buildResolvedAddress(result: GeoapifyGeocodeResult): ResolvedDeliveryAddress {
    const city = getLocality(result);
    const address = getStreetName(result);
    const house = getHouseNumber(result);
    const shortAddress = [city, address, house].filter(Boolean).join(", ");

    return {
        city,
        address,
        house,
        shortAddress,
        isPrecise: hasStreetAndHouse(result),
    };
}

function buildSuggestionSubtitle(
    result: GeoapifyGeocodeResult,
    shortAddress: string
): string {
    const rawSubtitle =
        result.address_line2?.trim() ||
        [result.suburb?.trim(), result.state?.trim()].filter(Boolean).join(", ");

    if (!rawSubtitle || rawSubtitle === shortAddress) {
        return "";
    }

    return rawSubtitle;
}

function getDistanceInMeters(
    from: Coordinates,
    to: Coordinates
): number {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusMeters = 6_371_000;

    const latitudeDelta = toRadians(to.latitude - from.latitude);
    const longitudeDelta = toRadians(to.longitude - from.longitude);
    const fromLatitude = toRadians(from.latitude);
    const toLatitude = toRadians(to.latitude);

    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(fromLatitude) *
        Math.cos(toLatitude) *
        Math.sin(longitudeDelta / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadiusMeters * c);
}

function normalizeForMatch(value: string): string {
    return value
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-z0-9а-я\s-]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getMatchScore(query: string, candidate: string): number {
    const normalizedQuery = normalizeForMatch(query);
    const normalizedCandidate = normalizeForMatch(candidate);

    if (!normalizedQuery || !normalizedCandidate) {
        return 0;
    }

    const candidateWithSpaces = ` ${normalizedCandidate} `;
    const tokens = normalizedQuery.split(" ").filter((token) => token.length >= 2);

    let score = 0;

    for (const token of tokens) {
        if (candidateWithSpaces.includes(` ${token} `)) {
            score += 3;
        } else if (candidateWithSpaces.includes(token)) {
            score += 1;
        }
    }

    if (candidateWithSpaces.includes(` ${normalizedQuery} `)) {
        score += 2;
    }

    return score;
}

function buildSearchVariants(input: string): string[] {
    const trimmed = input.trim().replace(/\s+/g, " ");
    const variants = new Set<string>([trimmed]);

    if (trimmed.split(" ").length === 1 && trimmed.length >= 3) {
        variants.add(`село ${trimmed}`);
    }

    const parts = trimmed.split(" ");
    if (parts.length >= 3) {
        const houseCandidate = parts[parts.length - 1];
        const firstToken = parts[0];
        const middle = parts.slice(1, -1).join(" ");

        if (/\d/.test(houseCandidate) && middle.length >= 2) {
            variants.add(`${middle} ${houseCandidate}, ${firstToken}`);
        }
    }

    return Array.from(variants).slice(0, 2);
}

async function requestAutocomplete(
    text: string,
    options?: {
        proximity?: Coordinates | null;
        limit?: number;
    }
): Promise<GeoapifyGeocodeResult[]> {
    const countryCodes = process.env.EXPO_PUBLIC_GEOAPIFY_COUNTRY_CODES?.trim();

    const query = new URLSearchParams({
        text,
        lang: "ru",
        format: "json",
        limit: String(options?.limit ?? 20),
        apiKey: getApiKey(),
    });

    if (countryCodes) {
        query.set("filter", `countrycode:${countryCodes}`);
    }

    if (options?.proximity) {
        query.set(
            "bias",
            `proximity:${options.proximity.longitude},${options.proximity.latitude}`
        );
    }

    const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?${query.toString()}`
    );

    if (!response.ok) {
        throw new Error(`Geoapify autocomplete failed: ${response.status}`);
    }

    const payload = (await response.json()) as GeoapifyGeocodeResponse;
    return payload.results ?? [];
}

export async function reverseGeocodeDeliveryPoint(
    point: Coordinates
): Promise<ResolvedDeliveryAddress> {
    const query = new URLSearchParams({
        lat: String(point.latitude),
        lon: String(point.longitude),
        lang: "ru",
        format: "json",
        apiKey: getApiKey(),
    });

    const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?${query.toString()}`
    );

    if (!response.ok) {
        throw new Error(`Geoapify reverse geocoding failed: ${response.status}`);
    }

    const payload = (await response.json()) as GeoapifyGeocodeResponse;
    const result = payload.results?.[0];

    if (!result) {
        throw new Error("Geoapify не вернул адрес по координатам.");
    }

    const resolvedAddress = buildResolvedAddress(result);

    if (!resolvedAddress.shortAddress) {
        throw new Error("Не удалось определить адрес по координатам.");
    }

    return resolvedAddress;
}

export async function searchDeliveryAddressSuggestions(
    text: string,
    options?: { proximity: Coordinates; limit: number }
): Promise<DeliveryAddressSuggestion[]> {
    const trimmedText = text.trim();

    if (trimmedText.length < 2) {
        return [];
    }

    const requestedLimit = options?.limit ?? 8;
    const apiLimit = Math.max(requestedLimit * 5, 20);

    const variants = buildSearchVariants(trimmedText);
    const rawResults: GeoapifyGeocodeResult[] = [];

    for (const variant of variants) {
        const withBias = await requestAutocomplete(variant, {
            proximity: options?.proximity ?? null,
            limit: apiLimit,
        });

        rawResults.push(...withBias);

        if (withBias.length === 0 && options?.proximity) {
            const withoutBias = await requestAutocomplete(variant, {
                proximity: null,
                limit: apiLimit,
            });

            rawResults.push(...withoutBias);
        }
    }

    const ranked: Array<
        DeliveryAddressSuggestion & { matchScore: number; confidence: number }
    > = [];

    for (let index = 0; index < rawResults.length; index += 1) {
        const result = rawResults[index];
        const latitude = toNumber(result.lat);
        const longitude = toNumber(result.lon);

        if (latitude === null || longitude === null) {
            continue;
        }

        const shortAddress = buildShortAddress(result);
        if (!shortAddress) {
            continue;
        }

        const locality = getLocality(result);
        const street = getStreetName(result);
        const precise = hasStreetAndHouse(result);

        if (!precise && !street && !locality) {
            continue;
        }

        const point: Coordinates = {
            latitude,
            longitude,
            accuracy: null,
        };

        const subtitle = buildSuggestionSubtitle(result, shortAddress);
        const searchableText = [
            result.formatted,
            result.address_line1,
            result.address_line2,
            street,
            getHouseNumber(result),
            locality,
            shortAddress,
        ]
            .filter(Boolean)
            .join(" ");

        const matchScore = getMatchScore(trimmedText, searchableText);

        ranked.push({
            id: String(result.place_id ?? `${latitude}:${longitude}:${index}`),
            title: shortAddress,
            subtitle,
            shortAddress,
            point,
            distanceMeters: options?.proximity
                ? getDistanceInMeters(options.proximity, point)
                : null,
            isPrecise: precise,
            matchScore,
            confidence: toNumber(result.rank?.confidence) ?? 0,
        });
    }

    const deduped = new Map<
        string,
        DeliveryAddressSuggestion & { matchScore: number; confidence: number }
    >();

    for (const item of ranked) {
        const key = `${normalizeForMatch(item.shortAddress)}|${normalizeForMatch(
            item.subtitle
        )}`;
        const prev = deduped.get(key);

        if (!prev) {
            deduped.set(key, item);
            continue;
        }

        const prevDistance = prev.distanceMeters ?? Number.MAX_SAFE_INTEGER;
        const itemDistance = item.distanceMeters ?? Number.MAX_SAFE_INTEGER;

        const isBetter =
            (item.isPrecise ? 1 : 0) > (prev.isPrecise ? 1 : 0) ||
            item.matchScore > prev.matchScore ||
            (item.matchScore === prev.matchScore && itemDistance < prevDistance) ||
            (item.matchScore === prev.matchScore &&
                itemDistance === prevDistance &&
                item.confidence > prev.confidence);

        if (isBetter) {
            deduped.set(key, item);
        }
    }

    const sorted = Array.from(deduped.values()).sort((a, b) => {
        if (a.isPrecise !== b.isPrecise) {
            return a.isPrecise ? -1 : 1;
        }

        if (a.matchScore !== b.matchScore) {
            return b.matchScore - a.matchScore;
        }

        const distanceA = a.distanceMeters ?? Number.MAX_SAFE_INTEGER;
        const distanceB = b.distanceMeters ?? Number.MAX_SAFE_INTEGER;

        if (distanceA !== distanceB) {
            return distanceA - distanceB;
        }

        return b.confidence - a.confidence;
    });

    const relevant = sorted.filter(
        (item) => item.isPrecise || item.matchScore >= 2
    );

    const finalItems = (relevant.length > 0 ? relevant : sorted).slice(
        0,
        requestedLimit
    );

    return finalItems.map(({matchScore, confidence, ...suggestion}) => suggestion);
}

