import $ from 'jquery';
export var encode = function (str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

export var decode = function (str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

var apiGeolocationSuccess = function (position) {
    alert("API geolocation success!\n\nlat = " + position.coords.latitude + "\nlng = " + position.coords.longitude);
};

var getPositionInterval = false;

export var getPosition = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                console.log("Here");
                var currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                if (getPositionInterval) clearInterval(getPositionInterval);
                getPositionInterval = false;
                if (window.positionCallback) window.positionCallback(null, currentLocation);
                if (!window.center && window.map) {
                    window.map.panTo(currentLocation)
                    window.center = currentLocation;
                }
            },
            function (error) {
                window.positionCallback(error);
                // if (!getPositionInterval) getPositionInterval = setInterval(getPosition, 1000);
            },
            { maximumAge: 0, enableHighAccuracy: true });
    }
};

var lastUpdated = Date.now();
var watchPositionInterval = false;
export var watchPosition = function () {
    if (navigator.geolocation) {
        var watchInterval = navigator.geolocation.watchPosition(
            function (position) {
                if ((Date.now() - lastUpdated) < 1000) return;
                lastUpdated = Date.now();
                var currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                if (watchPositionInterval) clearInterval(watchPositionInterval);
                watchPositionInterval = false;
                if (window.positionCallback) window.positionCallback(null, currentLocation);
                if (!window.center && window.map) {
                    window.map.panTo(currentLocation)
                    window.center = currentLocation;
                }
            },
            function (error) {
                window.positionCallback(error);
                // if (!watchPositionInterval) {
                //     watchPositionInterval = setInterval(watchPosition, 1000);
                // }
            },
            { maximumAge: 0, timeout: 1000, enableHighAccuracy: true, distanceFilter: 1 });
    }
}

export var saveData = function (data) {
    try {
        window.localStorage.setItem('data', encode(JSON.stringify(data)));
    } catch (e) {
        window.tempData = encode(JSON.stringify(data));
    }
}

export var removeData = function () {
    try {
        window.localStorage.removeItem('data');
    } catch (e) {
        window.tempData = false;
    }
}


export var getData = function () {
    try {
        return window.localStorage.getItem('data');
    }catch(e){
        return window.tempData;
    }
}
window.positionCallback = false;
