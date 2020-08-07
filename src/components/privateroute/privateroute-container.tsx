import React, { useEffect, useState } from "react";
import { Route } from "react-router-dom";
import {useHistory } from 'react-router';

import menu from '../../images/menu.svg';

import back from '../../images/back.png';

import { useAuth0 } from "../../lib/auth";
import EmailNotVerified from '../../components/emailnotverified/emailnotverified-container';
import Sidebar from "react-sidebar";
import { namespace } from "../../lib/getuserdetails";
import PendingApproval from "../pendingapproval/pendingapproval-container";

import SidebarContent from '../sidebarcontent/sidebarcontent-container';
import AccountDeleted from "../accountdeleted/accountdeleted-container";
import { OpenWithMobile } from "../../routes";
import rightArrow from "../../images/right.png";

const mql = window.matchMedia(`(min-width: 800px)`);

export const PrivateRoute: React.FC<any> = ({ component, path, title, isBack, backLink, ...rest }) => {
    const history = useHistory();

    const {
        isInitializing,
        isAuthenticated,
        loginWithRedirect,
        user,
        logout
    } = useAuth0();
    const [docked, setDocked] = useState(mql.matches);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useEffect(() => {
        mql.addListener(mediaQueryChanged);
    }, []);
    const mediaQueryChanged = () => {
        setDocked(mql.matches);
        setSidebarOpen(false);
    }
    const onSetOpen = (open: boolean) => {
        setSidebarOpen(open);
    }
    const toggleOpen = (ev: any) => {
        setSidebarOpen(!sidebarOpen);
        if (ev) {
            ev.preventDefault();
        }
    }

    useEffect(() => {
        if (isInitializing || isAuthenticated) {
            return;
        }

        // TODO: Better login by forwarding to the Login component (path /)
        const fn = async () => {
            await loginWithRedirect({
                appState: { targetUrl: path }
            });
        };
        fn();
    }, [isInitializing, isAuthenticated, loginWithRedirect, path]);
    const renderFn = (Component?: React.ComponentType) => (props: any) => {
        // if no component is provided, silently ignore
        if (!Component) {
            return null;
        }
        // if the user is authenticated with auth0
        if (isAuthenticated === true) {
            const emailVerified = user ?.email_verified ?? false;
            // if the user email is not verified, stop him right there
            if (emailVerified === false) {
                return (
                    <EmailNotVerified />
                )
            }
            const userData: any = user;
            const claimsData = userData ?.[`${namespace}claims/`];
            const userRoles = claimsData ?.roles ?? [];
            let userFinalRole = undefined;
            // TODO: get a better way to store the possible roles
            for (let role of ['associate', 'manager', 'headquarter']) {
                if (userRoles.includes(role)) {
                    userFinalRole = role;
                }
            }
            if (userFinalRole==='associate' && window.screen && window.screen.width >600) {
                return (
                    <OpenWithMobile />
                )
            }
            // if user has role, forward to home
            // required since /registration is a route that can be technically accessed directly
            // TODO: Hacky way to ensure that registration opens when pending
            if (title !== "Registration") {
                const isApproved = claimsData ?.app_metadata ?.is_approved ?? false;
                // TODO: Uncomment after registration flow is fine
                if (!(isApproved)) {
                    return (
                        <PendingApproval />
                    )
                }
                console.log(claimsData);
                const isDeleted = claimsData ?.app_metadata ?.is_deleted ?? false;
                console.log(isDeleted);
                if (isDeleted) {
                    return (
                        <AccountDeleted />
                    )
                }
            }
            const sidebar = <SidebarContent role={userFinalRole} handleLogout={async () => await logout()} />;

            const sidebarProps = {
                sidebar,
                docked: docked,
                open: sidebarOpen,
                onSetOpen: onSetOpen
            };

            return (
                <Sidebar {...sidebarProps}>
                    <div className="app__container">
                        <a
                            onClick={toggleOpen}
                            href="#"
                            className="app__mobile__stretch"
                        >
                            <img src={rightArrow}/>
                        </a>
                        <div className="app__header">
                            <div className="app__header__shade"></div>
                            <div className="app__header__content">
                                {
                                    (!docked) ?
                                        (isBack) ?
                                            <a
                                                onClick={()=>history.push(backLink)}
                                                className="app__header__menu"
                                            >
                                                <img className="app__header__menu__icon" src={back} />
                                            </a>
                                            :
                                            <a
                                                onClick={toggleOpen}
                                                href="#"
                                                className="app__header__menu"
                                            >
                                                <img className="app__header__menu__icon" src={menu} />
                                            </a>
                                        : null
                                }
                                <div className="app__header__title">
                                    {title}
                                </div>
                            </div>
                        </div>
                        <div className="app__content">
                            <Component {...props} />
                        </div>
                    </div>
                </Sidebar>
            );
        }
        return null;
    }

    return <Route path={path} render={renderFn(component)} {...rest} />
}