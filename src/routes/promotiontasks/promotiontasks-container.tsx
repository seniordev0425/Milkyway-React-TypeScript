import React, { useState, useEffect } from 'react';
import cogoToast from 'cogo-toast';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import Select from 'react-select';

import './promotiontasks.scss';

import { namespace } from "../../lib/getuserdetails";
import { useAuth0 } from '../../lib/auth';
import { REACT_APP_API_ENDPOINT } from "../../lib/getuserdetails";

import { getStoreIdsOfClient, getStoreDetails, getClusterIdsOfClient, getClusterDetails } from '../../lib/apiWrappers';
import { Button, LoadingButton } from '../../components/button/button-container';

import { useHistory } from "react-router-dom";

const customStyles = {
    control: (base: any, state: any) => ({
        ...base,
        'min-height': '46px',
    }),
};

const PromotionTasks: React.FC = () => {
    const history = useHistory();
    const {
        getIdTokenClaims
    } = useAuth0();
    const [tasksLoading, setTasksLoading] = useState(false);
    const [pendingTasks, setPendingTasks] = useState<any[]>([]);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [isAllowedToCreateTask, setIsAllowedToCreateTask] = useState(false);
    const [userRole, setUserRole] = useState<string | undefined>("associate");
    const [viewByStore, setViewByStore] = useState(true);
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
    const [viewTypeOptionSelected, setViewTypeOptionSelected] = useState<{ value: string, label: string }>({ value: "view_by_store", label: "View By Store" });

    const handleClickChangeViewBy = (selectedOption: { value: string, label: string }) => {
        if (selectedOption.value === 'view_by_store') {
            setViewByStore(true);
        } else {
            setViewByStore(false);
        }
        setViewTypeOptionSelected(selectedOption); 
    }

    const getTasks = async () => {
        setTasksLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        let tasksEndPoint = REACT_APP_API_ENDPOINT + "/tasks";
        console.log(viewByOptionSelected);
        console.log(viewByOptions);
        if (viewByOptionSelected && viewByOptionSelected.value !== "") {
            if (viewByStore) {
                tasksEndPoint = `${REACT_APP_API_ENDPOINT}/store/${viewByOptionSelected.value}/tasks`;
            } else {
                tasksEndPoint = `${REACT_APP_API_ENDPOINT}/cluster/${viewByOptionSelected.value}/tasks`;
            }
        }
        const response = await fetch(tasksEndPoint, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });
        const responseJson = await response.json();
        const userPendingTasks: any[] = [];
        const userCompletedTasks: any[] = [];
        if (responseJson.success) {
            for (let task of responseJson.data) {
                if (task.type === 'promotion') {
                    (((task.status === "completed") || (task.status === "cv_pending")) ? userCompletedTasks : userPendingTasks).push(task);
                }
            }
            console.log(userPendingTasks);
            setPendingTasks(userPendingTasks);
            setCompletedTasks(userCompletedTasks);
        }
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
        if (userFinalRole === "headquarter") {
            setIsAllowedToCreateTask(true);
        }
        setTasksLoading(false);
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
        getTasks();
    }, [viewByOptionSelected]);
    useEffect(() => {
        loadOptions();
    }, [viewByStore]);
    useEffect(() => {
        if (userRole !== 'headquarter') {
            return;
        }
        loadOptions();
    }, [userRole]);
    useEffect(() => {
        getTasks();
    }, []);
    return (
        <div className="content content--tasks tasks">
            {
                (userRole === 'headquarter') ?
                    <div className="tasks__content tasks__viewBy">
                        <Select
                            value={viewTypeOptionSelected}
                            styles={customStyles}
                            onChange={(selectedOption: any) => { handleClickChangeViewBy(selectedOption) }}
                            options={viewTypeOptions}
                        />
                        <div className="tasks__viewBy__dropdown">
                            <Select
                                value={viewByOptionSelected}
                                styles={customStyles}
                                onChange={(selectedOption: any) => { setViewByOptionSelected(selectedOption) }}
                                options={viewByOptions}
                            />

                        </div>
                    </div>
                    : null
            }
            {
                (tasksLoading) ?
                    <div className="content content--tasks tasks tasks--loading">
                        <div className="loadingSpinner"></div>
                    </div>
                    :
                    <div className="content__content tasks__content">
                        <Tabs>
                            <TabList>
                                <Tab>
                                    Pending
                            <span className="tasks__status__count">
                                        {
                                            (pendingTasks.length > 0) ?
                                                ` (${pendingTasks.length})`
                                                : null
                                        }
                                    </span>

                                </Tab>
                                <Tab>
                                    Completed
                            <span className="tasks__status__count">
                                        {
                                            (completedTasks.length > 0) ?
                                                ` (${completedTasks.length})`
                                                : null
                                        }
                                    </span>
                                </Tab>
                            </TabList>

                            <TabPanel>
                                {
                                    (pendingTasks.length === 0) ?
                                        <div className="tasks--empty">
                                            No pending tasks
                                </div>
                                        :
                                        pendingTasks.map(task => {
                                            return (
                                                <div className="tasks__item" key={task._id}>
                                                    <a className="tasks__item__link"
                                                        onClick={() => history.push(`/promotiontask/${task._id}`)}>
                                                        <div className="tasks__item__left">
                                                            <div className="tasks__item__tags">
                                                                {
                                                                    (task ?.review_requested) ?
                                                                        <div className="tasks__item__tag tasks__item__tag--review-requested">
                                                                            Review requested
                                                            </div>
                                                                        :
                                                                        null
                                                                }
                                                                {/* {
                                                                    (task ?.type) ?
                                                                        <div className={`tasks__item__tag tasks__item__tag--${task ?.type}`}>
                                                                            {task ?.type}
                                                                        </div>
                                                                        :
                                                                        null
                                                                } */}
                                                            </div>
                                                            <div className="tasks__item__title">
                                                                {task ?.title}
                                                            </div>
                                                            <div className="tasks__item__description">
                                                                {task ?.description}
                                                            </div>
                                                        </div>
                                                        <div className="tasks__item__right">
                                                        </div>
                                                    </a>
                                                </div>
                                            )
                                        })
                                }
                            </TabPanel>
                            <TabPanel>
                                {
                                    (completedTasks.length === 0) ?
                                        <div className="tasks--empty">
                                            No completed tasks
                                </div>
                                        :
                                        completedTasks.map(task => {
                                            return (
                                                <div className="tasks__item" key={task._id}>
                                                    <a className="tasks__item__link"
                                                        onClick={() => history.push(`/promotiontask/${task._id}`)}>
                                                        <div className="tasks__item__left">
                                                            <div className="tasks__item__tags">
                                                                {
                                                                    (task ?.review_requested) ?
                                                                        <div className="tasks__item__tag tasks__item__tag--review-requested">
                                                                            Review requested
                                                            </div>
                                                                        :
                                                                        null
                                                                }
                                                                {
                                                                    (task ?.type == 'audit') ?
                                                                        <div className="tasks__item__tag tasks__item__tag--audit">
                                                                            Audit
                                                            </div>
                                                                        :
                                                                        null
                                                                }
                                                            </div>
                                                            <div className="tasks__item__title">
                                                                {task ?.title}
                                                            </div>
                                                            <div className="tasks__item__description">
                                                                {task ?.description}
                                                            </div>
                                                        </div>
                                                        <div className="tasks__item__right">
                                                        </div>
                                                    </a>
                                                </div>
                                            )
                                        })
                                }
                            </TabPanel>
                        </Tabs>
                    </div>
            }

            {
                (isAllowedToCreateTask) ?
                    <div className="content__cta tasks__cta">
                        <div className="tasks__cta__item">
                            <button className="tasks__cta__button btn--primary btn" onClick={() => { history.push("/createpromotiontask"); }}>
                                Create a promotion task
                            </button>
                        </div>
                    </div>
                    :
                    <div></div>
            }
        </div>
    )
}

export default PromotionTasks;