import React from 'react';
import { useAuth0 } from '../../lib/auth';
import { Button } from '../../components/button/button-container';

import logo from "../../images/logo-full.png";

import './openwithmobile.scss';

const OpenWithMobile: React.FC = () => {
    const {
        logout
    } = useAuth0();
    const logoutUser = async (e: React.MouseEvent) => {
        e.preventDefault()
        await logout();
    }
    return (
        <div className="login">
            <div className="login__display">
                <div className="login__logo">
                    <img className="login__logo__image" src={logo} alt="" />
                </div>
            </div>
            <div className="openwithmobile__message">
                <h4>Please use Mobile Device to use the app</h4>
                <Button className="btn btn--primary" onClick={logoutUser} buttonText="Logout"/>
            </div>
        </div>
    )
}

export default OpenWithMobile;