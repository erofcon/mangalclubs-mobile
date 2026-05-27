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
}

#center-pin {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 28px;
    height: 28px;
    transform: translate(-50%, -100%);
    z-index: 999;
    pointer-events: none;
}

.pin {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: #E5483B;
    border: 5px solid rgba(229,72,59,0.25);
    box-sizing: border-box;
}
</style>

<script src="https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU"></script>
</head>

<body>

<div id="map"></div>

<div id="center-pin">
    <div class="pin"></div>
</div>

<script>
let map;

ymaps.ready(init);

function init() {
    map = new ymaps.Map("map", {
        center: [43.3936, 43.9172],
        zoom: 15,
        controls: []
    });

    map.behaviors.enable([
        'drag',
        'multiTouch',
        'dblClickZoom',
        'pinchZoom'
    ]);

    sendCenter();

    map.events.add('actionend', () => {
        sendCenter();
    });
}

function sendCenter() {
    const center = map.getCenter();

    window.ReactNativeWebView.postMessage(
        JSON.stringify({
            type: 'centerChanged',
            latitude: center[0],
            longitude: center[1]
        })
    );
}

function moveTo(latitude, longitude) {
    map.setCenter([latitude, longitude], 16, {
        duration: 300
    });
}

window.moveTo = moveTo;
</script>

</body>
</html>
`;