'use strict'
import React, { Component } from 'react';

import { createStore, compose } from 'redux';
import { Provider } from 'react-redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import reducers from './reducers';
import Main from './Main';

const store = createStore(
	reducers,
	undefined
);

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Main />
			</Provider>
		);
	}
}



