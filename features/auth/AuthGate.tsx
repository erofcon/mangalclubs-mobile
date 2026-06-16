import {PropsWithChildren, useEffect} from "react";

import {refreshProfileIfNeeded, useProfileStore} from "@/store/profile-store";

import {AuthSheetHost} from "./components/AuthSheetHost";

export function AuthGate({children}: PropsWithChildren) {
    const hasHydrated = useProfileStore((state) => state.hasHydrated);
    const refreshToken = useProfileStore((state) => state.refreshToken);

    useEffect(() => {
        if (!hasHydrated || !refreshToken) {
            return;
        }

        refreshProfileIfNeeded().catch(() => undefined);
    }, [hasHydrated, refreshToken]);

    return (
        <>
            {children}
            <AuthSheetHost />
        </>
    );
}
