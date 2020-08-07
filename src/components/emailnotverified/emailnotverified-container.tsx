import React from 'react';

import { useAuth0 } from '../../lib/auth';
import { Redirect } from 'react-router';

import { Button } from '../../components/button/button-container';

import './emailnotverified.scss';

import logo from "../../images/logo-full.png";
import emailVerificationImage from '../../images/email-verification-image.png';

const EmailNotVerified: React.FC = (props) => {
    let userEmail: string | undefined = "your email";
    const {
        user,
        logout
    } = useAuth0();
    const logoutUser = async (e: React.MouseEvent) => {
        e.preventDefault()
        await logout();
    }
    const emailVerified = user ?.email_verified ?? false;
    userEmail = user ?.email;
    if (emailVerified) {
        // TODO: check if this may bring infinite loop in any corner case
        return (
            <Redirect to="/" />
        )
    }
    return (
        <div className="emailnotverified content">
            <div className="header header--static">
                <div className="emailnotverified__logo">
                    <img className="emailnotverified__logo__image" src={logo} />
                </div>
                <div className="emailnotverified__illustration">
                    <img src={emailVerificationImage} alt="" />
                </div>
            </div>
            <div className="content">
                <p className="content__paragraph">
                    We have sent an email verification link to {userEmail}.
                </p>
                <p className="content__paragraph">
                    Please verify your email before proceeding.
                </p>
            </div>
            <div className="pendingapproval__cta">
                <Button
                    className="btn btn--primary btn--full-width"
                    onClick={logoutUser}
                    buttonText="Logout"
                />
            </div>
        </div>
    )
}

export default EmailNotVerified;