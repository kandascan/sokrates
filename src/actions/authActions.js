import { REGISTER, LOGIN, LOGOUT, GET_ERROR, SET_CURRENT_USER } from "./types";
import {
  CapiClient,
  UserSignup,
  SessionCreate,
  SessionInfo
} from "../thirdParty/rekrClient";
import API_URL from '../config';

export const getCurrentSession = (history) => dispatch => {
  const { session_id, session_key, expires_at } = localStorage;
  const expireTime = Date.parse(expires_at);
  const timeNow = Date.now();
  if(expireTime < timeNow){
    dispatch(logout(history));
  }
  const client = new CapiClient(API_URL);
  client
    .withSession(session_id, session_key)
    .executeSingle(new SessionInfo())
    .then(response => {
      if (response.status === 200) {
        dispatch({
          type: SET_CURRENT_USER,
          payload: response.data
        })
      }
      else {
        dispatch({
          type: GET_ERROR,
          payload: response
        });
        dispatch(logout(history));
        dispatch({
          type: SET_CURRENT_USER,
          payload: {user: {}}
        })
      }
    });
}

export const logout = history => dispatch => {
  localStorage.removeItem("user_id");
  localStorage.removeItem("session_id");
  localStorage.removeItem("session_key");
  localStorage.removeItem("expires_at");
  dispatch({
    type: LOGOUT,
    payload: null
  });
  history.push("/login");
};

export const login = (user, history) => dispatch => {
  const client = new CapiClient(API_URL);
  client
    .withLogin(user.email, user.password)
    .executeSingle(new SessionCreate())
    .then(response => {
      if (response.status === 200) {
        localStorage.setItem("session_id", response.data.session_id);
        localStorage.setItem("session_key", response.data.session_key);
        localStorage.setItem("expires_at", response.data.expires_at);
        dispatch({
          type: LOGIN,
          payload: response.data
        });
        history.push("/");
      } else {
        dispatch({
          type: GET_ERROR,
          payload: response
        });
      }
    });
};

export const register = (user, history) => dispatch => {
  if (user.password !== user.confirmePassword) {
    dispatch({
      type: GET_ERROR,
      payload: { status: 404, message: "Proszę wprowadzić takie samo hasło!" }
    });
  } else {
    const client = new CapiClient(API_URL);
    client
      .executeSingle(new UserSignup(user.email, user.password))
      .then(response => {
        if (response.status === 200) {
          localStorage.setItem("user_id", response.data.user_id);
          dispatch({
            type: REGISTER,
            payload: response.data
          });
          history.push("/login");
        } else {
          dispatch({
            type: GET_ERROR,
            payload: response
          });
        }
      });
  }
};
