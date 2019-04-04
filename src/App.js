import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import NavBar from './Components/NavBar';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';

class App extends Component {
  render() {
    return (
      <Provider store={ store } >
        <BrowserRouter>
        <div>
          <NavBar/>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />     
          <Route exact path="/register" component={Register} />     
        </div>
      </BrowserRouter>
    </Provider>
    );
  }
}

export default App;
