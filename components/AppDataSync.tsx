import {useEffect, useRef} from "react";

import {useAppDataStore} from "@/store/app-data-store";
import {useDeliveryStore} from "@/store/delivery-store";

const AVAILABILITY_POLL_INTERVAL = 60000;

export function AppDataSync() {
    const orderType = useDeliveryStore((state) => state.type);
    const takeawayRestaurantId = useDeliveryStore((state) => state.takeawayRestaurantId);
    const isInitialized = useAppDataStore((state) => state.isInitialized);
    const refreshMenuForCurrentOrder = useAppDataStore((state) => state.refreshMenuForCurrentOrder);
    const refreshOrganizationAvailability = useAppDataStore((state) => state.refreshOrganizationAvailability);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        void refreshMenuForCurrentOrder();
    }, [
        isInitialized,
        orderType,
        refreshMenuForCurrentOrder,
        takeawayRestaurantId,
    ]);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        let controller: AbortController | null = null;

        const refreshAvailability = () => {
            controller?.abort();
            controller = new AbortController();

            void refreshOrganizationAvailability(controller.signal);
        };

        refreshAvailability();

        const intervalId = setInterval(
            refreshAvailability,
            AVAILABILITY_POLL_INTERVAL
        );

        return () => {
            clearInterval(intervalId);
            controller?.abort();
        };
    }, [isInitialized, refreshOrganizationAvailability]);

    return null;
}
