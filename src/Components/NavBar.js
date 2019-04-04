import React, { Component } from 'react'
import { Link, NavLink } from 'react-router-dom';
import { withRouter } from "react-router-dom";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logout } from '../actions/authActions';

class NavBar extends Component {
  constructor(props) {
    super(props);
  }
  onLogoutClick = (e) => {
    e.preventDefault();
    this.props.logout(this.props.history);
    window.location.href = '/login';
  }

  render() {
    const { userLabel } = this.props.auth;
    return (
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">Home</Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#mobile-nav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mobile-nav">
            <ul className="navbar-nav ml-auto">
              {userLabel !== null && userLabel !== undefined ? (
                <React.Fragment>
                  <li className="nav-item">
                    <a className="nav-link">{userLabel}</a>
                  </li>
                  <li className="nav-item">
                    <a href="" onClick={this.onLogoutClick} className="nav-link" to="/login">
                      <span className="oi oi-account-logout"></span>{' '}Wyloguj
                    </a>
                  </li>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/register">Rejestracja</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/login">Logowanie</NavLink>
                  </li>
                </React.Fragment>
                 )}
            </ul>
          </div>
        </div>
      </nav>
    )
  }
}

NavBar.propType = {
  auth: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  error: state.error,
  auth: state.auth
});

export default connect(mapStateToProps, { logout })(withRouter(NavBar));
