import type {Organization, OrganizationAvailability} from "@/types/organization";

export const DEFAULT_UNAVAILABLE_MESSAGE =
    "Онлайн-заказы временно недоступны. Попробуйте позже.";

export const getOrganizationAvailability = (
    organization: Pick<Organization, "id" | "slug"> | null | undefined,
    availabilityByOrganizationId: Record<string, OrganizationAvailability>
) => {
    if (!organization) {
        return null;
    }

    return (
        availabilityByOrganizationId[organization.id] ??
        (organization.slug ? availabilityByOrganizationId[organization.slug] : null) ??
        null
    );
};

export const isOrganizationUnavailable = (
    organization: Pick<Organization, "id" | "slug"> | null | undefined,
    availabilityByOrganizationId: Record<string, OrganizationAvailability>
) => {
    const availability = getOrganizationAvailability(
        organization,
        availabilityByOrganizationId
    );

    return availability?.orders_available === false;
};

export const getUnavailableOrganizations = (
    organizations: Organization[],
    availabilityByOrganizationId: Record<string, OrganizationAvailability>
) => (
    organizations.filter((organization) =>
        isOrganizationUnavailable(organization, availabilityByOrganizationId)
    )
);
