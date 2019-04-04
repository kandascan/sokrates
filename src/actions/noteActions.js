import { GET_NOTES, GET_ERROR } from './types';
import {
  CapiClient,
  NoteList,
  NoteTake
} from "../thirdParty/rekrClient";
import API_URL from '../config';

export const createNote = (note) => dispatch => {
  const { session_id, session_key } = localStorage;
  const client = new CapiClient(API_URL);
  client
  .withSession(session_id, session_key)
  .executeSingle(new NoteTake(note.name, note.text))
  .then(response => {
      if (response.status !== 204) {
          dispatch({
            type: GET_ERROR,
            payload: response
          });
      }
      if (response.status === 204) {
        dispatch(getNotes());
    }
  });
}

export const getNotes = () => dispatch => {
  const { session_id, session_key } = localStorage;

  const client = new CapiClient(API_URL);
  client
    .withSession(session_id, session_key)
    .executeSingle(new NoteList())
    .then(response => {
      if (response.status === 200) {
        dispatch({
          type: GET_NOTES,
          payload: response.data.results
        });
      }
      else {
        dispatch({
          type: GET_ERROR,
          payload: response
        });
      }
    });
};