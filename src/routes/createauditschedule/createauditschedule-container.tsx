import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import cogoToast from 'cogo-toast';
import { useAuth0 } from '../../lib/auth';
import './createauditschedule.scss';
import { LoadingButton, Button } from '../../components/button/button-container';
import { REACT_APP_API_ENDPOINT } from '../../lib/getuserdetails';
import { useHistory } from 'react-router';
import moment from 'moment';
import { getUTCTime, getCurrentTimeZone } from '../../utility/time.utility';

const CreateAuditSchedule: React.FC = () => {
    const history = useHistory();
    const {
        getIdTokenClaims
    } = useAuth0();
    const [createAuditScheduleLoading, setCreateAuditScheduleLoading] = useState(false);
    const [auditScheduleTitle, setAuditScheduleTitle] = useState("");
    const [auditScheduleStartTime, setAuditScheduleStartTime] = useState(new Date());
    const [auditScheduleEndTime, setAuditScheduleEndTime] = useState(new Date());
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
    const handleClickEffectiveDay = (index: number) => {
        const auditScheduleDaysCopy = [...auditScheduleDays];
        auditScheduleDaysCopy[index].includes = (!(auditScheduleDaysCopy[index].includes));
        setAuditSchedulesDays(auditScheduleDaysCopy);
        console.log(index);
        return null;
    }
    const handleClickCreateAuditSchedule = async () => {
        console.log("trying to create audit schedule");
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;

        // validate inputs
        setCreateAuditScheduleLoading(true);
        if (auditScheduleTitle == "") {
            cogoToast.error("Please provide a title for the Audit schedule");
            setCreateAuditScheduleLoading(false);
            return;
        }
        const submitcreteAuditScheduleEndPoint = `${REACT_APP_API_ENDPOINT}/schedule-task`;
        const effectiveDays = [];
        for (let day of auditScheduleDays) {
            if (day.includes) {
                effectiveDays.push(day.value);
            }
        }
        const startTime = auditScheduleStartTime.toLocaleTimeString([], { hour12: false });
        const endTime = auditScheduleEndTime.toLocaleTimeString([], { hour12: false });
        const toPostBody = {
            "title": auditScheduleTitle,
            "start_time": getUTCTime(startTime),
            "end_time": getUTCTime(endTime),
            "effective_days": effectiveDays
        };
        const submitCreateAuditScheduleEndPointResponse = await fetch(submitcreteAuditScheduleEndPoint, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(toPostBody)
        });
        console.log(toPostBody);
        const auditScheduleCreateResult = await submitCreateAuditScheduleEndPointResponse.json();
        console.log(auditScheduleCreateResult);
        if (auditScheduleCreateResult.success) {
            setCreateAuditScheduleLoading(false);
            cogoToast.success(`Audit Schedule created`);
        }
        if ((!auditScheduleCreateResult) || !(auditScheduleCreateResult.success)) {
            cogoToast.error(`The audit schedule could not be created`);
            setCreateAuditScheduleLoading(false);
            return;
        }
        if (auditScheduleCreateResult.data.scheduleTaskId) {
            history.push(`/auditschedule/${auditScheduleCreateResult.data.scheduleTaskId}`);
            return;
        }
        setCreateAuditScheduleLoading(false);
    }
    return (
        <div className="createauditschedule">
            <div className="createauditschedule__content">
                <div className="createauditschedule__content__item">
                    <label className="pure-material-textfield-outlined">
                        <input placeholder=" "
                            value={auditScheduleTitle}
                            onChange={(e) => setAuditScheduleTitle(e.target.value)}
                            onBlur={(e) => setAuditScheduleTitle(e.target.value)}
                        />
                        <span>Title</span>
                    </label>
                </div>
                <div className="createauditschedule__content__item createauditschedule__content__item--time">
                    <div className="createauditschedule__content__item--starttime">
                        <div className="createauditschedule__content__item__title">
                            Start time ({getCurrentTimeZone()})
                        </div>
                        <div className="createauditschedule__content__item__content">
                            <DatePicker
                                selected={auditScheduleStartTime}
                                onChange={(date: any) => setAuditScheduleStartTime(date)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                timeCaption="time"
                                dateFormat="h:mm aa"
                            />
                        </div>
                    </div>
                    <div className="createauditschedule__content__item--endtime">
                        <div className="createauditschedule__content__item__title">
                            End time ({getCurrentTimeZone()})
                        </div>
                        <div className="createauditschedule__content__item__content">
                            <DatePicker
                                selected={auditScheduleEndTime}
                                onChange={(date: any) => setAuditScheduleEndTime(date)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                timeCaption="time"
                                dateFormat="h:mm aa"
                            />
                        </div>
                    </div>
                </div>
                <div className="createauditschedule__content__item createauditschedule__content__item--days">
                    <div className="createauditschedule__content__item--days__title">
                        Effective days
                    </div>
                    <div className="createauditschedule__content__item__days createauditschedule__content__item--days__content">
                        {
                            auditScheduleDays.map((day, index) => {
                                if (day.includes) {
                                    return (
                                        <div className="createauditschedule__content__item__day createauditschedule__content__item__day--active"
                                            onClick={() => handleClickEffectiveDay(index)}>
                                            {day.key}
                                        </div>
                                    )
                                }
                                return (
                                    <div className="createauditschedule__content__item__day"
                                        onClick={() => handleClickEffectiveDay(index)}>
                                        {day.key}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="createauditschedule__content__item">
                    <div className="createauditschedule__cta">
                        {
                            (createAuditScheduleLoading) ?
                                <LoadingButton
                                    className="btn btn--primary btn--full-width"
                                    onClick={() => { return null; }}
                                /> :
                                <Button
                                    className="btn btn--primary btn--full-width"
                                    onClick={handleClickCreateAuditSchedule}
                                    buttonText="Create Audit Schedule"
                                />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateAuditSchedule;