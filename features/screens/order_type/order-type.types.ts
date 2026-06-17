import type {ImageSourcePropType} from "react-native";

import type {Coordinates} from "@/types/organization";
import type {DeliveryScheduleDay, DeliveryTimeSlot} from "@/store/delivery-store";

export type TakeawayRestaurant = {
    id: string;
    title: string;
    address: string;
    hours: string;
    hoursLines?: string[];
    distance: string;
    image: ImageSourcePropType | string;
    isUnavailable?: boolean;
    unavailableMessage?: string;
};

export type DeliveryScheduleMap = Record<DeliveryScheduleDay, DeliveryTimeSlot[]>;

export type {Coordinates};
export type {DeliveryScheduleDay, DeliveryTimeSlot};
