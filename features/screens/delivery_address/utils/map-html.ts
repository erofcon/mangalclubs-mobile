import type {DeliveryArea} from "@/services/delivery-zones";
import type {Coordinates} from "@/utils/location-config";

const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

export const getMapHTML = (
    apiKey: string,
    deliveryArea: DeliveryArea | null | undefined,
    initialCenter: Coordinates
) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
/>

<style>
html, body, #map {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #ffffff;
}

</style>

<script src="https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU"></script>
</head>

<body>

<div id="map"></div>

<script>
let map;
const deliveryArea = ${safeJson(deliveryArea ?? null)};
const initialCenter = ${safeJson({
    latitude: initialCenter.latitude,
    longitude: initialCenter.longitude,
})};

ymaps.ready(init);

function postMessage(payload) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
}

function init() {
    map = new ymaps.Map("map", {
        center: [initialCenter.latitude, initialCenter.longitude],
        zoom: 15,
        controls: [],
        type: 'yandex#map',
        suppressMapOpenBlock: true,
        yandexMapDisablePoiInteractivity: true,
        behaviors: ['drag', 'scrollZoom', 'dblClickZoom']
    }, {
        searchControlProvider: 'yandex#search'
    });

    drawDeliveryArea(deliveryArea);

    map.behaviors.enable([
        'drag',
        'multiTouch',
        'dblClickZoom',
        'pinchZoom',
        'scrollZoom'
    ]);

    postMessage({
        type: 'mapReady'
    });

    sendCenter();

    map.events.add('actionend', () => {
        sendCenter();
    });
}

function ringToYandexCoordinates(ring) {
    if (!Array.isArray(ring)) return [];

    return ring
        .map((point) => {
            if (!Array.isArray(point) || point.length < 2) return null;

            const longitude = Number(point[0]);
            const latitude = Number(point[1]);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

            return [latitude, longitude];
        })
        .filter(Boolean);
}

function drawDeliveryArea(area) {
    if (!map || !area || !Array.isArray(area.coordinates)) return;

    const polygons = area.type === 'Polygon'
        ? [area.coordinates]
        : area.coordinates;

    polygons.forEach((polygonCoordinates) => {
        const rings = (polygonCoordinates || [])
            .map(ringToYandexCoordinates)
            .filter((ring) => ring.length >= 3);

        if (!rings.length) return;

        const polygon = new ymaps.Polygon(rings, {}, {
            fillColor: '#ECAC1833',
            strokeColor: '#ECAC18',
            strokeWidth: 2,
            strokeOpacity: 0.95,
            interactivityModel: 'default#transparent',
        });

        map.geoObjects.add(polygon);
    });
}

function sendCenter() {
    if (!map) return;

    const center = map.getCenter();

    postMessage({
        type: 'centerChanged',
        latitude: center[0],
        longitude: center[1],
        zoom: map.getZoom()
    });
}

function moveMapTo(latitude, longitude) {
    if (!map) return;

    const currentZoom = map.getZoom();

    const targetCenter = [Number(latitude), Number(longitude)];

    if (!Number.isFinite(targetCenter[0]) || !Number.isFinite(targetCenter[1])) {
        return;
    }

    map.setCenter(targetCenter, Math.max(currentZoom, 16), {
        duration: 350,
        checkZoomRange: true
    }).then(sendCenter, sendCenter);
}

window.moveMapTo = moveMapTo;
</script>

</body>
</html>
`;
