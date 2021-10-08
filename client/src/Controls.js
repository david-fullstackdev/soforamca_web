import React, { Component } from 'react'

import IconButton from 'material-ui/IconButton';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import ActionExplore from 'material-ui/svg-icons/action/explore';
import ActionShare from 'material-ui/svg-icons/social/share';
import ActionExit from 'material-ui/svg-icons/action/exit-to-app';
import ActionHelp from 'material-ui/svg-icons/action/help';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import TextField from 'material-ui/TextField';
import { SOCKET_SEND, SOCKET_RECEIVE } from './api';
import { encode, decode, getPosition, watchPosition, removeData, getData } from './common';
import { connect } from 'react-redux';
import { Lang } from './language';
import * as ACTION from './actions';
import io from 'socket.io-client';

var reconnectInterval = false;
var firstConfirm = true;
var textArea;
class Controls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSetting: false,
        }
    }

    isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    createTextArea(text) {
        textArea = window.document.createElement('textArea');
        textArea.value = text;
        window.document.body.appendChild(textArea);
    }

    selectText() {
        var range, selection;

        if (this.isOS()) {
            range = window.document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }

    copyToClipboard() {
        window.document.execCommand('copy');
        window.document.body.removeChild(textArea);
    }

    shareLink() {
        const dataStr = getData();
        try {
            const userData = JSON.parse(decode(dataStr));
            var text = window.location.origin + "?room=" + userData.room.roomName + "&password=" + userData.room.password;
            this.createTextArea(text);
            this.selectText();
            this.copyToClipboard();
        } catch (e) {
        }

        alert("The share link was copied to the clipboard. Please invite your friends to this room.");
    }

    start(savedData) {
        window.positionCallback = function (error, location) {
            if (error) {
                if (this.props.loginState.loggedin && firstConfirm){
                    if (error.code===error.PERMISSION_DENIED){
                        firstConfirm = false;
                        window.alert('We´re not able to detect your location. \nPlease check your browser settings and make sure location sharing is enabled. \nThen reload the page.');
                        this.props.onUnshareLocation();
                    }else if (error.code === error.UNAVAILABLE){
                        firstConfirm = false;
                        window.alert('Your position is unavailable.');
                        this.props.onUnshareLocation();
                    }else{
                        getPosition();
                    }
                }
            } else {
                watchPosition();
                this.props.onChangeLocation(this.props.allState.currentLocation, location, this.props.allState.sharedLocation);
            }
        }.bind(this);

        getPosition();

        this.props.dispatch({ type: ACTION.SET_ROOMINFO, info: savedData })

        window.socket = io.connect(window.location.origin);
        // window.socket = io.connect('https://soforamca.herokuapp.com/');

        var connected = false;
        window.socket.on('connect', function () {
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
                reconnectInterval = false;
            }
            window.socket.emit(SOCKET_SEND.USER_CONNECT, { roomId: savedData.room._id, userId: savedData.user._id });
        }.bind(this));

        window.socket.on('disconnect', function (message) {
            if (reconnectInterval) return;
            reconnectInterval = setInterval(function () {
                window.socket.connect();
            }, 1000);
        }.bind(this));

        window.socket.on(SOCKET_RECEIVE.NEW_MESSAGE, function (data) {
            if (this.props.allState.info.room._id !== data.roomId) return;
            var users = this.props.allState.users;
            if (users[data.userId]) {
                console.log(users)
                users[data.userId].message = data.obj;
                this.props.dispatch({ type: ACTION.UPDATE_USERS, data: { users: users, lastUser: data.userId } });
            }
        }.bind(this));

        window.socket.on(SOCKET_RECEIVE.SHARE_POSITION, function (data) {
            if (this.props.allState.info.room._id !== data.roomId) return;
            var users = this.props.allState.users;
            if (!users[data.userId]) {
                users[data.userId] = {
                    userInfo: {
                        _id: data.userId,
                    },
                    message: false,
                }
            }
            users[data.userId].userInfo.lat = data.location.lat;
            users[data.userId].userInfo.lng = data.location.lng;
            users[data.userId].userInfo.sharedLocation = true;
            this.props.dispatch({ type: ACTION.UPDATE_USERS, data: { users: users } });
        }.bind(this));

        window.socket.on(SOCKET_RECEIVE.UNSHARE_POSITION, function (data) {
            if (this.props.allState.info.room._id !== data.roomId) return;
            var users = this.props.allState.users;
            if (!users[data.userId]) {
                users[data.userId] = {
                    userInfo: {
                        _id: data.userId,
                    },
                    message: false,
                }
            }
            users[data.userId].userInfo.sharedLocation = false;
            this.props.dispatch({ type: ACTION.UPDATE_USERS, data: { users: users } });
        }.bind(this));

        window.socket.on(SOCKET_RECEIVE.USER_UPDATE, function (data) {
            if (this.props.allState.info.room._id !== data.roomId) return;
            if (!connected) {
                connected = true;
                if (this.props.allState.currentLocation) {
                    window.socket.emit(SOCKET_SEND.SHARE_POSITION, this.props.allState.currentLocation);
                }
            }
            this.props.dispatch({ type: ACTION.UPDATE_USERS, data: { users: data.users } });
        }.bind(this));

        window.socket.on(SOCKET_RECEIVE.SERVER_ERROR, function (data) {
            if (this.props.allState.info.room._id !== data.roomId) return;
            if (this.props.allState.info.user._id !== data.userId) return;
        }.bind(this));
    }

    componentDidMount() {
        window.startChat = this.start.bind(this);

        const language = window.localStorage.getItem('language');
        if (language == null || language == 'tur') {
            this.props.onLanguageTurkish();
        } else {
            this.props.onLanguageEnglish();
        }
    }

    handleSwitch(event, isInputChecked) {
        if (!this.props.allState.sharedLocation) {
            this.props.onShareLocation(this.props.allState.currentLocation);
        } else {
            this.props.onUnshareLocation();
        }
    }

    switchLanguage() {
        if (this.props.allState.language == 'tur') {
            this.props.onLanguageEnglish();
        } else {
            this.props.onLanguageTurkish();
        }
        window.langGroup = Lang[this.props.allState.language];
    }

    logout() {
        removeData();
        window.socket = undefined;
        window.location = "/";
    }
    typing(event) {
        if (event.target.value == "") return;
        if (event.key === 'Enter') {
            var message = window.socket.emit(SOCKET_SEND.INCOMING_MESSAGE, { message: event.target.value });
            event.target.value = '';
        }
    }
    sendMessage() {
        var message = window.socket.emit(SOCKET_SEND.INCOMING_MESSAGE, { message: this.refs.messagebox.value });
        this.refs.messagebox.value = '';
    }
    render() {
        const sharedText = 'You are sharing';
        const unsharedText = 'You are not sharing';
        const infoText = Object.keys(this.props.allState.users).length + ' ' + this.props.allState.langGroup.online_users;
        return (
            <div style={{ display: (this.props.loginState.loggedin) ? '' : 'none', }}>
                <div style={{ ...styles.textbox }}>
                    <div style={{ display: 'flex', flexDirection: 'row', margin: '5px 10px' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                ref='messagebox'
                                type={'text'} placeholder={this.props.allState.langGroup.say_something} style={{
                                    padding: '0 20px',
                                    outline: 'none',
                                    border: 0,
                                    borderRadius: 50,
                                    width: 'calc(100% - 40px)',
                                    height: 36
                                }}
                                onKeyPress={this.typing}
                            />
                        </div>
                        <div>
                            <IconButton
                                iconStyle={{ width: 30, height: 30 }}
                                style={{ width: 36, height: 36, padding: 3, marginLeft: 10 }}
                                onClick={this.sendMessage.bind(this)}
                            >
                                <img width={30} height={30} src={require('./img/send.png')} />
                            </IconButton>
                        </div>
                    </div>
                </div>
                <div style={{ ...styles.settingIcon }}>
                    <IconButton
                        iconStyle={{ width: 26, height: 26 }}
                        style={{ width: 36, height: 36, padding: 3 }}
                        onClick={() => this.setState({ showSetting: !this.state.showSetting })}
                    >
                        <ActionSettings color={'#1c8eee'} />
                    </IconButton>
                </div>
                <div style={{ ...styles.exploreIcon }}>
                    <IconButton
                        iconStyle={{ width: 26, height: 26 }}
                        style={{ width: 36, height: 36, padding: 3 }}
                        onClick={() => {
                            if (window.map) {
                                window.map.panTo(this.props.allState.currentLocation)
                            }
                        }}
                    >
                        <ActionExplore color={'#1c8eee'} />
                    </IconButton>
                </div>
                <div style={{ ...styles.shareIcon }}>
                    <IconButton
                        iconStyle={{ width: 26, height: 26 }}
                        style={{ width: 36, height: 36, padding: 3 }}
                        onClick={() => {
                            this.shareLink()
                        }}
                    >
                        <ActionShare color={'#1c8eee'} />
                </IconButton>
                </div>

                <div style={{ display: (this.state.showSetting) ? '' : 'none', ...styles.setting }}>
                    <center style={{ fontWeight: 600, color: '#1c8eee' }}>{this.props.allState.langGroup.room_name + ': ' + window.location.pathname.substring(1)}</center>
                    <div style={{ display: 'flex', width: '100%' }}>
                        <ul style={{ color: '#1c8eee', margin: 0, paddingLeft: 20, width: 210 }}>
                            <li style={{ marginBottom: 10, color: this.props.allState.sharedLocation ? '#1ba920' : '#ff6666' }}>
                                <div style={{width: '65%', float: 'left'}}>
                                {this.props.allState.sharedLocation ? this.props.allState.langGroup.share_location : this.props.allState.langGroup.not_share_location}
                                </div>
                                <div style={{width: '35%', float: 'left'}}>
                                    <Toggle
                                        ref='shareLocation'
                                        toggled={this.props.allState.sharedLocation}
                                        onToggle={this.handleSwitch.bind(this)}
                                        style={{ width: 50, marginLeft: 10, marginTop: 10 }}
                                    />
                                </div>
                                        <div style={{clear: 'both'}}></div>
                            </li>
                            <li>{infoText}</li>
                            <li style={{marginTop: '8px'}}>
                                <div style={{width: '65%', float: 'left'}}>
                                    {(this.props.allState.language=='tur')?'Turkish':'English'}
                                </div>
                                <div style={{width: '35%', float: 'left', marginTop:'-11px'}}>
                                    <Toggle
                                        ref='language'
                                        toggled={(this.props.allState.language=='tur')?true:false}
                                        onToggle={this.switchLanguage.bind(this)}
                                        style={{ width: 50, marginLeft: 10, marginTop: 10 }}
                                        />
                                </div>
                                <div style={{clear: 'both'}}></div>
                            </li>
                        </ul>

                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', paddingTop: 10, }}>
                        <div style={{ flex: 1 }}>&nbsp;</div>
                        <FlatButton
                            label={this.props.allState.langGroup.out_room}
                            labelStyle={{ color: '#1c8eee' }}
                            icon={<ActionExit color={'#1c8eee'} />}
                            onClick={this.logout}
                            fullWidth={true}
                            />
                        <div style={{ flex: 1 }}>&nbsp;</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', paddingTop: 10, }}>
                        <div style={{ flex: 1 }}>&nbsp;</div>
                        <FlatButton
                            label={this.props.allState.langGroup.about_us}
                            labelStyle={{ color: '#1c8eee' }}
                            fullWidth={true}
                            onClick={()=> window.location='/about-us'}
                        />
                        <div style={{ flex: 1 }}>&nbsp;</div>
                    </div>
                </div>
                <div style={{ ...styles.profileContainer }}>
                    <div style={styles.profile}>
                        <div style={{ float: 'left' }}><img src={require('./img/avatar.png')} width={50} /></div>
                        <div style={{ float: 'left', maxWidth: 60, marginLeft: 10, color: 'grey' }}>
                            <div>şoför</div>
                            <div>amca</div>
                        </div>
                    </div>
                </div>
                <div >
                </div>
            </div>
        )
    }
}

const styles = {
    textbox: {
        position: 'fixed',
        width: '100vw',
        left: 0, bottom: 30,
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
    shareIcon: {
        position: 'absolute',
        right: 10, top: 50,
        borderRadius: 5,
        background: 'white',
        opacity: 0.7,
    },
    profileContainer: {
        position: 'absolute',
        left: '50%', top: 0,
        transform: 'translateX(-50%)',
        WebkitTransform: 'translateX(-50%)',
        MozTransform: 'translateX(-50%)',
        OTransform: 'translateX(-50%)',
        MsTransform: 'translateX(-50%)',
        background: 'url(' + require('./img/title_back.png') + ') no-repeat',
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
    thumbOff: {
        backgroundColor: '#ffcccc',
    },
    trackOff: {
        backgroundColor: '#ff9d9d',
    },
    thumbSwitched: {
        backgroundColor: '#ff4444',
    },
    trackSwitched: {
        backgroundColor: '#ff9d9d',
    },
}

const mapStateToProps = state => state
const mapDispatchToProps = dispatch => ({
    dispatch,
    onChangeLocation: (oldLocation, newLocation, isShared) => {
        if (oldLocation) {
            if (oldLocation.lat === newLocation.lat && oldLocation.lng === newLocation.lng) return;
        }
        dispatch({ type: ACTION.CHANGE_LOCATION, currentLocation: newLocation });
        if (window.socket && isShared) {
            window.socket.emit(SOCKET_SEND.SHARE_POSITION, newLocation);
        }
    },
    onShareLocation: (location) => {
        dispatch({ type: ACTION.SHARE_LOCATION });
        if (window.socket) {
            window.socket.emit(SOCKET_SEND.SHARE_POSITION, location);
        }
    },
    onUnshareLocation: () => {
        if (window.socket) {
            dispatch({ type: ACTION.UNSHARE_LOCATION });
            window.socket.emit(SOCKET_SEND.UNSHARE_POSITION);
        }
    },
    onLanguageEnglish: () => {
        dispatch({ type: ACTION.LANGUAGE_ENGLISH});
    },
    onLanguageTurkish: () => {
        dispatch({ type: ACTION.LANGUAGE_TURKISH});
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Controls);