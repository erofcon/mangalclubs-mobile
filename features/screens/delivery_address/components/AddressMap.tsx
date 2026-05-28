import React, {forwardRef, useImperativeHandle, useRef} from "react";
import {StyleSheet} from "react-native";

import {WebView} from "react-native-webview";

import {getMapHTML} from "../utils/map-html";

const apiKey = process.env.EXPO_PUBLIC_YANDEX_MAPS_API_KEY!;

type Props = {
    onCenterChanged?: (coords: {
        latitude: number;
        longitude: number;
        zoom?: number;
    }) => void;
    onMapReady?: () => void;
};

export type AddressMapRef = {
    moveTo: (latitude: number, longitude: number) => void;
};

export const AddressMap = forwardRef<AddressMapRef, Props>(
    ({onCenterChanged, onMapReady}, ref) => {
        const webViewRef = useRef<WebView>(null);

        useImperativeHandle(ref, () => ({
            moveTo(latitude, longitude) {
                webViewRef.current?.injectJavaScript(`
                    window.moveMapTo(${latitude}, ${longitude});
                    true;
                `);
            },
        }));

        return (
            <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{
                    html: getMapHTML(apiKey),
                }}
                style={styles.map}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
                bounces={false}
                onMessage={(event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);

                        if (data.type === "mapReady") {
                            onMapReady?.();
                            return;
                        }

                        if (data.type === "centerChanged") {
                            onCenterChanged?.({
                                latitude: data.latitude,
                                longitude: data.longitude,
                                zoom: data.zoom,
                            });
                        }
                    } catch {
                        // ignore malformed messages
                    }
                }}
            />
        );
    },
);

const styles = StyleSheet.create({
    map: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
});