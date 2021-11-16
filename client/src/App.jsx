import React, { Fragment, useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import Closet from './components/closet/Closet';
import Map from './components/map/Map';
import PrivateRoute from './components/routing/PrivateRoute';
import 'sanitize.css';
import './App.css';

// Redux
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';
import Sidebar from './components/layout/Sidebar';
import Trips from './components/trips/Trips';

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
              <PrivateRoute exact path="/map" component={Map} />
              <PrivateRoute exact path="/trips" component={Trips} />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;
