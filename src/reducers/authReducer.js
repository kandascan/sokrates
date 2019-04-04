import { REGISTER, LOGIN, LOGOUT, SET_CURRENT_USER } from '../actions/types';

const initialState = {
    userId: null,
    session_id: null,
    session_key: null,
    expires_at: null,
    userLabel: null
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_CURRENT_USER:
            return {
                ...state,
                userId: action.payload.user.userId,
                userLabel: action.payload.user.label,
                expires_at: action.payload.expires_at
            }
        case REGISTER:
            return {
                ...state,
                userId: action.payload.user_id
            }
        case LOGIN:
            return {
                ...state,
                session_id: action.payload.session_id,
                session_key: action.payload.session_key,
                expires_at: action.payload.expires_at
            }
        case LOGOUT:
            return {
                ...state,
                userId: action.payload,
                session_id: action.payload,
                session_key: action.payload,
                expires_at: action.payload
            }
        default:
            return state;
    }
}
