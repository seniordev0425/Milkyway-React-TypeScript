import React, { useEffect, useState, Fragment } from 'react';
import { useHistory } from 'react-router';

import './home.scss';

import { useAuth0 } from '../../lib/auth';
import { namespace } from "../../lib/getuserdetails";
import tasks from '../../images/tasks.png';
import audit from '../../images/audit.png';
import settings from '../../images/settings.png';
import reports from '../../images/reports.png';
import promotion from '../../images/promotion.png';
import { Button, LoadingButton } from '../../components/button/button-container';

import { getUser, getClient } from "../../lib/apiWrappers";
import homeImage from '../../images/home-illustration.png';

const Home: React.FC = () => {
    const history = useHistory();
    const {
        getIdTokenClaims
    } = useAuth0();
    const [userRole, setUserRole] = useState<string | undefined>(undefined);
    const [userName, setUserName] = useState(undefined);
    const [clientName, setClientName] = useState(undefined);
    const [clientLogo, setClientLogo] = useState(undefined);

    const initiateDetails = async () => {
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const claimsData = claims ?.[`${namespace}claims/`];
        const userRoles = claimsData ?.roles ?? [];
        // get the user role
        // if more than one role, select the one with highest authority
        let userFinalRole = undefined;
        // TODO: get a better way to store the possible roles
        for (let role of ['associate', 'manager', 'headquarter']) {
            if (userRoles.includes(role)) {
                userFinalRole = role;
            }
        }
        setUserRole(userFinalRole);
        const userId = claimsData ?.app_metadata ?.uid;
        const userDetails = await getUser(userId, idToken);
        const userName = userDetails ?.data ?.full_name;
        setUserName(userName);
        const clientDetails = await getClient(idToken);
        const clientName = clientDetails ?.data ?.name;
        const clientLogo = clientDetails ?.data ?.logo;
        setClientName(clientName);
        setClientLogo(clientLogo);
    }
    useEffect(() => {
        initiateDetails();
    }, [])
    return (
        <div className="content content--home home">
            <div className="content__header home__header">
                <div className="home__header__paragraph home__header__paragraph--greeting">
                    Welcome{
                        (userName) ?
                            `,` :
                            ""
                    }
                </div>
                {
                    (userName) ?
                        <div className="home__header__paragraph home__header__paragraph--name">
                            {userName}
                        </div>
                        :
                        <p></p>
                }
            </div>
            <div className="home__illustration">
                <div className="home__illustration__content">
                    <img className="client__illustration" src={homeImage} alt="" />
                </div>
                <div className="home__illustration__client">
                    {
                        (clientLogo) ?
                            <div className="home__illustration__client__logo">
                                <img className="client__logo" src={clientLogo} alt="" />
                            </div>
                            :
                            null
                    }
                    {
                        (clientName) ?
                            <div className="home__illustration__client__name">
                                {clientName}
                            </div> :
                            null
                    }
                </div>
            </div>
            <div className="content__content home__content home__content--cta">
                {
                    (userRole === "headquarter") &&
                        <div className="home__cta">
                            <Button
                                className="btn"
                                onClick={() => history.push("/auditschedules")}
                                buttonText={<Fragment>
                                                <div className="btn btn--primary btn--round">
                                                    <img src={audit}/>
                                                </div>
                                                <p>View and schedule audits</p>
                                            </Fragment>}
                            />
                        </div>
                }
                {
                    ((userRole === "manager") || (userRole === "associate")) &&
                        <div className="home__cta">
                            <Button
                                className="btn"
                                onClick={() => history.push("/audittasks")}
                                buttonText={<Fragment>
                                                <div className="btn btn--primary btn--round">
                                                    <img src={audit}/>
                                                </div>
                                                <p>Audit Tasks</p>
                                            </Fragment>}
                            />
                        </div>
                }
                <div className="home__cta">
                    <Button
                        className="btn"
                        onClick={() => history.push("/customtasks")}
                        buttonText={<Fragment>
                                        <div className="btn btn--primary btn--round">
                                            <img src={tasks}/>
                                        </div>
                                        <p>Custom tasks</p>
                                    </Fragment>}
                    />
                </div>
                <div className="home__cta">
                    <Button
                        className="btn"
                        onClick={() => history.push("/promotiontasks")}
                        buttonText={<Fragment>
                                        <div className="btn btn--primary btn--round">
                                            <img src={promotion}/>
                                        </div>
                                        <p>Promotion tasks</p>
                                    </Fragment>}
                    />
                </div>
                {
                    (userRole !== "associate") &&
                        <div className="home__cta">
                            <Button
                                className="btn"
                                onClick={() => history.push("/reportselectpre")}
                                buttonText={<Fragment>
                                                <div className="btn btn--primary btn--round">
                                                    <img src={reports}/>
                                                </div>
                                                <p>View reports</p>
                                            </Fragment>}
                            />
                        </div>
                }
                {
                    (userRole !== "associate") &&
                        <div className="home__cta">
                            <Button
                                className="btn"
                                onClick={() => history.push("/settings")}
                                buttonText={<Fragment>
                                                <div className="btn btn--primary btn--round">
                                                    <img src={settings}/>
                                                </div>
                                                <p>Settings</p>
                                            </Fragment>}
                            />
                        </div>
                }
            </div>
        </div>
    )
}

export default Home;