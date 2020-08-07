import React, { useEffect, useState } from 'react';
import './settings.scss';

import { useAuth0 } from '../../lib/auth';

import defaultAvatar from '../../images/default-avatar-v2.svg';
import { Button, LoadingButton } from '../../components/button/button-container';
import { useHistory } from "react-router-dom";

import UserSnippet from '../../components/usersnippet/usersnippet-container';

import { namespace, REACT_APP_API_ENDPOINT } from "../../lib/getuserdetails";
import { fetchGetApi, fetchPutApi, convertToFromNow, getStoreDetails } from '../../lib/apiWrappers'

const Settings: React.FC = () => {
    const history = useHistory();
    const {
        getIdTokenClaims
    } = useAuth0();
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
    const [userApprovalLoading, setUserApprovalLoading] = useState(false);
    const [userDeletionLoading, setUserDeletionLoading] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(false);

    const getUsers = async () => {
        setSettingsLoading(true);
        const claims: any = await getIdTokenClaims();
        const claimsData = claims ?.[`${namespace}claims/`];
        const userRoles = claimsData ?.roles ?? [];
        let userFinalRole = undefined;
        // TODO: get a better way to store the possible roles
        for (let role of ['associate', 'manager', 'headquarter']) {
            if (userRoles.includes(role)) {
                userFinalRole = role;
            }
        }
        if (userFinalRole === "associate") {
            history.push("/home");
            return null;
        }
        let managedRole = "associate";
        if (userFinalRole === "headquarter") {
            managedRole = "manager";
        }
        const idToken = claims.__raw;
        const getPendingUsersEndPoint = `${REACT_APP_API_ENDPOINT}/users/?pendingApproval=true&role=${managedRole}`;
        const responseJsonPendingUsers = await fetchGetApi(getPendingUsersEndPoint, idToken);
        if (responseJsonPendingUsers.success) {
            setPendingUsers(responseJsonPendingUsers.data);
        }
        const getApprovedUsersEndPoint = `${REACT_APP_API_ENDPOINT}/users/?pendingApproval=false&role=${managedRole}`;
        const responseJsonApprovedUsers = await fetchGetApi(getApprovedUsersEndPoint, idToken);
        if (responseJsonApprovedUsers.success) {
            setApprovedUsers(responseJsonApprovedUsers.data);
        }
        setSettingsLoading(false);
    }

    const handleUserApprovalLoading = async (userId: string) => {
        setUserApprovalLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const userApprovalEndPoint = `${REACT_APP_API_ENDPOINT}/user/${userId}/approve`;
        const responseUserApproval = await fetchPutApi(userApprovalEndPoint, idToken, {});
        if (responseUserApproval.success) {
            setUserApprovalLoading(false);
        }
    }

    const handleClickUserDelete = async (userId: string) => {
        setUserDeletionLoading(true);
    }

    useEffect(() => {
        getUsers();
    }, [userApprovalLoading]);

    if (settingsLoading) {
        return (
            <div className="content content--settings settings settings--loading">
                <div className="loadingSpinner"></div>
            </div>
        )
    }

    return (
        <div className="content content--settings settings">
            {/* <HeaderWithBack
                label="settings"
                backLabel="Home"
                backLink="/home"
                title="Settings"
            /> */}
            <div className="content__content settings__content">
                <div className="settings__users">
                    {
                        (pendingUsers.length > 0) ?
                            <div className="users users--pending">
                                <div className="users__title users__title--pending">
                                    Pending users
                                </div>
                                <div className="users__list users__list--pending">
                                    {
                                        pendingUsers.map(user => {
                                            return (
                                                <UserSnippet
                                                    userType="pending"
                                                    userId={user ?._id}
                                                    userImage={user ?.image}
                                                    userFullName={user ?.full_name}
                                                    userUpdatedAt={user ?.updated_at}
                                                    getUsers={getUsers}
                                                />
                                                // <div className="userdetails userdetails--pending" key={user ?._id}>
                                                //     <div className="userdetails__personal">
                                                //         <div className="userdetails__personal__left">
                                                //             {
                                                //                 (user ?.image) ?
                                                //                     null
                                                //                     // TODO: When user picture is added, use this
                                                //                     :
                                                //                     <img src={defaultAvatar} alt="" />
                                                //             }

                                                //         </div>
                                                //         <div className="userdetails__personal__right">
                                                //             <div className="userdetails__personal__right__top">
                                                //                 <div className="userdetails__name">
                                                //                     {user ?.full_name}
                                                //                 </div>
                                                //                 <div className="userdetails__time">
                                                //                     {convertToFromNow(user ?.updated_at)}
                                                //                 </div>
                                                //             </div>
                                                //         </div>
                                                //     </div>
                                                //     <div className="userdetails__cta">
                                                //         {
                                                //             (userApprovalLoading) ?
                                                //                 <LoadingButton
                                                //                     className="btn btn--primary btn--full-width"
                                                //                     onClick={() => { return null; }}
                                                //                 /> :
                                                //                 <Button
                                                //                     className="btn btn--primary btn--full-width"
                                                //                     onClick={() => handleUserApprovalLoading(user ?._id)}
                                                //                     buttonText="Approve"
                                                //                 />
                                                //         }
                                                //     </div>
                                                // </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            :
                            <div className="users users--pending">
                                <div className="users__title users__title--pending">
                                    Pending users
                                </div>
                                <div className="users__list users__list__empty users__list__empty--pending">
                                    No pending users found
                                </div>
                            </div>

                    }
                    {
                        (approvedUsers.length > 0) ?
                            <div className="users users--approved">
                                <div className="users__title users__title--approved">
                                    Approved users
                                </div>
                                <div className="users__list users__list--approved">
                                    {
                                        approvedUsers.map(user => {
                                            return (
                                                <UserSnippet
                                                    userType="approved"
                                                    userId={user ?._id}
                                                    userImage={user ?.image}
                                                    userFullName={user ?.full_name}
                                                    userUpdatedAt={user ?.updated_at}
                                                    getUsers={getUsers}
                                                />
                                                // <div className="userdetails userdetails--approved">
                                                //     <div className="userdetails__personal">
                                                //         <div className="userdetails__personal__left">
                                                //             {
                                                //                 (user ?.image) ?
                                                //                     null
                                                //                     // TODO: When user picture is added, use this
                                                //                     :
                                                //                     <img src={defaultAvatar} alt="" />
                                                //             }

                                                //         </div>
                                                //         <div className="userdetails__personal__right">
                                                //             <div className="userdetails__personal__right__top">
                                                //                 <div className="userdetails__name">
                                                //                     {user ?.full_name}
                                                //                 </div>
                                                //                 <div className="userdetails__time">
                                                //                     {convertToFromNow(user ?.updated_at)}
                                                //                 </div>
                                                //             </div>
                                                //         </div>
                                                //     </div>
                                                //     <div className="userdetails__cta">
                                                //         {
                                                //             (userDeletionLoading) ?
                                                //                 <LoadingButton
                                                //                     className="btn btn--danger"
                                                //                     onClick={() => { return null; }}
                                                //                 /> :
                                                //                 <Button
                                                //                     className="btn btn--danger"
                                                //                     onClick={() => handleClickUserDelete(user ?._id)}
                                                //                     buttonText="Delete"
                                                //                 />
                                                //         }
                                                //     </div>
                                                // </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            :
                            <div className="users users--approved">
                                <div className="users__title users__title--approved">
                                    Approved users
                                </div>
                                <div className="users__list users__list__empty users__list__empty--approved">
                                    No active users found
                                </div>
                            </div>

                    }

                    <div className="users__approved">
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings;