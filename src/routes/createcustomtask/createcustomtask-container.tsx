import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import cogoToast from 'cogo-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './createcustomtask.scss';

import moment from 'moment';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { SingleDatePicker } from 'react-dates';

import { Button, LoadingButton } from '../../components/button/button-container';
import { useHistory } from 'react-router';
import { useAuth0 } from '../../lib/auth';
import { namespace, REACT_APP_API_ENDPOINT } from "../../lib/getuserdetails";
import { getStoreIdsOfClient, getStoreDetails, getClusterIdsOfClient, getClusterDetails } from '../../lib/apiWrappers';
import HeaderWithBack from '../../components/headerwithback/headerwithback-container';

const customStyles = {
    control: (base: any, state: any) => ({
        ...base,
        'min-height': '46px',
    }),
};

const CreateCustomTask: React.FC = () => {
    const history = useHistory();
    const [createTaskLoading, setCreateTaskLoading] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [storeOptions, setStoreOptions] = useState<{ value: string, label: string }[]>([]);
    const [storeSelected, setStoreSelected] = useState<{ value: string, label: string }[]>([{ value: "", label: "Loading stores..." }]);
    const [createTaskFile, setCreateTaskFile] = useState<FileList | null>(null);
    const [createTaskFileSrc, setCreateTaskFileSrc] = useState("");
    const [dueDate, setDueDate] = useState(new Date());
    const [taskStartDay, setTaskStartDay] = useState(new Date());
    const [taskEndDay, setTaskEndDay] = useState(new Date());
    const [taskTypeIsManual, setTaskTypeIsManual] = useState(true);
    const [userRole, setUserRole] = useState<string | undefined>("associate");
    const [viewByStore, setViewByStore] = useState(true);
    const [viewByOptionSelected, setViewByOptionSelected] = useState<{ value: string, label: string }>({ value: "", label: "Loading options..." });
    const [viewByOptions, setViewByOptions] = useState<{ value: string, label: string }[]>([]);
    const handleClickChangeViewBy = () => {
        setViewByStore(!viewByStore);
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
            console.log("userClustersDetails");
            console.log(userClustersDetails);
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
        loadOptions();
    }, [viewByStore]);
    useEffect(() => {
        if (userRole === 'associate') {
            return;
        }
        loadOptions();
    }, [userRole]);
    const {
        getIdTokenClaims
    } = useAuth0();

    const handleClickChangeTaskType = () => {
        setTaskTypeIsManual(!taskTypeIsManual);
    }
    const handleClickCreateTask = async () => {
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;

        // validate inputs
        setCreateTaskLoading(true);
        if (taskTitle == "") {
            cogoToast.error("Please provide a title for the task");
            setCreateTaskLoading(false);
            return;
        }
        if (!viewByOptionSelected) {
            cogoToast.error("Please select a store");
            setCreateTaskLoading(false);
            return;
        }
        const formData = new FormData();
        if (createTaskFile) {
            formData.append('image', createTaskFile[0]);
        }
        formData.append('title', taskTitle);
        formData.append('description', taskDescription);
        formData.append('type', "manual");
        // formData.append('type', "promotion");
        // const startDay = moment(taskStartDay).format('YYYY-MM-DD');
        // const endDay = moment(taskEndDay).format('YYYY-MM-DD');
        // const formattedPromotionMetadata = {
        //     "start_date": startDay,
        //     "end_date": endDay
        // };
        // formData.append('promotion_metadata', JSON.stringify(formattedPromotionMetadata));
        // console.log(formattedPromotionMetadata);
        const formattedDueDate = moment(dueDate).format('YYYY-MM-DD h:mm');
        formData.append('due_date', formattedDueDate);
        let taskCreateResult: any = undefined;
        // console.lo
        let storeSelected = [viewByOptionSelected];
        if (!(viewByStore)) {
            const selectedClusterDetails = await getClusterDetails(viewByOptionSelected.value, idToken);
            const selectedStoreDetails: any[] = selectedClusterDetails ?.stores;
            if (selectedStoreDetails.length > 0) {
                storeSelected = selectedStoreDetails.map(storeDetails => {
                    return {
                        value: storeDetails._id,
                        label: storeDetails.name
                    };
                })
            } else {
                storeSelected = [];
                cogoToast.error("This cluster has no store associated. Please contact support.");
                return;

            }
        }
        for (let store of storeSelected) {
            const submitcreteTaskEndPoint = `${REACT_APP_API_ENDPOINT}/store/${store.value}/task`;
            const submitCreateTaskEndPointResponse = await fetch(submitcreteTaskEndPoint, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${idToken}`
                },
                body: formData
            });
            taskCreateResult = await submitCreateTaskEndPointResponse.json();
            console.log(taskCreateResult);
            if (taskCreateResult.success) {
                setCreateTaskLoading(false);
                cogoToast.success(`Task created for ${store.label}`);
            }
        }
        if ((!taskCreateResult) || !(taskCreateResult.success)) {
            cogoToast.error(`The task could not be created`);
            return;
        }
        if (taskCreateResult.data.taskId) {
            history.push(`/customtask/${taskCreateResult.data.taskId}`);
            return;
        }
        setCreateTaskLoading(false);
    }
    // IIFE
    const validateAccess = async () => {
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
        setStoreSelected([userStoresOptions[0]]);
    };
    const handleClickAddFile = (selectedFile: FileList | null) => {
        setCreateTaskFile(selectedFile);
    }
    useEffect(() => {
        if (!(createTaskFile)) {
            return;
        }
        if (createTaskFile[0]) {
            setCreateTaskFileSrc(URL.createObjectURL(createTaskFile[0]));
        }
    }, [createTaskFile]);
    // as the component mounts
    useEffect(() => {
        validateAccess();
    }, []);
    return (
        <div className="createtask">
            <div className="createtask__content">
                {
                    (userRole === 'headquarter') ?
                        <div className="createtask__content createtask__viewBy">
                            <div className="createtask__viewBy__selector switch-field">
                                <input
                                    type="radio"
                                    id="radio-one-1"
                                    name="switch-two"
                                    value="Create by store"
                                    checked={viewByStore}
                                    onChange={handleClickChangeViewBy}
                                />
                                <label htmlFor="radio-one-1">Create by store</label>
                                <input
                                    type="radio"
                                    id="radio-two-1"
                                    name="switch-two"
                                    value="Create by cluster"
                                    checked={!(viewByStore)}
                                    onChange={handleClickChangeViewBy}
                                />
                                <label htmlFor="radio-two-1">Create by cluster</label>
                            </div>
                            <div className="createtask__viewBy__dropdown">
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
                {/* <div className="createtask__content__item">
                    <Select
                        value={storeSelected}
                        isMulti
                        onChange={(selectedOption: any) => { setStoreSelected(selectedOption); }}
                        options={storeOptions}
                    />
                </div> */}
                <div className="createtask__content__item">
                    <label className="pure-material-textfield-outlined">
                        <input placeholder=" "
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            onBlur={(e) => setTaskTitle(e.target.value)}
                        />
                        <span>Title</span>
                    </label>
                </div>
                <div className="createtask__content__item">
                    <label className="pure-material-textfield-outlined">
                        <textarea placeholder=" "
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            onBlur={(e) => setTaskDescription(e.target.value)}
                        />
                        <span>Description</span>
                    </label>
                </div>
                <div className="createtask__content__item createtask__file">
                    <div className="createtask__file__preview">
                        <img src={createTaskFileSrc} alt="" />
                    </div>
                    <label className="btn btn--primary-yellow btn--full-width createtask__file__button">
                        <input
                            type="file"
                            accept="image/x-png,image/jpeg"
                            id="activity-file-input"
                            onChange={(e) => handleClickAddFile(e.target.files)}

                        />
                        {
                            (createTaskFileSrc === "") ?
                                "Add an image"
                                :
                                "Replace the image"
                        }
                    </label>
                </div>
                <div className="createtask__content__item">
                    <div className="createtask__due-date__label">
                        Due date
                    </div>
                    <div className="createtask__due-date__picker">
                        <DatePicker
                            selected={dueDate}
                            onChange={(date: any) => setDueDate(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption="time"
                            dateFormat="MMMM d, yyyy h:mm aa"
                        />
                    </div>
                </div>

                <div className="createtask__content__item">
                    <div className="createtask__cta">
                        {
                            (createTaskLoading) ?
                                <LoadingButton
                                    className="btn btn--primary btn--full-width"
                                    onClick={() => { return null; }}
                                /> :
                                <Button
                                    className="btn btn--primary btn--full-width"
                                    onClick={handleClickCreateTask}
                                    buttonText="Create a custom task"
                                />
                        }
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CreateCustomTask;
