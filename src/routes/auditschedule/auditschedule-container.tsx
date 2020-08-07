import React, { useState, useEffect } from 'react';
import { useRouteMatch, useHistory } from 'react-router';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';

import './auditschedule.scss';
import cogoToast from 'cogo-toast';
import cancel from "../../images/cancel.png";

import { useAuth0 } from '../../lib/auth';

import { namespace, REACT_APP_API_ENDPOINT } from "../../lib/getuserdetails";
import { getAuditScheduleDetails, convertToHumanReadableTime, fetchDelApi } from '../../lib/apiWrappers';
import { LoadingButton, Button } from '../../components/button/button-container';
import { getLocalTime } from '../../utility/time.utility';

const customDeleteModalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: "70%",
        // height: '60vh', // <-- This sets the height
        overflow: 'scroll'
    }
};

const AuditSchedule: React.FC = () => {
    const match = useRouteMatch();
    const history = useHistory();
    const [userRole, setUserRole] = useState("associate");
    const [auditScheduleLoading, setauditScheduleLoading] = useState(false);
    const [auditScheduleData, setAuditScheduleData] = useState<any>({});
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [auditScheduleId, setAuditScheduleId] = useState(undefined);
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
    const {
        getIdTokenClaims
    } = useAuth0();
    const handleClickAuditScheduleDelete = async () => {
        setDeleteLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const taskDeleteEndPoint = `${REACT_APP_API_ENDPOINT}/schedule-task/${auditScheduleId}`;
        const responseTaskDelete = await fetchDelApi(taskDeleteEndPoint, idToken);
        console.log(responseTaskDelete);
        if (responseTaskDelete.success) {
            setDeleteLoading(false);
            cogoToast.success("Schedule successfully deleted");
            history.push("/auditschedules");
            return;
        }
        setDeleteLoading(false);
        cogoToast.error(responseTaskDelete.data);
        return;
    }
    const getAuditSchedule = async () => {
        setauditScheduleLoading(true);
        const params: any = match.params;
        const auditScheduleId = params.id ?? "";
        if (!(auditScheduleId)) {
            cogoToast.error("No audit schedule found");
            return null;
        }
        setAuditScheduleId(auditScheduleId);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const claimsData = claims[`${namespace}claims/`];
        const auditScheduleDetails = await getAuditScheduleDetails(auditScheduleId, idToken);
        console.log("auditScheduleDetails");
        console.log(auditScheduleDetails);
        if ((!auditScheduleDetails.success)) {
            cogoToast.error("No audit schedule found");
            return null;
        }
        const userRoles = claimsData ?.roles ?? [];
        let userFinalRole = "associate";
        // TODO: get a better way to store the possible roles
        for (let role of ['associate', 'manager', 'headquarter']) {
            if (userRoles.includes(role)) {
                userFinalRole = role;
            }
        }
        setUserRole(userFinalRole);
        setAuditScheduleData(auditScheduleDetails.data);
        setauditScheduleLoading(false);
    }
    useEffect(() => {
        getAuditSchedule();
    }, []);
    return (
        <div className="content content--auditschedule auditschedule">
            <div className={`auditschedule__loading-overlay--${auditScheduleLoading}`}>
                <div className="loadingSpinner"></div>
            </div>
            <div className="content__content auditschedule__content">
                <div className="content__item auditschedule__content__item auditschedule__content__item--title">
                    <div className="auditschedule__item--title__content">
                        {auditScheduleData.title}
                    </div>
                    {
                        (userRole === 'headquarter') ?
                            <div className="task__item--title__delete">
                                <Button
                                    className="btn btn--link-danger"
                                    onClick={() => setDeleteModalIsOpen(true)}
                                    buttonText="Delete"
                                />
                            </div>
                            :
                            null
                    }
                </div>
                <div className="auditschedule__content__item auditschedule__content__item--time">
                    <div className="auditschedule__content__item--starttime">
                        <div className="auditschedule__content__item__title">
                            Start time
                        </div>
                        <div className="auditschedule__content__item__content">
                            {getLocalTime(convertToHumanReadableTime(auditScheduleData.start_time))}
                        </div>
                    </div>
                    <div className="auditschedule__content__item--endtime">
                        <div className="auditschedule__content__item__title">
                            End time
                        </div>
                        <div className="auditschedule__content__item__content">
                            {getLocalTime(convertToHumanReadableTime(auditScheduleData.end_time))}
                        </div>
                    </div>
                </div>
                {
                    (auditScheduleData.effective_days) ?
                        <div className="auditschedule__content__item auditschedule__content__item--days">
                            <div className="auditschedule__content__item__title auditschedule__content__item--days__title">
                                Effective days
                            </div>
                            <div className="auditschedule__content__item__days auditschedule__content__item--days__content">
                                {
                                    auditScheduleDays.map((day, index) => {
                                        if (auditScheduleData.effective_days.includes(day.value)) {
                                            return (
                                                <div className="auditschedule__content__item__day auditschedule__content__item__day--active">
                                                    {day.key}
                                                </div>
                                            )
                                        }
                                        return (
                                            <div className="auditschedule__content__item__day">
                                                {day.key}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        : null
                }
            </div>
            <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={() => setDeleteModalIsOpen(false)}
                style={customDeleteModalStyles}
                contentLabel="Confirm"
            >
                <div className="deletemodal">
                    <div className="deletemodal__header">
                        <div className="addactivitymodal__title">
                            Confirm
                        </div>
                        <div className="deletemodal__close" onClick={() => setDeleteModalIsOpen(false)}>
                            <img src={cancel} alt="" />
                        </div>
                    </div>
                    <div className="deletemodal__content">
                        Are you sure to delete the audit schedule?
                    </div>
                    <div className="deletemodal__cta">
                        {
                            (deleteLoading) ?
                                <button className="deletemodal__cta__button btn btn--danger" onClick={() => { return null; }}>
                                    <div className="loadingSpinner"></div>
                                </button>
                                :
                                <button className="deletemodal__cta__button btn btn--danger" onClick={handleClickAuditScheduleDelete}>
                                    Yes
                                </button>
                        }
                        <button className="deletemodal__cta__button btn" onClick={() => setDeleteModalIsOpen(false)}>
                            No
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default AuditSchedule;

