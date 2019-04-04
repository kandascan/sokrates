import React from 'react';
import Moment from 'react-moment';

function Notes(props) {
    const notes = props.notes.map(note => (
        <tr key={note.name}>
            <td>{note.name}</td>
            <td>{note.text}</td>
            <td><Moment format="YYYY/MM/DD HH:MM:ss">{note.modified_at}</Moment></td>
        </tr>
    ))
    return (
        <table className="table table-striped table-bordered table-hover table-sm">
            <thead className="thead-dark">
                <tr>
                    <th scope="col">Nazwa</th>
                    <th scope="col">Opis</th>
                    <th scope="col">Data modyfikacji</th>
                </tr>
            </thead>
            <tbody>
                {notes !== null ? (notes) : (null)}
            </tbody>
        </table>
    )
}

export default Notes;
