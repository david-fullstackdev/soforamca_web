import React, { Component } from 'react'
import { SOCKET_RECEIVE, SOCKET_SEND } from './api';
import { encode, decode } from './common';
import $ from 'jquery'
import io from 'socket.io-client';

import { connect } from 'react-redux';
import * as ACTION from './actions';

const markers = {};
const infoBoxs = {};
const lastMessages = {};
var zIndex = 1;

function topMessage(lastUser){
    var marker = markers[lastUser];
    var infoBox = infoBoxs[lastUser];
    if (marker && infoBox){
        if (zIndex!=infoBox.getZIndex()){
            infoBox.setZIndex((++zIndex));
            marker.setZIndex((zIndex));
        }
    }
}
function addMessage(userId, icon, position, message, zIndex = 0) {
    var marker = markers[userId];
    var infoBox = infoBoxs[userId];
    var lastMessage = lastMessages[userId];

    var infoboxContent = '  <table cellPadding="0" cellSpacing="0">' +
        '                   <tbody>' +
        '                       <tr>' +
        '                           <td><img src="' + require('./img/message-left.png') + '" width="24" height="40" /></td>' +
        '                           <td class="message" style="">' + (message ? message.message : "") + '</td>' +
        '                           <td><img src="' + require('./img/message-right.png') + '" width="18" height="40" /></td>' +
        '                       </tr>' +
        '                   </tbody>' +
        '               </table >';
    var latlng = new window.google.maps.LatLng(position.lat, position.lng);
    if (marker) {
        marker.setPosition(latlng);
        marker.setIcon(icon);
    } else {
        marker = new window.google.maps.Marker({
            position: latlng,
            map: window.map,
            icon: icon,
            zIndex: 0,
        });
        markers[userId] = marker;
    }
    if (infoBox && message) {
        if (lastMessage!==message.message) {
            infoBox.setContent(infoboxContent);
            lastMessages[userId] = message.message;
        }            
    } else {
        if (message) {
            var infoboxOptions = {
                content: infoboxContent,
                pixelOffset: new window.google.maps.Size(2, -13),
                alignBottom: true,
                position: latlng,
                closeBoxMargin: "-15px -20px 0px 0px",
                closeBoxURL: '',
                zIndex: 0,
                disableAutoPan: true
            };
            infoBox = new window.InfoBox(infoboxOptions);
            infoBoxs[userId] = infoBox;
            infoBox.open(window.map, marker);
            lastMessages[userId] = message.message;
        }
    }
}

function removeMessage(userId){
    if (infoBoxs[userId]){
        infoBoxs[userId].close();
        delete infoBoxs[userId];
    }
    if (lastMessages[userId]){
        delete lastMessages[userId];
    }
    if (markers[userId]){
        markers[userId].setMap(null);
        delete markers[userId];
    }
}
class Chat extends Component {

    render() {
        var users = $.map(this.props.users, function (value, index) {
            return [value];
        });
        if (window.map) {
            users.forEach(function (user) {
                if (user.userInfo._id !== this.props.info.user._id) {
                    if (user.userInfo.sharedLocation) {
                        addMessage(user.userInfo._id, require('./img/mark-blue.png'), user.userInfo, user.message);
                    }else{
                        removeMessage(user.userInfo._id);
                    }
                } else {
                    if (this.props.sharedLocation) {
                        addMessage(user.userInfo._id, require('./img/mark-green.png'), this.props.currentLocation, user.message);
                    }else{
                        addMessage(user.userInfo._id, require('./img/mark-disable.png'), this.props.currentLocation, user.message);
                    }
                }
            }.bind(this));
            topMessage(this.props.lastUser)
            var messageKeys = Object.keys(markers);
            messageKeys.forEach(function(userId){
                if (!this.props.users[userId]){
                    removeMessage(userId);
                }
            }.bind(this));
        }
        return (<div></div>)
    }
}

const mapStateToProps = state => state.allState

export default connect(mapStateToProps, false)(Chat);