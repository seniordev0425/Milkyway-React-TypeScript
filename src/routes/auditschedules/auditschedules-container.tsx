import React, { useState, useEffect, Fragment } from 'react';
import { useHistory } from "react-router-dom";

import { useAuth0 } from '../../lib/auth';
import { REACT_APP_API_ENDPOINT, namespace } from '../../lib/getuserdetails';

import './auditschedules.scss';

const AuditSchedules: React.FC = () => {
    const history = useHistory();
    const {
        getIdTokenClaims
    } = useAuth0();
    const [auditSchedulesLoading, setAuditSchedulesLoading] = useState(false);
    const [auditSchedulesList, setAuditSchedulesList] = useState<any[]>([]);
    const [auditScheduleDays, setAuditSchedulesDays] = useState([
        {
            "key": "M",
            "value": "monday",
            "includes": false
        },
        {
            "key": "T",
            "value": "tuesday",
            "includes": false
        },
        {
            "key": "W",
            "value": "wednesday",
            "includes": false
        },
        {
            "key": "T",
            "value": "thursday",
            "includes": false
        },
        {
            "key": "F",
            "value": "friday",
            "includes": false
        },
        {
            "key": "S",
            "value": "saturday",
            "includes": false
        },
        {
            "key": "S",
            "value": "sunday",
            "includes": false
        }
    ]);
    const getAuditSchedules = async () => {
        setAuditSchedulesLoading(true);
        const claims: any = await getIdTokenClaims();
        const claimsData = claims ?.[`${namespace}claims/`];
        const idToken = claims.__raw;
        const userRoles = claimsData ?.roles ?? [];
        let userFinalRole = undefined;
        // TODO: get a better way to store the possible roles
        for (let role of ['associate', 'manager', 'headquarter']) {
            if (userRoles.includes(role)) {
                userFinalRole = role;
            }
        }
        if (userFinalRole !== 'headquarter') {
            history.push("/home");
        }
        const auditSchedulesEndpoint = REACT_APP_API_ENDPOINT + "/schedule-tasks";
        const response = await fetch(auditSchedulesEndpoint, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });
        const responseJson = await response.json();
        console.log(responseJson);
        if (responseJson.success) {
            setAuditSchedulesList(responseJson.data);
            // const effectiveDays = responseJson.data.effective_days;
            // const auditScheduleDaysCopy = [...auditScheduleDays];
            // for (let index in auditScheduleDays) {
            //     console.log(auditScheduleDays[index]);
            //     console.log(effectiveDays);
            //     if (effectiveDays.includes(auditScheduleDays[index].value)) {
            //         auditScheduleDaysCopy[index].includes = true;
            //     }
            // }
            // setAuditSchedulesDays(auditScheduleDaysCopy);
        }
        setAuditSchedulesLoading(false);
    }

    useEffect(() => {
        getAuditSchedules();
    }, []);

    if (auditSchedulesLoading) {
        return (
            <div className="content content--auditschedules auditschedules auditschedules--loading">
                <div className="loadingSpinner"></div>
            </div>
        )
    }
    return (
        <Fragment>
            <div className="content content--auditschedules auditschedules">
                <div className="content__header auditschedules__header">
                    <div className="auditschedules__title">

                    </div>
                    <div className="auditschedules__tasks">
                        <a className="auditschedules__tasks__link" href="/audittasks">See audit tasks</a>
                    </div>
                </div>
                <div className="content__content auditschedules__content">
                    {
                        (auditSchedulesList.length === 0) ?
                            <div className="auditschedules--empty">
                                No Audit schedules found
                            </div>
                            :
                            auditSchedulesList.map(auditschedule => {
                                return (
                                    <div className="auditschedules__item" key={auditschedule._id}>
                                        <a className="auditschedules__item__link"
                                            onClick={() => history.push(`/auditschedule/${auditschedule._id}`)}>
                                            <div className="auditschedules__item__title">
                                                {auditschedule ?.title}
                                            </div>
                                            <div className="auditschedules__item__days">
                                                {
                                                    auditScheduleDays.map(day => {
                                                        if (auditschedule.effective_days.includes(day.value)) {
                                                            return (
                                                                <div className="auditschedules__item__day auditschedules__item__day--active">
                                                                    {day.key}
                                                                </div>
                                                            )
                                                        }
                                                        return (
                                                            <div className="auditschedules__item__day auditschedules__item__day">
                                                                {day.key}
                                                            </div>
                                                        )
                                                    })

                                                }
                                            </div>
                                        </a>
                                    </div>
                                )
                            })
                    }
                </div>
            </div>
            <div className="content__cta auditschedules__cta">
                <div className="auditschedules__cta__item">
                    <button className="auditschedules__cta__button btn--primary btn" onClick={() => { history.push("/createauditschedule"); }}>
                        Create an audit schedule
                    </button>
                </div>
            </div>
        </Fragment>
    )
}

export default AuditSchedules;

