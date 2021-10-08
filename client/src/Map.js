'use strict'
import React, { Component } from 'react';
import { compose, withProps, lifecycle } from "recompose";
import Chat from './Chat';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, withHandlers, } from "react-google-maps";

var intervalID = setInterval(initMap, 200);

function initMap() {
    var center = window.center ? window.center : { lat: -25.363, lng: 131.044 };
    if (window.mapLoaded && document.getElementById('map')) {
        clearInterval(intervalID);
        window.map = new window.google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: center,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            panControl: false,
            streetViewControl: false,
            scaleControl: false,
            zoomControl: false,
            gestureHandling: 'greedy',
            zoomControlOptions: {
                position: window.google.maps.ControlPosition.LEFT_CENTER
            },
            fullscreenControl: false,
        });
    }
}

export default class Map extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        initMap();
    }

    render() {
        const { loggedin } = { ...this.props };
        return (
            <div>
                <Chat loggedin={loggedin} />
            </div>
        )
    }
}

