import React, { useState } from 'react';
import { useHistory } from 'react-router';

import { useAuth0 } from '../../lib/auth';
import { namespace } from "../../lib/getuserdetails";
import { Button, LoadingButton } from '../../components/button/button-container';

import loadingIcon from '../../images/loading-2.gif';
import logo from "../../images/logo-full.png";
import illustration from "../../images/milkyway-illustration.jpeg";

import './login.scss';
import { Redirect } from 'react-router';

const Login: React.FC = () => {
    const history = useHistory();
    const {
        loginWithRedirect,
        isAuthenticated,
        getIdTokenClaims
    } = useAuth0();
    const onLoginClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        await loginWithRedirect()
    }
    const signupOptions = {
        initialScreen: 'signUp'
    };
    // TODO: Signup page is not being picked up by default
    const onSignupClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        await loginWithRedirect(signupOptions);
    }
    // TODO: Cannot move it to util since auth0 is a react hook
    const getUserRole = async () => {
        // get the user role
        const claims: any = await getIdTokenClaims();
        const claimsData = claims ?.[`${namespace}claims/`];
        const userRoles = claimsData ?.roles ?? [];
        // if more than one role, select the one with highest authority
        let userFinalRole = undefined;
        // TODO: get a better way to store the possible roles
        for (let role of ['associate', 'manager', 'headquarter']) {
            if (userRoles.includes(role)) {
                userFinalRole = role;
            }
        }
        return [claims, userFinalRole];
    }

    const getUserIdToken = async () => {
        const claims = await getIdTokenClaims();
        return claims.__raw;
    }

    const onAuth = async () => {
        const userFinalRoleData = await getUserRole();
        console.log(userFinalRoleData);
        // an user role exists
        if (!(userFinalRoleData[0])) {
            return;
        }
        const userFinalRole = userFinalRoleData[1];
        if (userFinalRole) {
            // redirect to home
            history.push("/home");
            return;
        }
        // Since user role doesn't exist, first get user details
        history.push("/registration");

    }
    if (isAuthenticated) {
        // TODO: redirect to the url the user got auth-walled instead of home all the time
        onAuth();
    }
    return (
        <div className="login">
            <div className="login__display">
                <div className="login__logo">
                    <img className="login__logo__image" src={logo} alt="" />
                </div>
                {/* <div className="login__illustration">
                    <img className="login__display__illustration__image" src={illustration} alt="" />
                </div> */}
            </div>
            <div className="login__action">
                <div className="login__login">
                    <Button
                        className="btn btn--primary btn--full-width"
                        onClick={onLoginClick}
                        buttonText="Login"
                    />
                </div>
                <div className="login__login">
                    <Button
                        className="btn btn--secondary btn--full-width"
                        onClick={onLoginClick}
                        buttonText="Register"
                    />
                </div>
                {/* <div className="login__register">
                    No account yet? <a href="" className="login__register__link" onClick={onSignupClick}>Register</a>
                </div> */}
            </div>
        </div>
    )
}

export default Login;