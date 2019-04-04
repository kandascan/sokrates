import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { clearError } from "../actions/errorActions";
import { getCurrentSession } from "../actions/authActions";
import { getNotes, createNote } from "../actions/noteActions";
import { withRouter } from "react-router-dom";
import TextFieldGroup from "../Components/TextFieldGroup";
import ErrorAlert from "./ErrorAler";
import Notes from "./Notes";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      text: ""
    };
  }

  componentWillMount = () => {
    this.props.clearError();
    this.props.getCurrentSession(this.props.history);
    this.props.getNotes();
  };

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const note = {
      name: this.state.name,
      text: this.state.text
    };
    this.props.createNote(note);
    this.setState({
      name: "",
      text: ""
    });
  };

  render() {
    const { error, note } = this.props;
    const { name, text } = this.state;

    return (
      <div className="container">
        {error.message !== null && error.status !== null ? (
          <ErrorAlert error={error} />
        ) : null}
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form
              noValidate
              className="form-signin"
              onSubmit={this.handleSubmit}
            >
              <h1 className="h3 mb-3 font-weight-normal">Add Note</h1>
              <div className="form-row">
                <div className="col">
                  <TextFieldGroup
                    type="name"
                    id="name"
                    onChange={this.handleChange}
                    value={name}
                    placeholder="Nazwa notatki"
                  />{" "}
                </div>
                <div className="col">
                  <TextFieldGroup
                    type="text"
                    id="text"
                    onChange={this.handleChange}
                    value={text}
                    placeholder="Opis notatki"
                  />{" "}
                </div>
              </div>

              <button
                className="btn btn-lg btn-primary btn-block"
                type="submit"
              >
                Dodaj notatke
              </button>
            </form>
          </div>
        </div>
        <hr />
        <Notes notes={note.notes} />
        <nav aria-label="Page navigation example">
          <ul className="pagination justify-content-center">
            <li className="page-item disabled">
              <a className="page-link" href="#" tabIndex="-1">
                Previous
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                1
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                2
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                3
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

Home.propType = {
  error: PropTypes.object.isRequired,
  note: PropTypes.object.isRequired,
  clearError: PropTypes.func.isRequired,
  getCurrentSession: PropTypes.func.isRequired,
  getNotes: PropTypes.func.isRequired,
  createNote: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  error: state.error,
  auth: state.auth,
  note: state.note
});

export default connect(
  mapStateToProps,
  { clearError, getCurrentSession, getNotes, createNote }
)(withRouter(Home));
