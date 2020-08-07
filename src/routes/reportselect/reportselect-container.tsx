import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";

import './reportselect.scss';
import ProductIcon from '../../images/planogram.svg';
import PromotionIcon from '../../images/promotion.svg';

import { useAuth0 } from '../../lib/auth';
import { namespace } from "../../lib/getuserdetails";
import HeaderWithBack from '../../components/headerwithback/headerwithback-container';
import { Button } from '../../components/button/button-container';
import cogoToast from 'cogo-toast';

const ReportSelect: React.FC = () => {
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
        setReportTypeSelectedProduct(false);
        setReportTypeSelectedCompliance(false);
        if (reportTypeSelected == 'product') {
            setReportTypeSelectedProduct(true);
        } else if (reportTypeSelected == 'compliance') {
            setReportTypeSelectedCompliance(true);
        }
    }
    const [reportTypeSelectedProduct, setReportTypeSelectedProduct] = useState(true);
    const [reportTypeSelectedCompliance, setReportTypeSelectedCompliance] = useState(false);
    const redirectToReport = () => {
        let userReportTypeSelected = undefined;
        if (reportTypeSelectedProduct) {
            userReportTypeSelected = 'product';
        } else if (reportTypeSelectedCompliance) {
            userReportTypeSelected = 'compliance';
        } else {
            cogoToast.error("Please select a category");
            return;
        }
        history.push(`report/${userReportTypeSelected}`);
    }
    return (
        <div className="content content--reportselect reportselect">
            {/* <HeaderWithBack
                label="report"
                backLabel="Home"
                backLink="/home"
                title="View planogram compliance by"
            /> */}
            <div className="content__content reportselect__content">
                <div className="reportselect__title">
                    View planogram compliance by
                </div>
                <div className="section payment">
                    <div className="section__content payment__content">
                        <div className="option">
                            <input type="radio" name="role-select" id="product" value="product"
                                onChange={handleReportTypeSelect}
                                checked={reportTypeSelectedProduct} />
                            <label className="payment-label" htmlFor="product" aria-label="Planogram compliance" >
                                <div className="payment-label__icon">
                                    {/* <img src={ProductIcon} /> */}
                                </div>
                                <div className="payment-label__content--left">
                                    <div className="payment-label__text">
                                        <div className="payment-label__text-title">
                                            Product category
                                        </div>
                                    </div>
                                </div>

                            </label>
                        </div>
                        <div className="option">
                            <input type="radio" name="role-select" id="compliance" value="compliance"
                                onChange={handleReportTypeSelect}
                                checked={reportTypeSelectedCompliance} />
                            <label className="payment-label" htmlFor="compliance">
                                <div className="payment-label__icon">
                                    {/* <img src={PromotionIcon} /> */}
                                </div>
                                <div className="payment-label__content--left">
                                    <div className="payment-label__text">
                                        <div className="payment-label__text-title">
                                            Compliance category
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

export default ReportSelect;