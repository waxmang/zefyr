import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import garage from './garage';

export default combineReducers({ alert, auth, profile, garage });
