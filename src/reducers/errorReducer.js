import { GET_ERROR, CLEAR_ERROR } from '../actions/types';

const initialState = {
    status: null,
    message: null
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_ERROR:
            return {
                ...state,
                status: action.payload.status,
                message: action.payload.message
            }
        case CLEAR_ERROR:
            return {
                ...state,
                status: null,
                message: null
            }
        default:
            return state;
    }
}