import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import closet from './closet';
import trips from './trips';
import packingLists from './packingLists';

export default combineReducers({ alert, auth, profile, closet, trips, packingLists });
