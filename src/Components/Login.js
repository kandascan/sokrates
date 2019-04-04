import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../actions/authActions';
import { clearError } from '../actions/errorActions';
import TextFieldGroup from './TextFieldGroup';
import ErrorAlert from './ErrorAler';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    }
  }

  componentWillMount = () => {
    this.props.clearError();
  }

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      email: this.state.email,
      password: this.state.password
    };
    this.props.login(user, this.props.history);
  }

  render() {
    const { email, password } = this.state;
    const { error } = this.props;

    return (
      <div className="container">
        {error.message !== null && error.status !== null ? (<ErrorAlert error={error} />) : (null)}
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form noValidate className="form-signin" onSubmit={this.handleSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Logowanie</h1>
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
              <button className="btn btn-lg btn-primary btn-block" type="submit">Zaloguj się</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

LoginForm.propType = {
  error: PropTypes.object.isRequired,
  login: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  error: state.error
});
export default connect(mapStateToProps, { login, clearError })(withRouter(LoginForm));