import React, { useState, useEffect, Fragment } from 'react';
import { useHistory, useRouteMatch } from "react-router-dom";

import './report.scss';
import rightIcon from '../../images/right.png';

import { useAuth0 } from '../../lib/auth';

import { namespace } from "../../lib/getuserdetails";
import { getStoreIdsOfClient, getStoreDetails, getReport, getClusterIdsOfClient, getClusterDetails } from '../../lib/apiWrappers';
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

const customStyles = {
    control: (base: any, state: any) => ({
        ...base,
        'min-height': '46px',
        'margin': '0.5em 0'
    }),
};

const Report: React.FC = () => {
    const match = useRouteMatch();
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
    const [secondDatepickerFocus, setSecondDatepickerFocusFocus] = useState(null);
    const { startDate, endDate } = dateRange;
    const [reportType, setReportType] = useState(undefined);
    const [reportFilter, setReportFilter] = useState(undefined);
    const [secondaryReportFilter, setSecondaryReportFilter] = useState(undefined);
    const [reportData, setReportData] = useState<any>(null);
    const [secondaryReportData, setSecondaryReportData] = useState<any>(null);
    const [viewByStore, setViewByStore] = useState(true);
    const [userRole, setUserRole] = useState<string | undefined>("associate");
    const [viewByOptionSelected, setViewByOptionSelected] = useState<{ value: string, label: string }>({ value: "", label: "Loading options..." });
    const [viewByOptions, setViewByOptions] = useState<{ value: string, label: string }[]>([]);
    const [viewTypeOptions, setViewTypeOptions] = useState<{ value: string, label: string }[]>([{
        value: "view_by_store",
        label: "View By Store"
    },
    {
        value: "view_by_cluster",
        label: "View By Cluster"
    }]);
    const [planogramTypeOptions, setPlanogramTypeOptions] = useState<{ value: string, label: string }[]>([{
        value: "product",
        label: "Report By Product Category"
    },
    {
        value: "compliance",
        label: "Report By Compliance Category"
    }]);

    const [viewTypeOptionSelected, setViewTypeOptionSelected] = useState<{ value: string, label: string }>({ value: "view_by_store", label: "View By Store" });
    const [selectedPlanogramTypeOption, setSelectedPlanogramTypeOption] =  useState<{ value: string, label: string }>({
        value: "product",
        label: "Report By Product Category"
    });
    const handleChangePlanogramType = (selectedOption: { value: string, label: string }) => {
        setSelectedPlanogramTypeOption(selectedOption);
        setReportFilter(undefined);
    }
    const handleClickChangeViewBy = (selectedOption: { value: string, label: string }) => {
        if (selectedOption.value === 'view_by_store') {
            setViewByStore(true);
        } else {
            setViewByStore(false);
        }
        setViewTypeOptionSelected(selectedOption); 
    }
    const initiateReportDetails = async () => {
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
        setUserRole(userFinalRole);
        if (userFinalRole === "associate") {
            history.push("/home");
            return;
        }
        // get params
        const params: any = match.params;
        console.log(params);
        if (!(params.type)) {
            cogoToast.error("Please select a report type");
            history.push("/reportselectpre");
            return;
        }
        setReportType(params.type);
        setReportFilter(params.filter);
        // set store details

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
    const loadOptions = async () => {
        const claims: any = await getIdTokenClaims();
        const claimsData = claims[`${namespace}claims/`];
        const idToken = claims.__raw;
        if (viewByStore) {
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
                setViewByStore(!viewByStore);
                return;
            }
            setViewByOptions(userStoresOptions);
            setViewByOptionSelected(userStoresOptions[0]);
        } else {
            let userClusters: (string | undefined)[] = claimsData ?.app_metadata ?._store ?? [];
            if (userClusters.length == 0) {
                const clientId = claimsData ?.app_metadata ?._client ?? undefined;
                // No client Id found
                if (!clientId) {
                    cogoToast.error("You are not associated with any company, please contact support");
                    history.push("/home");
                    return;
                }
                // getting storeIds for HQ
                userClusters = await getClusterIdsOfClient(clientId, idToken);
            }
            const userClustersDetails = userClusters.map(userClusterId => {
                const userClusterDetails = getClusterDetails(userClusterId, idToken);
                return userClusterDetails;
            })
            const userClustersWithDetails = await Promise.all(userClustersDetails);
            const userClustersOptions = userClustersWithDetails.map(result => {
                return {
                    value: result._id,
                    label: result.name
                }
            });
            console.log(userClustersOptions);
            if (userClustersOptions.length == 0) {
                cogoToast.error("No Cluster could be found associated with you. Please contact support.");
                setViewByStore(!viewByStore);
                return;
            }
            setViewByOptions(userClustersOptions);
            setViewByOptionSelected(userClustersOptions[0]);
        }
    }
    useEffect(() => {
        initiateReportDetails();
    }, [viewByOptionSelected]);
    useEffect(() => {
        loadOptions();
    }, [viewByStore]);
    useEffect(() => {
        if (userRole === 'associate') {
            return;
        }
        loadOptions();
    }, [userRole]);
    const handleOnDateChange = ({ startDate, endDate }: any) =>
        setdateRange({ startDate, endDate });
    const getCurrentReport = async (storeOrClusterId: string, viewByStore: boolean, reportType: string | undefined,
        reportFilter: string | undefined, formatedStartDate: string, formatedEndDate: string, isSecondary?: Boolean | undefined) => {
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const curentReportJson: any = await getReport(
            storeOrClusterId,
            viewByStore,
            reportType,
            reportFilter,
            formatedStartDate,
            formatedEndDate,
            idToken);
        if (!(curentReportJson.success)) {
            cogoToast.error("Report could not be retrieved");
            if (isSecondary) {
                setSecondaryReportData(null);
            } else {
                setReportData(null);
            }
            return;
        }
        if (!(curentReportJson.data) || !(curentReportJson.data.overall)) {
            cogoToast.warn("No report found");
            if (isSecondary) {
                setSecondaryReportData(null);
            } else {
                setReportData(null);
            }
            return;
        }
        if (isSecondary){
            setSecondaryReportData(curentReportJson.data);
        } else {
            setReportData(curentReportJson.data);
        }
        return;

    }
    const getTitle = (reportType: string | undefined, reportFilter: string | undefined) => {
        if (reportFilter) {
            return reportFilter;
        }
        if (reportType) {
            if (reportType === 'product') {
                return "Product"
            } else if (reportType === 'compliance') {
                return "Compliance"
            }
            return "";
        }
        return "";
    }
    const getSVGDef = (overallScore: any) => {
        if (overallScore >= 75) {
            return "#excellent";
        } else if (overallScore > 50 && overallScore < 75){
            return "#medium";
        } else {
            return "#low"
        }
    }
    const excellentGradient = 'linear-gradient(#7BCE9C,#94d6ac, #7BCE9C)';
    const mediumGradient = 'linear-gradient(#FBE09D, #f5ff97, #FBE09D)';
    const lowGradient = 'linear-gradient(#F46D11, #FEC548)';
    const getRowstyle = (key: any) => {
        if (key.percentage >=75 ) {
            return {
                width: `${Math.round(key.percentage)}%`,
                backgroundColor: "#7BCE9C",
                //background: excellentGradient
            };
        } else if (key.percentage > 50 && key.percentage < 75){
            return {
                width: `${Math.round(key.percentage)}%`,
                backgroundColor: "#FBE09D",
                //background: mediumGradient
            };
        } else {
            return {
                width: `${Math.round(key.percentage)}%`,
                backgroundColor: "#F46D11",
                //background: lowGradient
            };
        }
    }
    useEffect(() => {
        console.log("something changed");
        if (!(dateRange.startDate) || !(dateRange.endDate)) {
            return;
        }
        if (!(viewByOptionSelected.value)) {
            return;
        }
        const startDate = dateRange.startDate;
        const endDate = dateRange.endDate;
        if ((startDate) && (endDate)) {
            const formatedStartDate = moment(startDate).format("YYYY-MM-DD");
            const formatedEndDate = moment(endDate).format("YYYY-MM-DD");
            const reportView = reportType==='promotion' ? reportType : selectedPlanogramTypeOption.value;
            if (window.screen && window.screen.width > 800) {
                if (reportType==='promotion') {
                    getCurrentReport(viewByOptionSelected.value, viewByStore, reportType, reportFilter, formatedStartDate, formatedEndDate);
                } else {
                    getCurrentReport(viewByOptionSelected.value, viewByStore, "product", reportFilter, formatedStartDate, formatedEndDate);
                    getCurrentReport(viewByOptionSelected.value, viewByStore, "compliance", secondaryReportFilter, formatedStartDate, formatedEndDate, true);
                }
            } else {
                getCurrentReport(viewByOptionSelected.value, viewByStore, reportView, reportFilter, formatedStartDate, formatedEndDate);
            }
        }
        return;

    }, [dateRange, viewByOptionSelected, reportFilter, selectedPlanogramTypeOption, secondaryReportFilter]);
    useEffect(() => {
        initiateReportDetails();
    }, []);

    const getPrimaryReportDivStyle = ()=>{
        if (reportType === 'promotion') {
            return {}   
        }
        if (window.screen && window.screen.width > 800) {
            return {width: '50%', display: 'inline-block'}            
        } else {
            return {}
        }
    }

    const getSecondaryReportDivStyle = ()=>{
        if (reportType === 'planogram' && window.screen && window.screen.width > 800) {
            return {width: '50%', display: 'inline-block'}
        } else {
            return {display: 'none'}
        }
    }

    return (
        <div className="reports">
            <svg style={{position: 'absolute'}}>
                <defs>
                    <linearGradient id="excellent" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#7BCE9C"></stop>
                        <stop offset="50%" stop-color="#94d6ac"></stop>
                        <stop offset="100%" stop-color="#7BCE9C"></stop>
                    </linearGradient>
                    <linearGradient id="medium" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#FBE09D"></stop>
                        <stop offset="50%" stop-color="#f5ff97"></stop>
                        <stop offset="100%" stop-color="#FBE09D"></stop>
                    </linearGradient>
                    <linearGradient id="low" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#F46D11"></stop>
                        <stop offset="100%" stop-color="#FEC548"></stop>
                    </linearGradient>
                </defs>
            </svg>
            <div className="content__content reports__content">
                <div className="reports__controls mobile">
                    {
                        reportType==='planogram' &&
                        <Select
                            value={selectedPlanogramTypeOption}
                            styles={customStyles}
                            onChange={(selectedOption: any) => { handleChangePlanogramType(selectedOption) }}
                            options={planogramTypeOptions}
                        />
                    }
                    {
                        (userRole === 'headquarter') ?
                            <div className="reports__content reports__viewBy">
                                <Select
                                    value={viewTypeOptionSelected}
                                    styles={customStyles}
                                    onChange={(selectedOption: any) => { handleClickChangeViewBy(selectedOption) }}
                                    options={viewTypeOptions}
                                />
                                <Select
                                    value={viewByOptionSelected}
                                    styles={customStyles}
                                    onChange={(selectedOption: any) => { setViewByOptionSelected(selectedOption) }}
                                    options={viewByOptions}
                                />
                            </div>
                            : null
                    }
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
                                focusedInput={secondDatepickerFocus}
                                onFocusChange={(focus: any) => setSecondDatepickerFocusFocus(focus)}
                                startDateId="startDateMookh"
                                endDateId="endDateMookh"
                                minimumNights={0}
                                withPortal={true}
                            />
                        </div>
                    </div>
                </div>
                <div className="reports__controls desktop">
                    {
                        (userRole === 'headquarter') ?
                            <div className="reports__content reports__viewBy">
                                <Select
                                    value={viewTypeOptionSelected}
                                    styles={customStyles}
                                    onChange={(selectedOption: any) => { handleClickChangeViewBy(selectedOption) }}
                                    options={viewTypeOptions}
                                />
                                <Select
                                    value={viewByOptionSelected}
                                    styles={customStyles}
                                    onChange={(selectedOption: any) => { setViewByOptionSelected(selectedOption) }}
                                    options={viewByOptions}
                                />
                            </div>
                            : null
                    }
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
                <div className="reports__content__item reports__content__item--title">
                    {false && getTitle(reportType, reportFilter)}
                </div>
                {
                    <div style={getPrimaryReportDivStyle()}>
                    {(reportData) ?
                        <div className="reports__content__item reports__content__item--all">
                            {
                                reportType === 'planogram' &&
                                <Fragment>
                                    {
                                        reportFilter && 
                                        <p className="reports__planogram_primary_heading">Compliance for {reportFilter}</p> ||
                                        <p className="reports__planogram_primary_heading">Results by Product Category</p>
                                    }
                                </Fragment>
                            }
                            {
                                reportType === 'planogram' &&
                                <Fragment>
                                    {
                                        reportFilter &&
                                        <Fragment>
                                            {
                                                selectedPlanogramTypeOption.value==='product' &&
                                                <p className="reports__planogram_primary_heading_mobile">Compliance for {reportFilter}</p>
                                                ||
                                                <p className="reports__planogram_primary_heading_mobile">{reportFilter} Compliance Results</p>
                                            }
                                        </Fragment>
                                        ||
                                        <p className="reports__planogram_primary_heading_mobile">Results by {selectedPlanogramTypeOption.value} Category</p>
                                    }
                                </Fragment>
                            }
                            {
                                (reportData ?.overall) ?
                                    <div className="reports__overall">
                                        <CircularProgressbar
                                            value={reportData.overall}
                                            text={`${Math.round(reportData.overall)}%`}
                                            styles={
                                                    buildStyles({
                                                        trailColor: '#F4F8FF',
                                                        textColor: `url(${getSVGDef(reportData.overall)})`,
                                                        pathColor: `url(${getSVGDef(reportData.overall)})`
                                                    })
                                            }
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
                                                        <a className="reports__category__item__link" onClick={() => {
                                                            if ((reportFilter) || (reportType === 'promotion')) {
                                                                console.log("missed");
                                                                return null;
                                                            };
                                                            const filter: any = key;
                                                            setReportFilter(filter);
                                                            // history.push(`/report/${reportType}/${filter}`);
                                                        }}
                                                        >
                                                            <div className="reports__category__item__content">
                                                                <div className="reports__category__item__title">
                                                                    <div className="reports__category__item__title__key">
                                                                        {key}
                                                                    </div>
                                                                    <div className="reports__category__item__title__result">
                                                                        {Math.round(reportData.category_wise_data[key] ?.percentage)}%
                                                            </div>
                                                                </div>
                                                                <div className="reports__category__item__bar">
                                                                    <div className="reports__category__item__bar__content"
                                                                        style={getRowstyle(reportData.category_wise_data[key])}>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {
                                                                ((reportFilter) || (reportType === 'promotion')) ?
                                                                    null
                                                                    :
                                                                    <div className="reports__category__item__icon">
                                                                        <img src={rightIcon} alt="" />
                                                                    </div>
                                                            }

                                                        </a>
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
                    </div>
                }

                {
                    reportType!='promotion'
                    && <div style={getSecondaryReportDivStyle()}>
                        {
                        (secondaryReportData) ?
                            <div className="reports__content__item reports__content__item--all">
                                <Fragment>
                                    {
                                        secondaryReportFilter && 
                                        <p style={{textAlign: 'center', width: '100%', textTransform: 'capitalize'}}>{secondaryReportFilter} Compliance Results</p> ||
                                        <p style={{textAlign: 'center', width: '100%'}}>Results by Compliance Category </p>

                                    }
                                </Fragment>
                                {
                                    (secondaryReportData ?.overall) ?
                                        <div className="reports__overall">
                                            <CircularProgressbar
                                                value={secondaryReportData.overall}
                                                text={`${Math.round(secondaryReportData.overall)}%`}
                                                styles={
                                                        buildStyles({
                                                            trailColor: '#F4F8FF',
                                                            textColor: `url(${getSVGDef(secondaryReportData.overall)})`,
                                                            pathColor: `url(${getSVGDef(secondaryReportData.overall)})`
                                                        })
                                                }
                                            />
                                        </div>
                                        :
                                        null
                                }
                                {
                                    (secondaryReportData ?.category_wise_data) ?
                                        <div className="reports__category">
                                            {
                                                Object.keys(secondaryReportData.category_wise_data).map(key => {
                                                    return (
                                                        <div className="reports__category__item">
                                                            <a className="reports__category__item__link" onClick={() => {
                                                                if ((secondaryReportFilter) || (reportType === 'promotion')) {
                                                                    console.log("missed");
                                                                    return null;
                                                                };
                                                                const filter: any = key;
                                                                setSecondaryReportFilter(filter);
                                                                // history.push(`/report/${reportType}/${filter}`);
                                                            }}
                                                            >
                                                                <div className="reports__category__item__content">
                                                                    <div className="reports__category__item__title">
                                                                        <div className="reports__category__item__title__key">
                                                                            {key}
                                                                        </div>
                                                                        <div className="reports__category__item__title__result">
                                                                            {Math.round(secondaryReportData.category_wise_data[key] ?.percentage)}%
                                                                </div>
                                                                    </div>
                                                                    <div className="reports__category__item__bar">
                                                                        <div className="reports__category__item__bar__content"
                                                                            style={getRowstyle(secondaryReportData.category_wise_data[key])}>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {
                                                                    ((reportFilter) || (reportType === 'promotion')) ?
                                                                        null
                                                                        :
                                                                        <div className="reports__category__item__icon">
                                                                            <img src={rightIcon} alt="" />
                                                                        </div>
                                                                }

                                                            </a>
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
                    </div>
                }

            </div>
        </div>
    )
}

export default Report;