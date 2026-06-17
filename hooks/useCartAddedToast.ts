import {useCallback, useEffect, useRef, useState} from "react";
import {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import type {MenuItem} from "@/types/products";

export function useCartAddedToast() {
    const [toastMessage, setToastMessage] = useState("");
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toastProgress = useSharedValue(0);

    const toastAnimatedStyle = useAnimatedStyle(() => ({
        opacity: toastProgress.value,
        transform: [{translateY: (1 - toastProgress.value) * 12}],
    }));

    const showAddedToast = useCallback((item: MenuItem) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }

        setToastMessage(`Добавлено: ${item.name}`);
        toastProgress.value = withTiming(1, {duration: 160});

        toastTimerRef.current = setTimeout(() => {
            toastProgress.value = withTiming(0, {duration: 180});

            toastTimerRef.current = setTimeout(() => {
                setToastMessage("");
            }, 200);
        }, 1700);
    }, [toastProgress]);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    return {
        toastMessage,
        toastAnimatedStyle,
        showAddedToast,
    };
}
