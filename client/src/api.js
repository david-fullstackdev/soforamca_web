export var API = {
    // signin: 'https://soforamca.herokuapp.com/room/signin',
    // register: 'https://soforamca.herokuapp.com/room/register',
    signin: '/room/signin',
    register: '/room/register',
};

export var SOCKET_SEND = {
    USER_CONNECT: 'user connect',
    CHANGE_NICK: 'change nick',
    SHARE_POSITION: 'share position',
    UNSHARE_POSITION: 'unshare position',
    INCOMING_MESSAGE: 'incoming message',
}

export var SOCKET_RECEIVE = {
    SERVER_ERROR: 'server error',
    USER_UPDATE: 'user update',
    NEW_MESSAGE: 'new message',
    SHARE_POSITION: 'share position',
    UNSHARE_POSITION: 'unshare position',
}
