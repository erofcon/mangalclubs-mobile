import {router, usePathname} from "expo-router";
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ActivityIndicator,
    Animated,
    Easing,
    StyleSheet,
    View,
} from "react-native";

type NavigationLoadingContextValue = {
    hideLoading: () => void;
    showLoading: (options?: {minDuration?: number; maxDuration?: number}) => void;
};

const NavigationLoadingContext =
    createContext<NavigationLoadingContextValue | null>(null);

const INITIAL_DURATION = 850;
const MIN_NAVIGATION_DURATION = 520;
const MAX_NAVIGATION_DURATION = 2400;

export function NavigationLoadingProvider({
                                              children,
                                          }: PropsWithChildren) {

    const pathname = usePathname();

    const [visible, setVisible] = useState(true);

    const fadeValue = useRef(
        new Animated.Value(1),
    ).current;

    const hideTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const maxTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const minVisibleUntilRef =
        useRef(Date.now() + INITIAL_DURATION);

    const pendingNavigationRef =
        useRef(true);

    const pathnameRef =
        useRef(pathname);

    const originalRouterRef = useRef<{
        back: typeof router.back;
        push: typeof router.push;
        replace: typeof router.replace;
    } | null>(null);

    const clearTimers = useCallback(() => {

        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }

        if (maxTimerRef.current) {
            clearTimeout(maxTimerRef.current);
            maxTimerRef.current = null;
        }

    }, []);

    const hideLoading = useCallback(() => {

        const delay = Math.max(
            minVisibleUntilRef.current - Date.now(),
            0,
        );

        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }

        hideTimerRef.current = setTimeout(() => {

            pendingNavigationRef.current = false;

            fadeValue.stopAnimation();

            Animated.timing(fadeValue, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start(({finished}) => {

                if (finished) {
                    setVisible(false);
                }

            });

        }, delay);

    }, [fadeValue]);

    const showLoading = useCallback(
        (
            options?: {
                minDuration?: number;
                maxDuration?: number;
            },
        ) => {

            const minDuration =
                options?.minDuration ??
                MIN_NAVIGATION_DURATION;

            const maxDuration =
                options?.maxDuration ??
                MAX_NAVIGATION_DURATION;

            clearTimers();

            pendingNavigationRef.current = true;

            minVisibleUntilRef.current =
                Date.now() + minDuration;

            fadeValue.stopAnimation();

            fadeValue.setValue(1);

            setVisible(true);

            maxTimerRef.current =
                setTimeout(() => {
                    hideLoading();
                }, maxDuration);

        },
        [
            clearTimers,
            fadeValue,
            hideLoading,
        ],
    );

    useEffect(() => {

        const routeChanged =
            pathnameRef.current !== pathname;

        pathnameRef.current = pathname;

        if (
            !pendingNavigationRef.current &&
            !routeChanged
        ) {
            return;
        }

        const frame =
            requestAnimationFrame(() => {
                hideLoading();
            });

        return () =>
            cancelAnimationFrame(frame);

    }, [
        hideLoading,
        pathname,
    ]);

    useEffect(() => {

        if (!originalRouterRef.current) {

            originalRouterRef.current = {
                back: router.back.bind(router),
                push: router.push.bind(router),
                replace:
                    router.replace.bind(router),
            };

        }

        const originalRouter =
            originalRouterRef.current;

        router.push = (
            (...args) => {

                showLoading();

                return originalRouter.push(
                    ...args,
                );

            }
        ) as typeof router.push;

        router.replace = (
            (...args) => {

                showLoading();

                return originalRouter.replace(
                    ...args,
                );

            }
        ) as typeof router.replace;

        router.back = (
            (...args) => {

                showLoading({
                    minDuration: 360,
                });

                return originalRouter.back(
                    ...args,
                );

            }
        ) as typeof router.back;

        return () => {

            router.push =
                originalRouter.push;

            router.replace =
                originalRouter.replace;

            router.back =
                originalRouter.back;

        };

    }, [showLoading]);

    useEffect(() => {

        return () => {
            clearTimers();
        };

    }, [clearTimers]);

    const contextValue = useMemo(
        () => ({
            hideLoading,
            showLoading,
        }),
        [
            hideLoading,
            showLoading,
        ],
    );

    return (
        <NavigationLoadingContext.Provider
            value={contextValue}
        >

            {children}

            {visible ? (

                <Animated.View
                    pointerEvents="auto"
                    style={[
                        styles.overlay,
                        {
                            opacity:
                            fadeValue,
                        },
                    ]}
                >

                    <ActivityIndicator
                        size={42}
                        color="#ECAC18"
                    />

                </Animated.View>

            ) : null}

        </NavigationLoadingContext.Provider>
    );
}

export function useNavigationLoading() {

    const context =
        useContext(
            NavigationLoadingContext,
        );

    if (!context) {

        throw new Error(
            "useNavigationLoading must be used inside NavigationLoadingProvider",
        );

    }

    return context;

}

const styles = StyleSheet.create({

    overlay: {
        ...StyleSheet.absoluteFillObject,

        zIndex: 10000,

        elevation: 10000,

        alignItems: "center",

        justifyContent: "center",

        backgroundColor: "#000000",
    },

});