import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import Closet from './components/closet/Closet';
import PackingLists from './components/packing-list/PackingLists';
import PackingList from './components/packing-list/PackingList';
import Trips from './components/trips/Trips';
import Trip from './components/trips/Trip';
import PrivateRoute from './components/routing/PrivateRoute';
import 'sanitize.css';
import './App.css';

// Redux
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';
import Sidebar from './components/layout/Sidebar';

if (localStorage.token) {
	// Set auth header for private requests
	setAuthToken(localStorage.token);
}

const App = () => {
	useEffect(() => {
		store.dispatch(loadUser());
	}, []);

	return (
		<Provider store={store}>
			<Router>
				<Fragment>
					<Sidebar />
					<Route exact path="/" component={Landing} />
					<section className="container">
						<Alert />
						<Switch>
							<Route exact path="/register" component={Register} />
							<Route exact path="/login" component={Login} />
							<PrivateRoute exact path="/closet" component={Closet} />
							<PrivateRoute exact path="/packing-lists" component={PackingLists} />
							<PrivateRoute path="/packing-lists/:packingListId" component={PackingList} />
							<PrivateRoute exact path="/trips" component={Trips} />
							<PrivateRoute path="/trips/:tripId" component={Trip} />
						</Switch>
					</section>
				</Fragment>
			</Router>
		</Provider>
	);
};

export default App;
