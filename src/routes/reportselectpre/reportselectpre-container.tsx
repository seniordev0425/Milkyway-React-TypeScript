import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";

import './reportselectpre.scss';
import ProductIcon from '../../images/planogram.svg';
import PromotionIcon from '../../images/promotion.svg';

import { useAuth0 } from '../../lib/auth';
import { namespace } from "../../lib/getuserdetails";
import HeaderWithBack from '../../components/headerwithback/headerwithback-container';
import { Button } from '../../components/button/button-container';
import cogoToast from 'cogo-toast';

const ReportSelectPre: React.FC = () => {
    const history = useHistory();
    const {
        getIdTokenClaims
    } = useAuth0();
    const initiateReportSelect = async () => {
        const claims: any = await getIdTokenClaims();
        const claimsData = claims[`${namespace}claims/`];
        const idToken = claims.__raw;
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
        if (userFinalRole === "associate") {
            history.push("/home");
            return;
        }
    }
    useEffect(() => {
        initiateReportSelect();
    }, []);
    const handleReportTypeSelect = (selectedInput: any) => {
        const reportTypeSelected = selectedInput.target.value;
        setReportTypeSelectedPlanogram(false);
        setReportTypeSelectedPromotion(false);
        if (reportTypeSelected == 'planogram') {
            setReportTypeSelectedPlanogram(true);
        } else if (reportTypeSelected == 'promotion') {
            setReportTypeSelectedPromotion(true);
        }
    }
    const [reportTypeSelectedPlanogram, setReportTypeSelectedPlanogram] = useState(true);
    const [reportTypeSelectedPromotion, setReportTypeSelectedPromotion] = useState(false);
    const redirectToReport = () => {
        // let userReportTypeSelected = undefined;
        if (reportTypeSelectedPlanogram) {
            // userReportTypeSelected = 'planogram';
            history.push("/report/planogram");
            return;
        } else if (reportTypeSelectedPromotion) {
            // userReportTypeSelected = 'promotion';
            history.push("/report/promotion");
            return;
        } else {
            cogoToast.error("Please select a category");
            return;
        }
    }
    return (
        <div className="content content--reportselect reportselect">
            <div className="content__content reportselect__content">
                <div className="section payment">
                    <div className="section__content payment__content">
                        <div className="option">
                            <input type="radio" name="role-select" id="planogram" value="planogram"
                                onChange={handleReportTypeSelect}
                                checked={reportTypeSelectedPlanogram} />
                            <label className="payment-label" htmlFor="planogram" aria-label="Planogram compliance" >
                                <div className="payment-label__icon">
                                    <img src={ProductIcon} />
                                </div>
                                <div className="payment-label__content--left">
                                    <div className="payment-label__text">
                                        <div className="payment-label__text-title">
                                            Planogram compliance
                                        </div>
                                    </div>
                                </div>

                            </label>
                        </div>
                        <div className="option">
                            <input type="radio" name="role-select" id="promotion" value="promotion"
                                onChange={handleReportTypeSelect}
                                checked={reportTypeSelectedPromotion} />
                            <label className="payment-label" htmlFor="promotion">
                                <div className="payment-label__icon">
                                    <img src={PromotionIcon} />
                                </div>
                                <div className="payment-label__content--left">
                                    <div className="payment-label__text">
                                        <div className="payment-label__text-title">
                                            Promotion compliance
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="reportselect__cta">
                <Button
                    className="btn btn--primary btn--full-width"
                    onClick={redirectToReport}
                    buttonText="Proceed"
                />
            </div>
        </div>
    )
}

export default ReportSelectPre;