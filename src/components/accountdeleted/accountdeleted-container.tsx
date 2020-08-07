import React from 'react';

import { useAuth0 } from '../../lib/auth';
import { Button } from '../../components/button/button-container';
import logo from "../../images/logo-full.png";
import pendingApprovalImage from '../../images/pending-approval-image.png';
import './accountdeleted.scss';

const AccountDeleted: React.FC = () => {
    const {
        logout
    } = useAuth0();
    const logoutUser = async (e: React.MouseEvent) => {
        e.preventDefault()
        await logout();
    }
    return (
        <div className="accountdeleted">
            <div className="header header--static">
                <div className="accountdeleted__logo">
                    <img className="accountdeleted__logo__image" src={logo} />
                </div>
                <div className="accountdeleted__illustration">
                    <img src={pendingApprovalImage} alt="" />
                </div>
            </div>
            <div className="content">
                <p className="content__paragraph">
                    Your account has been deleted.
                </p>
                <p className="content__paragraph">
                    Please contact your supervisor for help.
                </p>
            </div>
            <div className="accountdeleted__cta">
                <Button
                    className="btn btn--primary btn--full-width"
                    onClick={logoutUser}
                    buttonText="Logout"
                />
            </div>
        </div>
    )
}

export default AccountDeleted;