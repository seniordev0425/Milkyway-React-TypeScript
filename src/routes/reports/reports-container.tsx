// OBSOLETE FILE

import React, { useState, useEffect } from 'react';
import cogoToast from 'cogo-toast';
import Select from 'react-select';
import moment from 'moment';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker } from 'react-dates';
import {
    CircularProgressbar,
    buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import './reports.scss';

import { useAuth0 } from '../../lib/auth';

import { useHistory } from "react-router-dom";
import HeaderWithBack from '../../components/headerwithback/headerwithback-container';
import { namespace } from "../../lib/getuserdetails";
import { getStoreIdsOfClient, getStoreDetails, getReport } from '../../lib/apiWrappers';

const customStyles = {
    control: (base: any, state: any) => ({
        ...base,
        'min-height': '46px',
    }),
};

const Reports: React.FC = () => {
    const history = useHistory();
    const {
        getIdTokenClaims
    } = useAuth0();
    const [storeOptions, setStoreOptions] = useState<{ value: string, label: string }[]>([]);
    const [storeSelected, setStoreSelected] = useState<{ value: string, label: string }>({ value: "", "label": "Loading stores..." });
    const [dateRange, setdateRange] = useState({
        startDate: null,
        endDate: null
    });
    const [focus, setFocus] = useState(null);
    const { startDate, endDate } = dateRange;
    const [reportData, setReportData] = useState<any>(null);
    const initiateReport = async () => {
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
        let userStores: (string | undefined)[] = claimsData ?.app_metadata ?._store ?? [];
        if (userStores.length == 0) {
            const clientId = claimsData ?.app_metadata ?._client ?? undefined;
            // No client Id found
            if (!clientId) {
                cogoToast.error("You are not associated with any company, please contact support");
                history.push("/home");
                return;
            }
            // getting storeIds for HQ
            userStores = await getStoreIdsOfClient(clientId, idToken);
        }
        const userStoresDetails = userStores.map(userStoreId => {
            const userStoreDetails = getStoreDetails(userStoreId, idToken);
            return userStoreDetails;
        })
        const userStoresWithDetails = await Promise.all(userStoresDetails);
        const userStoresOptions = userStoresWithDetails.map(result => {
            return {
                value: result._id,
                label: result.name
            }
        });
        if (userStoresOptions.length == 0) {
            cogoToast.error("No stores could be found associated with you. Please contact support.");
            history.push("/home");
            return;
        }
        setStoreOptions(userStoresOptions);
        setStoreSelected(userStoresOptions[0]);
    }
    useEffect(() => {
        initiateReport();
    }, []);
    const handleOnDateChange = ({ startDate, endDate }: any) =>
        setdateRange({ startDate, endDate });
    const getCurrentReport = async (storeId: string, formatedStartDate: string, formatedEndDate: string) => {
        // const claims: any = await getIdTokenClaims();
        // const idToken = claims.__raw;
        // const curentReportJson: any = await getReport(storeId, formatedStartDate, formatedEndDate, idToken);
        // if (!(curentReportJson.success)) {
        //     cogoToast.error("Report could not be retrieved");
        //     setReportData(null);
        //     return;
        // }
        // if (!(curentReportJson.data)) {
        //     cogoToast.warn("No report found");
        //     setReportData(null);
        //     return;
        // }
        // setReportData(curentReportJson.data);
        return;

    }
    useEffect(() => {
        if (!(dateRange.startDate) || !(dateRange.endDate)) {
            return;
        }
        if (!(storeSelected)) {
            return;
        }
        const startDate = dateRange.startDate;
        const endDate = dateRange.endDate;
        if ((startDate) && (endDate)) {
            const formatedStartDate = moment(startDate).format("YYYY-MM-DD");
            const formatedEndDate = moment(endDate).format("YYYY-MM-DD");
            getCurrentReport(storeSelected.value, formatedStartDate, formatedEndDate);
        }
        return;

    }, [dateRange, storeSelected]);

    return (
        <div className="content content--reports reports">
            {/* <HeaderWithBack
                label="reports"
                backLabel="Home"
                backLink="/home"
                title="Store Report"
            />

            <div className="content__content reports__content">
                <div className="reports__controls">
                    <div className="reports__controls__item reports__content__item reports__content__item--storeselect">
                        <div className="reports__controls__item__title reports__content__item__title--storeselect">
                            Select the store
                        </div>
                        <div className="reports__controls__item__content reports__content__item__content--storeselect">
                            <Select
                                value={storeSelected}
                                styles={customStyles}
                                onChange={(selectedOption: any) => { setStoreSelected(selectedOption) }}
                                options={storeOptions}
                            />
                        </div>
                    </div>
                    <div className="reports__controls__item reports__content__item reports__content__item--daterange">
                        <div className="reports__controls__item__title reports__content__item__title--daterange">
                            Select a timeframe
                        </div>
                        <div className="reports__controls__item__content reports__content__item__content--daterange">
                            <DateRangePicker
                                startDatePlaceholderText="Start"
                                startDate={startDate}
                                onDatesChange={handleOnDateChange}
                                endDatePlaceholderText="End"
                                endDate={endDate}
                                isOutsideRange={() => false}
                                numberOfMonths={1}
                                displayFormat="MMM D"
                                showClearDates={true}
                                focusedInput={focus}
                                onFocusChange={(focus: any) => setFocus(focus)}
                                startDateId="startDateMookh"
                                endDateId="endDateMookh"
                                minimumNights={0}
                                withPortal={true}
                            />
                        </div>
                    </div>
                    <div className="reports__controls__item reports__content__item reports__content__item--daterange">
                        <div className="reports__controls__item__title reports__content__item__title--daterange">
                            Select a timeframe
                        </div>
                        <div className="reports__controls__item__content reports__content__item__content--daterange">
                            <DateRangePicker
                                startDatePlaceholderText="Start"
                                startDate={startDate}
                                onDatesChange={handleOnDateChange}
                                endDatePlaceholderText="End"
                                endDate={endDate}
                                isOutsideRange={() => false}
                                numberOfMonths={1}
                                displayFormat="MMM D"
                                showClearDates={true}
                                focusedInput={focus}
                                onFocusChange={(focus: any) => setFocus(focus)}
                                startDateId="startDateMookh"
                                endDateId="endDateMookh"
                                minimumNights={0}
                                withPortal={true}
                            />
                        </div>
                    </div>
                </div>
                {
                    (reportData) ?
                        <div className="reports__content__item reports__content__item--all">
                            {
                                (reportData ?.overall) ?
                                    <div className="reports__overall">
                                        <CircularProgressbar
                                            value={reportData.overall}
                                            text={`${Math.round(reportData.overall)}%`}
                                            styles={buildStyles({
                                                textColor: "#4b9c89",
                                                pathColor: "#4b9c89"
                                            })}
                                        />
                                    </div>
                                    :
                                    null
                            }
                            {
                                (reportData ?.category_wise_data) ?
                                    <div className="reports__category">
                                        {
                                            Object.keys(reportData.category_wise_data).map(key => {
                                                return (
                                                    <div className="reports__category__item">
                                                        <div className="reports__category__item__title">
                                                            <div className="reports__category__item__title__key">
                                                                {key}
                                                            </div>
                                                            <div className="reports__category__item__title__result">
                                                                {Math.round(reportData.category_wise_data[key] ?.percentage)}%
                                                            </div>
                                                        </div>
                                                        <div className="reports__category__item__bar">
                                                            <div className="reports__category__item__bar__content" style={{ width: `${Math.round(reportData.category_wise_data[key] ?.percentage)}%` }}>
                                                            </div>

                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                    :
                                    <div></div>
                            }
                        </div>
                        :
                        <div className="reports__content__item--none">
                            No reports found
                        </div>
                }

            </div> */}
        </div>
    )
}

export default Reports;