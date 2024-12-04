import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './redux/configStore';
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId="756561817069-u2oo3t659rvac9i4p67tun2q9ttt18sq.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </Provider>
);

reportWebVitals();
