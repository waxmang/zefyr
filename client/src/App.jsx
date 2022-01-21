import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { ChakraProvider } from '@chakra-ui/react';

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
import background from './mtn_bg_trans1.png';

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
      <ChakraProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <Fragment>
              <Sidebar />
              <Routes>
                <Route exact path="/" element={<Landing />} />
              </Routes>
              <section className="container">
                <Alert />
                <Routes>
                  <Route exact path="/register" element={<Register />} />
                  <Route exact path="/login" element={<Login />} />
                  <Route path="/" element={<PrivateRoute />}>
                    <Route path="/closet" element={<Closet />} />
                    <Route path="packing-lists" element={<PackingLists />} />
                    <Route
                      path="packing-lists/:packingListId"
                      element={<PackingList />}
                    />
                    <Route path="trips" element={<Trips />} />
                    <Route path="trips/:tripId" element={<Trip />} />
                  </Route>
                </Routes>
              </section>
            </Fragment>
          </Router>
        </LocalizationProvider>
      </ChakraProvider>
    </Provider>
  );
};

export default App;
