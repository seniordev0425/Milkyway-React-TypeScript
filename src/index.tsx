
import React from 'react';
import ReactDOM from 'react-dom';


import * as serviceWorker from './serviceWorker';
import App from './components/app/app-container';
import { Auth0Provider } from './lib/auth';
import history from './lib/history';
require('typeface-poppins');

// @TODO Debug why .env is not being consumed
const auth0Domain = "dev-8-wmxelo.au.auth0.com";
const auth0ClientId = "C0fnTzKwUtktJNglwWCVVt1tB4phXGO7";
const auth0RedirectUri = window.location.origin;

if (
    auth0Domain === undefined
    || auth0ClientId === undefined
) {
    throw new Error('missing env vars')
}

const onAuthRedirectCallback = (redirectResult?: RedirectLoginResult) => {
    console.log(
        'auth0 onRedirectCallback called with redirectState %o',
        redirectResult
    )

    // Clears auth0 query string parameters from url
    const targetUrl = redirectResult
        && redirectResult.appState
        && redirectResult.appState.targetUrl
        ? redirectResult.appState.targetUrl
        : window.location.pathname

    history.push(targetUrl)
}

ReactDOM.render(
    (
        <Auth0Provider
            domain={auth0Domain}
            client_id={auth0ClientId}
            redirect_uri={auth0RedirectUri}
            onRedirectCallback={onAuthRedirectCallback}
        >
            <App />
        </Auth0Provider>
    ),
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
