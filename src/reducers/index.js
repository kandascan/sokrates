import { combineReducers } from 'redux';
import authReducer from './authReducer';
import errorReducer from './errorReducer';
import noteReducer from './noteReducer';

export default combineReducers({
   auth: authReducer,
   error: errorReducer,
   note: noteReducer
});