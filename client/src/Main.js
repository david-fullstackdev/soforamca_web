'use strict'
import React, { Component } from 'react';
import logo from './logo.svg';

import ContentSave from 'material-ui/svg-icons/content/save';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { Tabs, Tab } from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import Sign from './Sign';
import Map from './Map';
import { encode, decode, getPosition, watchPosition, saveData, removeData, getData } from './common';
import { SOCKET_SEND, SOCKET_RECEIVE } from './api';
import { API } from "./api";
import $ from 'jquery'
import Controls from './Controls';
import {Lang} from './language';

import { connect } from 'react-redux';
import * as ACTION from './actions';
import io from 'socket.io-client';

window.socket = null;

class Main extends Component {
    constructor(props) {
        super(props);
    }

    findGetParameter(parameterName) {
        var result = null, tmp = [];
        window.location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
            });
        return result;
    }

    componentDidMount() {
        const dataStr = getData();
        try {

            var roomName = this.findGetParameter("room");
            var password = this.findGetParameter("password");
            if (roomName != null && password != null) {
                this.signin(roomName, password);
                return;
            }

            const userData = JSON.parse(decode(dataStr));
            this.signin(userData.room.roomName, userData.room.password, userData.user._id);
        } catch (e) {
            if (window.location.pathname != '/') {
                window.history.pushState(null, null, '/');
            }
        }
    }

    signin(roomName, password, userId) {
        var params = { roomName: roomName, password: password };
        if (userId) params.userId = userId;
        $.post(API.signin, params, function (result, status) {
            if (status === 'success' && !result.error) {
                this.savedData = result;
                result.room.password = password;
                saveData(result);
                this.props.loginSuccess();
                if (window.location.pathname !== '/' + roomName) {
                    window.history.pushState(null, null, '/' + roomName);
                }
                window.startChat(result);
            } else {
                removeData();
            }
        }.bind(this));
    }
    register(roomName, password) {
        $.post(API.register, { roomName: roomName, password: password }, function (result, status) {
            if (result.error) {
                alert('Roomname already used.');
            } else {
                this.signin(roomName, password);
            }
        }.bind(this));
    }
    render() {
        return (
            <MuiThemeProvider>
                <div style={{ width: '100vw', height: '100vh' }}>
                    <div id="map" style={{ width: '100vw', height: '100vh' }}></div>
                    <Map loggedin={this.props.loggedin} />
                    <Controls style={{ ...styles.overlay }} />
                    <div style={{ display: (!this.props.loggedin) ? '' : 'none', ...styles.overlay }}></div>
                    <div style={{ display: (!this.props.loggedin) ? '' : 'none', ...styles.sign }}><Sign signin={this.signin.bind(this)} register={this.register.bind(this)} /></div>
                </div>
            </MuiThemeProvider>
        );
    }
}

const styles = {
    textbox: {
        position: 'fixed',
        width: '100vw',
        left: 0, bottom: 10,
        background: '#e0e0e1',
    },
    setting: {
        position: 'absolute',
        left: 10, top: 70,
        padding: 10,
        borderRadius: 10,
        background: 'white',
        opacity: 0.8,
    },
    settingIcon: {
        position: 'absolute',
        left: 10, top: 10,
        borderRadius: 5,
        background: 'white',
        opacity: 0.7,
    },
    exploreIcon: {
        position: 'absolute',
        right: 10, top: 10,
        borderRadius: 5,
        background: 'white',
        opacity: 0.7,
    },
    profileContainer: {
        position: 'absolute',
        left: '50%', top: 0,
        transform: 'translateX(-50%)',
        background: 'url(' + require('./img/title_back.png') + ' no-repeat',
        width: 250,
        height: 70,
        display: 'block'
    },
    profile: {
        display: 'inline-block',
        position: 'fixed',
        top: '50%',
        left: '50%',
        fontSize: 20,
        transform: 'translate(-50%, -50%)',
        WebkitTansform: 'translate(-50%, -50%)',
        MozTansform: 'translate(-50%, -50%)',
        MsTansform: 'translate(-50%, -50%)',
        OTansform: 'translate(-50%, -50%)',
    },
    overlay: {
        position: 'fixed',
        left: 0, top: 0,
        width: '100vw', height: '100vh',
        background: 'black',
        opacity: 0.1,
        zIndex: 10000,
    },
    sign: {
        position: 'fixed',
        left: '50%', top: 80,
        transform: 'translatex(-50%)',
        WebkitTansform: 'translatex(-50%)',
        MozTansform: 'translatex(-50%)',
        MsTansform: 'translatex(-50%)',
        OTansform: 'translatex(-50%)',

        zIndex: 10001,
        width: '80%',
        maxWidth: 400,
    },
}

const mapStateToProps = state => state.loginState
const mapDispatchToProps = dispatch => ({
    loginSuccess: () => {
        dispatch({ type: ACTION.USER_LOGIN })
    },
    logoutSuccess: () => {
        dispatch({ type: ACTION.USER_LOGOUT })
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Main);

