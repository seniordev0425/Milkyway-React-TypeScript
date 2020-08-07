import React from 'react';

import { useAuth0 } from '../../lib/auth';
import { Button } from '../../components/button/button-container';
import logo from "../../images/logo-full.png";
import pendingApprovalImage from '../../images/pending-approval-image.png';
import './pendingapproval.scss';

const PendingApproval: React.FC = () => {
    const {
        logout
    } = useAuth0();
    const logoutUser = async (e: React.MouseEvent) => {
        e.preventDefault()
        await logout();
    }
    return (
        <div className="pendingapproval">
            <div className="header header--static">
                <div className="pendingapproval__logo">
                    <img className="pendingapproval__logo__image" src={logo} />
                </div>
                <div className="pendingapproval__illustration">
                    <img src={pendingApprovalImage} alt="" />
                </div>
            </div>
            <div className="content">
                <p className="content__paragraph">
                    You have been registered.
                </p>
                <p className="content__paragraph">
                    Your account is yet to be approved, sit tight!
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

export default PendingApproval;