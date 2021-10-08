import React, { Component } from 'react'
import { connect } from 'react-redux';
import * as ACTION from './actions';

import { Tabs, Tab } from 'material-ui/Tabs';
// From https://github.com/oliviertassinari/react-swipeable-views
import SwipeableViews from 'react-swipeable-views';
import TextField from 'material-ui/TextField';
import SocialGroupAdd from 'material-ui/svg-icons/social/group-add';
import SocialGroup from 'material-ui/svg-icons/social/group';
import RaisedButton from 'material-ui/RaisedButton';

class Sign extends Component {

    constructor(props) {
        super(props);
        this.state = {
            slideIndex: 0,
            roomnameError: false,
            passwordError: false,
            newRoomnameError: false,
            newPasswordError: false,
            confirmPasswordError: false,
            errorText: 'This field is required.',
            isLogin: true,
        };
    }
    handleChange = (value) => {
        this.setState({
            slideIndex: value,
        });
    };
    signin() {
        var roomname = this.refs.roomname.value;
        var password = this.refs.password.value;
        if (roomname == '') {
            this.setState({
                roomnameError: true,
                errorText: 'This field is required.',
            })
            return;
        }
        if (password == '') {
            this.setState({
                passwordError: true,
                errorText: 'This field is required.',
            })
            return;
        }
        this.props.signin(roomname, password);
    }
    register() {
        var roomname = this.refs.newRoomname.value;
        var password = this.refs.newPassword.value;
        var confirmPassword = this.refs.confirmPassword.value;
        if (roomname == '') {
            this.setState({
                newRoomnameError: true,
                errorText: 'This field is required.',
            })
            return;
        }
        if (password == '') {
            this.setState({
                newPasswordError: true,
                errorText: 'This field is required.',
            })
            return;
        }
        if (confirmPassword == '') {
            this.setState({
                confirmPasswordError: true,
                errorText: 'This field is required.',
            })
            return;
        }
        if (password !== confirmPassword) {
            this.setState({
                confirmPasswordError: true,
                errorText: 'Passwords don\'t match',
            })
            return;
        }
        this.props.register(roomname, password);
    }
    render() {
        return (
            <div>
                <div style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
                    <a className={'tab ' + (this.state.isLogin ? 'active' : '')} style={{ flex: 1 }} onClick={() => this.setState({ isLogin: true })}>{this.props.allState.langGroup.login}</a>
                    <a className={'tab ' + (!this.state.isLogin ? 'active' : '')} style={{ flex: 1 }} onClick={() => this.setState({ isLogin: false })}>{this.props.allState.langGroup.register}</a>
                </div>
                <div style={{ width: '100%', background: 'white', padding: 30, display: this.state.isLogin ? '' : 'none' }} >
                    <div className='form-group'>
                        <input className="form-control" type="text"
                            ref='roomname'
                            onChange={() => this.setState({ roomnameError: false })} placeholder={this.props.allState.langGroup.login_room_name}
                        />
                    </div>
                    <div className='form-group'>
                        <input className="form-control"
                            ref='password'
                            placeholder={this.props.allState.langGroup.password}
                            type='password'
                            onChange={() => this.setState({ passwordError: false })}
                        />
                    </div>
                    <div className='form-group'>
                        <input type="button" className='btn btn-block btn-success' value={this.props.allState.langGroup.signin} onClick={this.signin.bind(this)} />
                    </div>
                    <div className='form-group'>
                        <input type="button" style={{ ...styles.aboutus }} value={this.props.allState.langGroup.login_about_us} onClick={()=> window.location='/about-us'} />
                    </div>
                </div>
                <div style={{ width: '100%', background: 'white', padding: 30, display: !this.state.isLogin ? '' : 'none' }}>
                    <div className='form-group'>
                        <input className="form-control"
                            ref="newRoomname"
                            onChange={() => this.setState({ newRoomnameError: false })}
                            type="text"
                            placeholder={this.props.allState.langGroup.login_room_name} />
                    </div>
                    <div className='form-group'>
                        <input className="form-control"
                            ref='newPassword'
                            placeholder={this.props.allState.langGroup.password}
                            type='password'
                            onChange={() => this.setState({ newPasswordError: false })}
                        />
                    </div>
                    <div className='form-group'>
                        <input className="form-control"
                            ref='confirmPassword'
                            placeholder={this.props.allState.langGroup.confirm_pass}
                            type='password'
                            onChange={() => this.setState({ newPasswordError: false })}
                        />
                    </div>
                    <div className='form-group'>
                        <input type="button" className='btn btn-block btn-success' value={this.props.allState.langGroup.btn_register} onClick={this.register.bind(this)} />
                    </div>
                    <div className='form-group'>
                        <input type="button" style={{ ...styles.aboutus }} value={this.props.allState.langGroup.login_about_us} onClick={()=> window.location='/about-us'} />
                    </div>
                </div>
            </div>
        )
    }
}

const styles = {
    aboutus: {
        background: '#d8d8d8',
        color: '#fff',
        backgroundColor: '#d8d8d8',
        borderColor: '#dddddd',
        marginLeft: 'auto',
        marginRight: 0,
        float: 'right',
    },
}

const mapStateToProps = state => state
const mapDispatchToProps = dispatch => ({
    dispatch,
    onLanguageEnglish: () => {
        dispatch({ type: ACTION.LANGUAGE_ENGLISH});
    },
    onLanguageTurkish: () => {
        dispatch({ type: ACTION.LANGUAGE_TURKISH});
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Sign);