import {create} from "zustand";

import {apiFetch} from "@/services/api";
import {normalizeMenu} from "@/services/menu";
import {
    Organizations as fallbackOrganizations,
    categories as fallbackCategories,
    menus as fallbackMenus,
} from "@/mocks/mocks-data";
import type {Category, MenuCategory} from "@/types/products";
import type {
    Organization,
    OrganizationAvailability,
    WorkingHour,
} from "@/types/organization";
import {useDeliveryStore} from "@/store/delivery-store";

type ApiOrganization = Omit<Organization, "schedule" | "working_hours"> & {
    working_hours?: WorkingHour[] | null;
};

type OpenWorkingHour = WorkingHour & {
    opens_at: string;
    closes_at: string;
};

type MenuResponse = {
    orderType: "delivery" | "pickup";
    organizationId: string;
    organizationSlug: string;
    categories: Category[];
    menu: MenuCategory[];
};

type LoadMenuReason = "initial" | "selection-change" | "cart-gate";

type AppDataStore = {
    organizations: Organization[];
    categories: Category[];
    menu: MenuCategory[];
    availabilityByOrganizationId: Record<string, OrganizationAvailability>;
    defaultDeliveryOrganization: Organization | null;
    isInitialized: boolean;
    isInitializing: boolean;
    isMenuLoading: boolean;
    isAvailabilityRefreshing: boolean;
    errorMessage: string;
    initialize: (signal?: AbortSignal) => Promise<void>;
    refreshMenuForCurrentOrder: (reason?: LoadMenuReason) => Promise<void>;
    refreshOrganizationAvailability: (signal?: AbortSignal) => Promise<void>;
};

const weekdayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const normalizeTime = (value: string) => {
    const [hours = "00", minutes = "00"] = value.replace("Z", "").split(":");

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

const getWeekdayName = (weekday: number) => {
    if (weekday >= 0 && weekday <= 6) {
        return weekdayNames[weekday];
    }

    if (weekday >= 1 && weekday <= 7) {
        return weekdayNames[weekday - 1];
    }

    return String(weekday);
};

const isOpenWorkingHour = (item: WorkingHour): item is OpenWorkingHour => (
    !item.is_closed && Boolean(item.opens_at && item.closes_at)
);

const formatWorkingHours = (workingHours?: WorkingHour[] | null) => {
    if (!workingHours?.length) {
        return "График уточняйте по телефону";
    }

    const openDays = workingHours
        .filter(isOpenWorkingHour)
        .sort((first, second) => first.weekday - second.weekday);

    if (openDays.length === 0) {
        return "Сегодня закрыто";
    }

    const first = openDays[0];
    const sameSchedule = openDays.every((item) => (
        item.opens_at === first.opens_at &&
        item.closes_at === first.closes_at &&
        item.closes_next_day === first.closes_next_day
    ));

    if (openDays.length === 7 && sameSchedule) {
        return `Ежедневно с ${normalizeTime(first.opens_at)} до ${normalizeTime(first.closes_at)}`;
    }

    return openDays
        .map((item) => `${getWeekdayName(item.weekday)}: ${normalizeTime(item.opens_at)}-${normalizeTime(item.closes_at)}`)
        .join(", ");
};

const normalizeOrganization = (organization: ApiOrganization): Organization => ({
    ...organization,
    schedule: formatWorkingHours(organization.working_hours),
    intro: organization.intro ?? "",
    working_hours: organization.working_hours ?? [],
});

export const getDefaultDeliveryOrganization = (organizations: Organization[]) => (
    organizations.find((organization) =>
        organization.is_default_delivery && organization.accepts_delivery !== false
    ) ??
    organizations.find((organization) => organization.is_default_delivery) ??
    organizations.find((organization) => organization.accepts_delivery !== false) ??
    organizations[0] ??
    null
);

const getOrganizationByIdOrSlug = (
    organizations: Organization[],
    idOrSlug?: string | null
) => (
    organizations.find((organization) =>
        organization.id === idOrSlug || organization.slug === idOrSlug
    ) ?? null
);

const getMenuRequest = (organizations: Organization[]) => {
    const {type, takeawayRestaurantId} = useDeliveryStore.getState();

    if (type === "takeaway" && takeawayRestaurantId) {
        const selectedOrganization = getOrganizationByIdOrSlug(
            organizations,
            takeawayRestaurantId
        );

        if (selectedOrganization) {
            return {
                orderType: "pickup" as const,
                organizationId: selectedOrganization.id,
                organizationSlug: selectedOrganization.slug,
            };
        }
    }

    return {
        orderType: "delivery" as const,
        organizationId: undefined,
        organizationSlug: undefined,
    };
};

const loadMenu = async (organizations: Organization[], signal?: AbortSignal) => {
    const request = getMenuRequest(organizations);

    return apiFetch<MenuResponse>("/api/v1/menu", {
        signal,
        params: {
            orderType: request.orderType,
            organizationId: request.orderType === "pickup" ? request.organizationId : undefined,
            organizationSlug: request.orderType === "pickup" ? request.organizationSlug : undefined,
        },
    });
};

const getAvailabilityKey = (organization: Pick<Organization, "id" | "slug">) => (
    organization.slug ?? organization.id
);

const loadAvailabilityMap = async (
    organizations: Organization[],
    signal?: AbortSignal
) => {
    const availabilityPairs = await Promise.all(
        organizations
            .filter((organization) => Boolean(getAvailabilityKey(organization)))
            .map(async (organization) => {
                try {
                    const availability = await apiFetch<OrganizationAvailability>(
                        `/api/v1/organizations/${encodeURIComponent(getAvailabilityKey(organization))}/availability`,
                        {signal}
                    );

                    return {organization, availability};
                } catch (error) {
                    if (signal?.aborted) {
                        throw error;
                    }

                    return null;
                }
            })
    );

    return availabilityPairs.reduce<Record<string, OrganizationAvailability>>(
        (acc, item) => {
            if (!item) {
                return acc;
            }

            const {organization, availability} = item;

            acc[organization.id] = availability;

            if (organization.slug) {
                acc[organization.slug] = availability;
            }

            if (availability.organization_id) {
                acc[availability.organization_id] = availability;
            }

            if (availability.slug) {
                acc[availability.slug] = availability;
            }

            return acc;
        },
        {}
    );
};

export const useAppDataStore = create<AppDataStore>((set, get) => ({
    organizations: fallbackOrganizations,
    categories: fallbackCategories,
    menu: normalizeMenu(fallbackMenus),
    availabilityByOrganizationId: {},
    defaultDeliveryOrganization: getDefaultDeliveryOrganization(fallbackOrganizations),
    isInitialized: false,
    isInitializing: false,
    isMenuLoading: false,
    isAvailabilityRefreshing: false,
    errorMessage: "",

    initialize: async (signal) => {
        set({isInitializing: true, isMenuLoading: true, errorMessage: ""});

        try {
            const apiOrganizations = await apiFetch<ApiOrganization[]>(
                "/api/v1/organizations",
                {signal}
            );
            const organizations = apiOrganizations.map(normalizeOrganization);
            const [menuResponse, availabilityByOrganizationId] = await Promise.all([
                loadMenu(organizations, signal),
                loadAvailabilityMap(organizations, signal),
            ]);

            set({
                organizations,
                categories: menuResponse.categories,
                menu: normalizeMenu(menuResponse.menu),
                availabilityByOrganizationId,
                defaultDeliveryOrganization: getDefaultDeliveryOrganization(organizations),
                isInitialized: true,
                isInitializing: false,
                isMenuLoading: false,
                isAvailabilityRefreshing: false,
                errorMessage: "",
            });
        } catch (error) {
            set({
                isInitializing: false,
                isMenuLoading: false,
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Не удалось загрузить данные",
            });

            throw error;
        }
    },

    refreshMenuForCurrentOrder: async (reason = "selection-change") => {
        const organizations = get().organizations;

        if (organizations.length === 0) {
            return;
        }

        set({isMenuLoading: true, errorMessage: ""});

        try {
            const menuResponse = await loadMenu(organizations);

            set({
                categories: menuResponse.categories,
                menu: normalizeMenu(menuResponse.menu),
                isMenuLoading: false,
                errorMessage: "",
            });
        } catch (error) {
            set({
                isMenuLoading: false,
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Не удалось обновить меню",
            });

            if (reason === "initial" || reason === "cart-gate") {
                throw error;
            }
        }
    },

    refreshOrganizationAvailability: async (signal) => {
        const organizations = get().organizations;

        if (organizations.length === 0) {
            return;
        }

        set({isAvailabilityRefreshing: true});

        try {
            const availabilityByOrganizationId = await loadAvailabilityMap(
                organizations,
                signal
            );

            if (get().organizations !== organizations) {
                set({isAvailabilityRefreshing: false});
                return;
            }

            set({
                availabilityByOrganizationId,
                isAvailabilityRefreshing: false,
            });
        } catch {
            set({isAvailabilityRefreshing: false});
        }
    },
}));
