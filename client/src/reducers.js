import { combineReducers } from 'redux'
import * as ACTIONS from './actions';
import {Lang} from './language';

const initialState = {
    language: 'tur',
    langGroup: Lang.tur,
    sharedLocation: true,
    currentLocation: { lat: 0, lng: 0 },
    users: {},
    info: {
        room: {},
        user: {},
    },
    flag: false,
    lastUser: false,
}

const allState = (state = initialState, action) => {
    switch (action.type) {
        case ACTIONS.UPDATE_USERS:
            return {
                ...state,
                ...action.data,
                flag: !state.flag
            }
        case ACTIONS.SHARE_LOCATION:
            return {
                ...state,
                sharedLocation: true,
            }
        case ACTIONS.UNSHARE_LOCATION:
            return {
                ...state,
                sharedLocation: false,
            }
        case ACTIONS.CHANGE_LOCATION:
            return {
                ...state,
                currentLocation: action.currentLocation,
            }
        case ACTIONS.SET_ROOMINFO:
            return {
                ...state,
                info: action.info,
            }
        case ACTIONS.LANGUAGE_ENGLISH:
            window.localStorage.setItem('language', 'en');
            return {
                ...state,
                language: 'en',
                langGroup: Lang.en,
            }
        case ACTIONS.LANGUAGE_TURKISH:
            window.localStorage.setItem('language', 'tur');
            return {
                ...state,
                language: 'tur',
                langGroup: Lang.tur,
            }
        default:
            return state
    }
}

const loginInitialState = {
    loggedin: false,
}

const loginState = (state = loginInitialState, action) => {
    switch (action.type) {
        case ACTIONS.USER_LOGIN:
            return {
                ...state,
                loggedin: true,
            }
        case ACTIONS.USER_LOGOUT:
            return {
                ...state,
                loggedin: false,
            }
        default:
            return state
    }
}

export default combineReducers({
    allState,
    loginState
});