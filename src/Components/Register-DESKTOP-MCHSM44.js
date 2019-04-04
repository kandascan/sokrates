import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import TextFieldGroup from "./TextFieldGroup";
import { register } from "../actions/authActions";
import { clearError } from "../actions/errorActions";

class RegisterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: null,
      confirmePassword: ""
    };
  }

  componentWillMount = () => {
    this.props.clearError();
  };

  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();

    const user = {
      email: this.state.email,
      password: this.state.password,
      confirmePassword: this.state.confirmePassword
    };
    this.props.register(user, this.props.history);
  };

  render() {
    const { email, password, confirmePassword } = this.state;
    const { error } = this.props;

    return (
      <div className="container">
        {error.message !== null && error.status !== null ? (
          <div className="alert alert-danger" role="alert">
            <span>Kod błędu: {error.status}</span> - {error.message}
          </div>
        ) : null}
        <div className="row justify-content-center">
          <div className="col-4">
            <form
              noValidate
              className="form-signin"
              onSubmit={this.handleSubmit}
            >
              <h1 className="h3 mb-3 font-weight-normal">Zarejestruj się</h1>
              <TextFieldGroup
                type="email"
                id="email"
                onChange={this.handleChange}
                value={email}
                placeholder="Adres email"
              />
              <TextFieldGroup
                type="password"
                id="password"
                onChange={this.handleChange}
                value={password}
                placeholder="Hasło"
              />
              <TextFieldGroup
                type="password"
                id="confirmePassword"
                onChange={this.handleChange}
                value={confirmePassword}
                placeholder="Powtórz hasło"
              />
              <button
                className="btn btn-lg btn-primary btn-block"
                type="submit"
              >
                Rejestracja
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

RegisterForm.propType = {
  error: PropTypes.object.isRequired,
  register: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  error: state.error
});

export default connect(
  mapStateToProps,
  { register, clearError }
)(withRouter(RegisterForm));
