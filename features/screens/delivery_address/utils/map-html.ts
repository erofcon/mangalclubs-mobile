export const getMapHTML = (apiKey: string) => `
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

ymaps.ready(init);

function postMessage(payload) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
}

function init() {
    map = new ymaps.Map("map", {
        center: [43.3936, 43.9172],
        zoom: 15,
        controls: [],
        type: 'yandex#map',
        suppressMapOpenBlock: true,
        yandexMapDisablePoiInteractivity: true,
        behaviors: ['drag', 'scrollZoom', 'dblClickZoom']
    }, {
        searchControlProvider: 'yandex#search'
    });

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

    map.setCenter([latitude, longitude], currentZoom, {
        duration: 350,
        checkZoomRange: true
    });
}

window.moveMapTo = moveMapTo;
</script>

</body>
</html>
`;
