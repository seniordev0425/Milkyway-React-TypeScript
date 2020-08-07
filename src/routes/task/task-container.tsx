import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';

import './task.scss';
import loadingIcon from '../../images/loading-2.gif';

import defaultAvatar from '../../images/default-avatar-v2.svg';
import completed from '../../images/completed.png';
import completedDisabled from '../../images/completed-disabled.png';
import review from '../../images/review.png';
import reviewDisabled from '../../images/review-disabled.png';

import { useAuth0 } from '../../lib/auth';

import { useHistory, useRouteMatch } from "react-router-dom";
import { Button, LoadingButton } from '../../components/button/button-container';
import TaskActivities from '../../components/taskactivities/taskactivities-container';
import cogoToast from 'cogo-toast';
import { namespace, REACT_APP_API_ENDPOINT } from "../../lib/getuserdetails";
import {
    getTaskDetails,
    getStoreDetails,
    markTaskAsDone,
    updateTask,
    fetchPutApi,
    fetchGetApi,
    convertDate,
    addComment,
    convertToFromNow,
    getUser,
    fetchDelApi
} from "../../lib/apiWrappers";
import cancel from "../../images/cancel.png";

const customAddActivityModalStyles = {
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

const customTaskDoneModalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        overflow: "none"
        // height: '60vh', // <-- This sets the height
    }
};

const Task: React.FC = () => {
    const history = useHistory();
    const match = useRouteMatch();
    const [taskData, setTaskData] = useState<any>({});
    const [taskComments, setTaskComments] = useState<any[]>([]);
    const [userId, setUserId] = useState("");
    const [taskId, setTaskId] = useState("");
    const [taskCreatedBy, setTaskCreatedBy] = useState("");
    const [taskType, setTaskType] = useState("");
    const [storeName, setStoreName] = useState(undefined);
    const [markAsDoneLoading, setMarkAsDoneLoading] = useState(false);
    const [markAsNotDoneLoading, setMarkAsNotDoneLoading] = useState(false);
    const [requestReviewLoading, setRequestReviewLoading] = useState(false);
    const [reviewRequested, setReviewRequested] = useState(false);
    const [reviewCompleted, setReviewCompleted] = useState(false);
    const [taskisDone, setTaskIsDone] = useState(false);
    const [addActivityModalIsOpen, setAddActivityModalIsOpen] = useState(false);
    const [assignTaskModalIsOpen, setAssignTaskModalIsOpen] = useState(false);
    const [activityDescription, setActivityDescription] = useState("");
    const [taskComment, setTaskComment] = useState("");
    const [taskAssignedTo, setTaskAssignedTo] = useState<string[]>([]);
    const [addCommentsLoading, setAddCommentsLoading] = useState(false);
    const [activityFile, setActivityFile] = useState<FileList | null>(null);
    const [activityFileSrc, setActivityFileSrc] = useState("");
    const [activitySubmitting, setActivitySubmitting] = useState(false);
    const [userRole, setUserRole] = useState("associate");
    const [storeAssociates, setStoreAssociates] = useState([]);
    const [selectedAssociate, setSelectedAssociate] = useState([{ value: "", label: "No associates found" }]);
    const [assignTaskLoading, setAssignTaskLoading] = useState(false);
    const [taskDoneModalIsOpen, setTaskDoneModalIsOpen] = useState(false);
    const [taskLoading, setTaskLoading] = useState(false);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const {
        getIdTokenClaims
    } = useAuth0();
    const getTask = async () => {
        setTaskLoading(true);
        const params: any = match.params;
        const taskId = params.id ?? "";
        if (!(taskId)) {
            cogoToast.error("No tasks found");
            return null;
        }
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const claimsData = claims[`${namespace}claims/`];
        const uId = claimsData ?.app_metadata ?.uid;
        setUserId(uId);
        const taskDetails = await getTaskDetails(taskId, idToken);
        if ((!taskDetails.success)) {
            cogoToast.error("No tasks found");
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
        setTaskData(taskDetails.data);
        console.log(taskDetails.data);
        setTaskId(taskDetails.data ?._id);
        setTaskCreatedBy(taskDetails.data ?._created_by);
        const storeId = taskDetails.data ?._store;
        const storeDetails = await getStoreDetails(storeId, idToken);
        setStoreName(storeDetails.name);
        setReviewRequested(taskDetails.data ?.review_requested);
        setReviewCompleted(taskDetails.data ?.review_completed);
        setTaskComments(taskDetails.data.comments);
        setTaskType(taskDetails.data ?.type);
        const taskStatus = taskDetails.data ?.status;
        const taskAssignedTo: string[] = taskDetails.data ?._assigned_to;
        if (taskAssignedTo) {
            console.log(taskAssignedTo);
            let assignedUsersDetails: string[] = [];
            for (let taskId of taskAssignedTo) {
                const userDetails = await getUser(taskId, idToken);
                assignedUsersDetails.push(userDetails ?.data ?.full_name);
            }
            setTaskAssignedTo(assignedUsersDetails);
            console.log(assignedUsersDetails);
            // const assignedUsersDetails: string[] = taskAssignedTo.map(taskId => {

            // })
        }
        if ((taskStatus === "cv_pending") || (taskStatus === "completed")) {
            console.log("setting task as done");
            setTaskIsDone(true);
        }
        if (userRole !== "associate") {
            const getStoreAssociatesEndPoint = `${REACT_APP_API_ENDPOINT}/users/?pendingApproval=false&role=associate`;
            const responseJsonStoreAssociatesJson = await fetchGetApi(getStoreAssociatesEndPoint, idToken);
            const fetchedAssociates: any = [];
            if (responseJsonStoreAssociatesJson.success) {
                for (let associate of responseJsonStoreAssociatesJson.data) {
                    fetchedAssociates.push({
                        label: associate ?.full_name,
                        value: associate ?._id
                });
                }
                setStoreAssociates(fetchedAssociates);
                if (fetchedAssociates.length > 0) {
                    setSelectedAssociate([fetchedAssociates[0]]);
                }
            }
        }
        setTaskLoading(false);
    }
    const handleClickTaskDelete = async () => {
        setDeleteLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const taskDeleteEndPoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}`;
        const responseTaskDelete = await fetchDelApi(taskDeleteEndPoint, idToken);
        console.log(responseTaskDelete);
        if (responseTaskDelete.success) {
            setDeleteLoading(false);
            cogoToast.success("Task successfully deleted");
            if (taskType === 'audit') {
                history.push("/audittasks");
            } else if (taskType === 'manual') {
                history.push("/customtasks");
            } else if (taskType === 'promotion') {
                history.push("/promotiontasks");
            } else {
                history.push("/home");
            }
            return;
        }
        setDeleteLoading(false);
        cogoToast.error(responseTaskDelete.data);
        return;
    }
    const handleClickMarkAsNotDone = async () => {
        setMarkAsNotDoneLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        let newStatus = "draft";
        if (taskAssignedTo) {
            newStatus = "assigned";
        }
        const markTaskAsNotDoneResponse = await updateTask(
            taskId,
            idToken, {
                "title": taskData ?.title,
                "description": taskData ?.description,
                "status": newStatus,
                "redo_requested": true
            });
        if (markTaskAsNotDoneResponse.success) {
            setTaskIsDone(false);
            cogoToast.success("Task is marked as not done");
            setMarkAsNotDoneLoading(false);
            return;
        }
        cogoToast.error("Task could not be marked as not done");
        setMarkAsNotDoneLoading(false);
        return;
    }
    const handleClickMarkAsDone = async () => {
        setMarkAsDoneLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const markTaskAsDoneResponse = await markTaskAsDone(
            taskId,
            idToken,
            userId);
        if (markTaskAsDoneResponse.success) {
            cogoToast.success("Task is completed");
            setTaskIsDone(true);
            setTaskDoneModalIsOpen(false);
        } else {
            cogoToast.error("Task could not be completed");
        }
        setMarkAsDoneLoading(false);
    }
    const handleClickMarkAsReviewed = async () => {
        console.log("handle click mark as reviewed");
        setRequestReviewLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        if (!(taskId)) {
            return;
        }
        const updateTaskReviewCompletedEndpoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/reviewed`;
        const reviewCompletedUpdateResponse = await fetchPutApi(
            updateTaskReviewCompletedEndpoint,
            idToken, {
            });
        console.log(reviewCompletedUpdateResponse);
        if (reviewCompletedUpdateResponse.success) {
            cogoToast.success(`Task is marked as reviewed`);
            setReviewCompleted(true);
            setReviewRequested(false);
            setRequestReviewLoading(false);
            setTaskDoneModalIsOpen(false);
        } else {
            cogoToast.error(`Task could not be marked as reviewed`);
            setRequestReviewLoading(true);
        }
        return;
    }
    const handleClickRequestReview = async () => {
        console.log("handle click request review");
        setRequestReviewLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        if ((!taskId)) {
            return;
        }
        const updateTaskReviewRequestedEndpoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/request-review`;
        const reviewRequestedUpdateResponse = await fetchPutApi(
            updateTaskReviewRequestedEndpoint,
            idToken, {
            });
        console.log(reviewRequestedUpdateResponse);
        if ((reviewRequestedUpdateResponse.success) || (reviewRequestedUpdateResponse.status)) {
            cogoToast.success("Task is marked for review");
            setReviewRequested(true);
            setRequestReviewLoading(false);
            setTaskDoneModalIsOpen(false);
        } else {
            cogoToast.error("Task could not be marked for review");
            setRequestReviewLoading(false);
        }
        return;
    }
    // const handleClickMarkAsDone = async () => {
    //     setMarkAsDoneLoading(true);
    //     const claims: any = await getIdTokenClaims();
    //     const idToken = claims.__raw;
    //     if (taskisDone) {
    //         const markTaskAsNotDoneResponse = await updateTask(
    //             taskId,
    //             idToken, {
    //                 "title": taskData ?.title,
    //                 "description": taskData ?.description,
    //                 "status": "draft",
    //                 "redo_requested": true
    //             });
    //         if (markTaskAsNotDoneResponse.success) {
    //             setTaskIsDone(false);
    //             cogoToast.success("Task is marked as not done");
    //             setMarkAsDoneLoading(false);
    //             return;
    //         }
    //         cogoToast.error("Task could not be marked as not done");
    //         setMarkAsDoneLoading(false);
    //         return;
    //     }
    //     const markTaskAsDoneResponse = await markTaskAsDone(
    //         taskId,
    //         idToken,
    //         reviewRequested,
    //         userId);
    //     if (markTaskAsDoneResponse.success) {
    //         setTaskIsDone(true);
    //         cogoToast.success("Task is completed");
    //     } else {
    //         cogoToast.error("Task could not be completed");
    //     }
    //     setMarkAsDoneLoading(false);
    // }
    const handleClickAddFile = (selectedFile: FileList | null) => {

        setActivityFile(selectedFile);
    }
    useEffect(() => {
        if (!(activityFile)) {
            return;
        }
        if (activityFile[0]) {
            setActivityFileSrc(URL.createObjectURL(activityFile[0]));
        }
    }, [activityFile]);
    const handleClickSubmitActivity = async () => {
        setActivitySubmitting(true);
        // TODO: Very repetitive
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const formData = new FormData();
        if (activityFile) {
            formData.append('image', activityFile[0]);
        }
        formData.append('description', activityDescription);
        const submitActivityofTaskEndPoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/work-detail`;
        const submitActivityofTaskEndPointResponse = await fetch(submitActivityofTaskEndPoint, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${idToken}`
            },
            body: formData
        });
        const submitActivityofTaskEndPointResponseJson = await submitActivityofTaskEndPointResponse.json();
        if (!(submitActivityofTaskEndPointResponseJson.success)) {
            cogoToast.error(submitActivityofTaskEndPointResponseJson.data);
        } else {
            // cogoToast.success("Activity added successfully");
            if (taskType === 'audit') {
                const markTaskAsDoneResponse = await markTaskAsDone(
                    taskId,
                    idToken,
                    userId);
                if (markTaskAsDoneResponse.success) {
                    cogoToast.success("Task is completed");
                    setTaskIsDone(true);
                } else {
                    cogoToast.error("Task could not be completed");
                }
            }
            setAddActivityModalIsOpen(false);
        }
        setActivitySubmitting(false);

    }
    const onChangeReviewRequested = (e: any) => {
        let userReviewRequested = false;
        if (e.target.value == "on") {
            userReviewRequested = true;
        }
        setReviewRequested(userReviewRequested);
    }
    const updateTaskReviewRequested = async () => {
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        if ((!taskId)) {
            return;
        }
        const updateTaskReviewRequestedEndpoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/request-review`;
        const reviewRequestedUpdateResponse = await fetchPutApi(
            updateTaskReviewRequestedEndpoint,
            idToken, {
            });
        console.log(reviewRequestedUpdateResponse);
        if (reviewRequestedUpdateResponse.success) {
            cogoToast.success("Task is marked for review");
            setRequestReviewLoading(false);
            setTaskDoneModalIsOpen(false);
            return;
        } else {
            cogoToast.error("Task could not be marked for review");
            setRequestReviewLoading(false);
            return;
        }
    }
    // useEffect(() => {
    //     updateTaskReviewRequested();
    // }, [reviewRequested]);

    const onChangeReviewCompleted = async (e: any) => {
        let userReviewCompleted = false;
        if (e.target.value == "on") {
            userReviewCompleted = true;
            const claims: any = await getIdTokenClaims();
            const idToken = claims.__raw;
            if (!(taskId)) {
                return;
            }
            const updateTaskReviewCompletedEndpoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/reviewed`;
            const reviewCompletedUpdateResponse = await fetchPutApi(
                updateTaskReviewCompletedEndpoint,
                idToken, {
                });
            if (reviewCompletedUpdateResponse.success) {
                cogoToast.success(`Task is marked as reviewed`);
            } else {
                cogoToast.error(`Task could not be marked as reviewed`);
            }
        }
        console.log(userReviewCompleted);
        setReviewCompleted(userReviewCompleted);
    }
    // const updateTaskReviewCompleted = async () => {
    //     if (!(reviewCompleted)) {
    //         return;
    //     }

    // }
    // useEffect(() => {
    //     updateTaskReviewCompleted();
    // }, [reviewCompleted]);
    useEffect(() => {
        console.log("gettask got called");
        getTask();
    }, [activitySubmitting,
            addCommentsLoading,
            assignTaskModalIsOpen,
            taskisDone,
            reviewCompleted,
            reviewRequested
        ]);
    useEffect(() => {
        getTask();
    }, []);
    const handleClickAddComment = async () => {
        setAddCommentsLoading(true);
        if (!(taskComment)) {
            cogoToast.error("Comments can not be empty");
            setAddCommentsLoading(false);
            return;
        }
        if ((!taskId)) {
            return;
        }
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const addCommentResponseJson = await addComment(taskId, taskComment, idToken);
        if (addCommentResponseJson.success) {
            cogoToast.success("Comment added successfully");
            setTaskComment("");
        } else {
            cogoToast.error("Comment could not be added");
        }
        setAddCommentsLoading(false);
    }
    const handleClickAssignTask = async () => {
        setAssignTaskLoading(true);
        console.log("selectedAssociate");
        console.log(selectedAssociate);
        if (!(selectedAssociate)) {
            cogoToast.error("Task could not be assigned");
            return;
        }
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        const markAssignTaskPoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/assign`;
        const user_ids = selectedAssociate.map(elem => { return elem.value });
        console.log("user_ids");
        console.log(user_ids);
        const responseAssignTaskJson = await fetchPutApi(markAssignTaskPoint, idToken, {
            "user_ids": user_ids
        })
        if (responseAssignTaskJson.success) {
            cogoToast.success("Task has been assigned");
            setAssignTaskLoading(false);
            setAssignTaskModalIsOpen(false);
            return;
        }
        cogoToast.error("Task could not be assigned");
        setAssignTaskLoading(true);
        return;
    }
    const handleClickCancelReview = async () => {
        console.log("handle click cancel review");
        setRequestReviewLoading(true);
        const claims: any = await getIdTokenClaims();
        const idToken = claims.__raw;
        if ((!taskId)) {
            return;
        }
        const updateTaskReviewRequestedEndpoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/request-review`;
        const reviewRequestedUpdateResponse = await fetchPutApi(
            updateTaskReviewRequestedEndpoint,
            idToken, {
                "unsetReviewRequest": true
            });
        console.log(reviewRequestedUpdateResponse);
        if (reviewRequestedUpdateResponse.success) {
            cogoToast.success("Request for review is cancelled");
            setReviewRequested(false);
            setRequestReviewLoading(false);
        } else {
            cogoToast.error(reviewRequestedUpdateResponse.data);
            setRequestReviewLoading(false);
        }
        return;
    }
    // if (taskLoading) {
    //     return (
    //         <div className="content content--task task task--loading">
    //             <div className="loadingSpinner"></div>
    //         </div>
    //     )
    // }
    return (
        <div className="content content--task task">
            <div className={`task__loading-overlay--${taskLoading}`}>
                <div className="loadingSpinner"></div>
            </div>
            <div className="content__content task__content">
                <div className="content__item task__item task__item--title">
                    <div className="task__item--title__content">
                        {taskData ?.title}
                    </div>
                    {
                        ((userRole !== 'associate') && (userId === taskCreatedBy)) ?
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
                {
                    (taskData ?.description) ?
                        <div className="content__item task__item task__item--description">
                            {taskData ?.description}
                        </div>
                        :
                        <div>
                        </div>
                }
                {
                    (taskData ?.created_at) ?
                        <div className="content__item task__item task__item--createdAt">
                            <div className="content__item task__item--createdAt__title">
                                Created at
                            </div>
                            <div className="content__item task__item--createdAt__content">
                                {convertDate(taskData ?.created_at)}
                            </div>
                        </div>
                        :
                        null
                }
                {
                    (taskData ?.due_date) ?
                        <div className="content__item task__item task__item--due-date">
                            <div className="content__item task__item--due-date__title">
                                Due by
                            </div>
                            <div className="content__item task__item--due-date__content">
                                {convertDate(taskData ?.due_date)}
                            </div>
                        </div>
                        :
                        null
                }
                {
                    (taskData ?.promotion_metadata) ?
                        <div className="content__item task__item task__item--due-date">
                            <div className="content__item task__item--due-date__title">
                                Start date
                            </div>
                            <div className="content__item task__item--due-date__content">
                                {convertDate(taskData ?.promotion_metadata ?.start_date)}
                            </div>
                        </div>
                        :
                        null
                }
                {
                    (taskData ?.promotion_metadata) ?
                        <div className="content__item task__item task__item--due-date">
                            <div className="content__item task__item--due-date__title">
                                End date
                            </div>
                            <div className="content__item task__item--due-date__content">
                                {convertDate(taskData ?.promotion_metadata ?.end_date)}
                            </div>
                        </div>
                        :
                        null
                }
                {
                    (taskData ?.image_url) ?
                        <div className="content__item task__item task__item--image">
                            <img className="task__item--image__content" src={taskData ?.image_url} />
                        </div>
                        :
                        null
                }
                {
                    ((storeName) && (userRole == 'headquarter')) ?
                        <div className="content__item task__item task__item--store">
                            <span className="task__item--store__content">{storeName}</span>
                        </div>
                        :
                        <div>
                        </div>
                }
                <div className="task__review-section">
                    <div className="task__review-tags">
                        {
                            (reviewRequested) ?
                                <div className="tasks__item__tag tasks__item__tag--review-requested">
                                    Review requested
                                </div>
                                :
                                null
                        }
                        {
                            (reviewCompleted) ?
                                <div className="tasks__item__tag tasks__item__tag--review-completed">
                                    Review completed
                                </div>
                                :
                                null
                        }
                        {
                            (taskType) ?
                                <div className={`tasks__item__tag tasks__item__tag--${taskType}`}>
                                    {taskType}
                                </div>
                                :
                                null
                        }
                    </div>

                    {/* {
                        (userRole === 'associate') ?
                            <div className="content__item task__item--reviewRequested">
                                <div className="task__item--reviewRequested__label">
                                    Request review
                            </div>
                                <div className="task__item--reviewRequested__input">
                                    <input
                                        className="tgl tgl-light"
                                        id="cb1"
                                        type="checkbox"
                                        checked={reviewRequested}
                                        onChange={onChangeReviewRequested}
                                    />
                                    <label className="tgl-btn" htmlFor="cb1"></label>
                                </div>
                            </div>
                            :
                            <div className="content__item task__item--reviewRequested">
                                <div className="task__item--reviewRequested__label">
                                    Review requested
                            </div>
                                <div className="task__item--reviewRequested__input">
                                    {
                                        (reviewRequested) ?
                                            "Yes"
                                            :
                                            "No"
                                    }
                                </div>
                            </div>

                    }
                    {
                        (userRole == 'manager') ?
                            <div className="content__item task__item--reviewCompleted">
                                <div className="task__item--reviewCompleted__label">
                                    Review completed
                            </div>
                                <div className="task__item--reviewCompleted__input">
                                    <input
                                        className="tgl tgl-light"
                                        id="cb2"
                                        type="checkbox"
                                        checked={reviewCompleted}
                                        onChange={onChangeReviewCompleted}
                                    />
                                    <label className="tgl-btn" htmlFor="cb2"></label>
                                </div>
                            </div>
                            :
                            <div className="content__item task__item--reviewCompleted">
                                <div className="task__item--reviewCompleted__label">
                                    Review completed
                            </div>
                                <div className="task__item--reviewCompleted__input">
                                    {
                                        (reviewCompleted) ?
                                            "Yes"
                                            :
                                            "No"
                                    }
                                </div>
                            </div>
                    } */}
                    {
                        ((userRole === "manager") && (taskType !== "audit")) ?
                            <div className="content__item task__item--assignTask">
                                <div className="task__item--assignTask__label">
                                    Task assigned to
                            </div>
                                <div className="task__item--assignTask__input">
                                    <div className="task__item--assignTask__name">
                                        {(taskAssignedTo !== []) ?
                                            taskAssignedTo.join(", ")
                                            :
                                            "None"
                                        }
                                    </div>

                                    <button className="task__item--assignTask__button btn" onClick={() => setAssignTaskModalIsOpen(true)}>
                                        Change
                                </button>
                                </div>
                            </div>
                            : null
                    }
                </div>
                <div className="content__item task__item task__item--activity activity">
                    <div className="activity__title">
                        Images
                    </div>
                    {
                        (taskData ?.taskWorks ?.length > 0) ?
                            <div className="activity__content">
                                <TaskActivities
                                    activities={taskData.taskWorks}
                                />
                            </div>
                            :
                            <div className="activity__content activity__content--empty">
                                No Images found
                            </div>
                    }
                </div>
                <div className="content__item task__item task__item--comments comments">
                    <div className="activity__title">
                        Comments
                    </div>
                    <div className="activity__content">
                        {
                            // TODO: Should be made separate component later
                            (taskData ?.comments ?.length > 0) ?
                                <div className="activity__content">
                                    {
                                        taskComments.map(comment => {
                                            return (
                                                <div className="comment">
                                                    <div className="comment__header">
                                                        <div className="comment__header__left">
                                                            <div className="comment__pic">
                                                                {
                                                                    (comment ?._user ?.image) ?
                                                                        null
                                                                        // TODO: When user picture is added, use this
                                                                        :
                                                                        <img src={defaultAvatar} alt="" />
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="comment__header__right">
                                                            <div className="comment__header__right__top">
                                                                <div className="comment__name">
                                                                    {comment ?._user ?.full_name}
                                                                </div>
                                                                <div className="comment__role">
                                                                    {comment ?._user ?.role}
                                                                </div>
                                                            </div>
                                                            <div className="comment__header__right__bottom">
                                                                <div className="comment__time">
                                                                    {convertToFromNow(comment ?.updated_at)}
                                                                </div>
                                                            </div>
                                                            <div className="comment__body">
                                                                <pre className="comment__body__content">
                                                                    {comment ?.description }
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                :
                                <div className="activity__content activity__content--empty">
                                    No comments found
                            </div>
                        }
                    </div>
                    {
                        (taskType !== 'audit') ?
                            <div className="comments__add">
                                <label className="pure-material-textfield-outlined">
                                    <textarea placeholder=" "
                                        value={taskComment}
                                        onChange={(e) => setTaskComment(e.target.value)}
                                        onBlur={(e) => setTaskComment(e.target.value)}
                                    />
                                    <span>Your comment</span>
                                </label>
                                {
                                    (addCommentsLoading) ?
                                        <LoadingButton
                                            className="btn btn--primary"
                                            onClick={() => { return null; }}
                                        /> :
                                        <Button
                                            className="btn btn--primary"
                                            onClick={handleClickAddComment}
                                            buttonText="Add comment"
                                        />
                                }
                            </div>
                            :
                            null
                    }
                </div>
            </div>
            <div className="content__cta task__cta">
                {
                    (((taskType === 'audit') && (taskisDone)) || (userRole === 'headquarter')) ?
                        null :
                        <div className={`task__cta__item task__cta__item--${userRole} task__cta__item--${taskType}`}>
                            <button className="task__cta__button task__cta__button--add-activity btn btn--primary" onClick={() => { setAddActivityModalIsOpen(true) }}>
                                {
                                    ((taskType == "audit") && (userRole == "associate")) ?
                                        "Capture photo" :
                                        "Capture photo"
                                }
                            </button>
                        </div>
                }
                {
                    // remove the proceed button for audit type of tasks
                    ((userRole !== 'headquarter') && (taskType !== 'audit')) ?
                        // Don't show this button to headquarter at all
                        <div className="task__cta__item">
                            {
                                // Review is requested for the task already
                                (reviewRequested) ?
                                    // An associate can not do anything till the review is completed
                                    (userRole === 'associate') ?
                                        (requestReviewLoading) ?
                                            <button className="task__cta__button task__cta__button--highlight btn" onClick={() => { return null; }}>
                                                <div className="loadingSpinner"></div>
                                            </button>
                                            :
                                            <button className="task__cta__button task__cta__button--highlight btn" onClick={handleClickCancelReview}>
                                                Cancel review
                                            </button>
                                        // A manager can mark reviewed or completed
                                        :
                                        <button className={`task__cta__button task__cta__button--highlight${(taskisDone) ? "-dark" : ""} btn`} onClick={() => setTaskDoneModalIsOpen(true)}>
                                            Proceed
                                        </button>
                                    :
                                    // review is not requested
                                    (taskisDone) ?
                                        // the task is already done
                                        (markAsNotDoneLoading) ?
                                            <button className="task__cta__button task__cta__button--highlight-dark btn" onClick={() => { return null; }}>
                                                <div className="loadingSpinner"></div>
                                            </button>
                                            :
                                            <button className="task__cta__button task__cta__button--highlight-dark btn" onClick={handleClickMarkAsNotDone}>
                                                Mark as not done
                                            </button>
                                        :
                                        // review is not requested and task is not done
                                        <button className={`task__cta__button task__cta__button--highlight${(taskisDone) ? "-dark" : ""} btn`} onClick={() => setTaskDoneModalIsOpen(true)}>
                                            Proceed
                                        </button>
                            }
                        </div>
                        : null
                }
            </div>
            <Modal
                isOpen={addActivityModalIsOpen}
                onRequestClose={() => setAddActivityModalIsOpen(false)}
                style={customAddActivityModalStyles}
                contentLabel="Add photo"
            >
                <div className="addactivitymodal">
                    <div className="addactivitymodal__header">
                        <div className="addactivitymodal__title">
                            {
                                ((taskType == "audit") && (userRole == "associate")) ?
                                    "Capture photo" :
                                    "Capture photo"
                            }
                        </div>
                        <div className="addactivitymodal__close" onClick={() => setAddActivityModalIsOpen(false)}>
                            <img src={cancel} alt="" />
                        </div>
                    </div>
                    <div className="addactivitymodal__content">
                        <div className="addactivitymodal__content__item addactivitymodal__file">
                            <div className="addactivitymodal__file__preview">
                                <img src={activityFileSrc} alt="" />
                            </div>
                            <label className="btn btn--primary-yellow btn--full-width addactivitymodal__file__button">
                                <input
                                    type="file"
                                    accept="image/x-png,image/jpeg"
                                    id="activity-file-input"
                                    onChange={(e) => handleClickAddFile(e.target.files)}

                                />
                                {
                                    (activityFileSrc === "") ?
                                        "Add an image"
                                        :
                                        "Replace the image"
                                }
                            </label>
                        </div>
                        <div className="addactivitymodal__content__item">
                            <label className="pure-material-textfield-outlined">
                                <textarea placeholder=" "
                                    value={activityDescription}
                                    onChange={(e) => setActivityDescription(e.target.value)}
                                    onBlur={(e) => setActivityDescription(e.target.value)}
                                />
                                <span>Description</span>
                            </label>
                        </div>
                        <div className="addactivitymodal__cta">
                            {
                                (activitySubmitting) ?
                                    <button className="addactivitymodal__cta__button btn btn--full-width" onClick={() => { return null; }}>
                                        <div className="loadingSpinner"></div>
                                    </button>
                                    :
                                    <button className="addactivitymodal__cta__button btn btn--full-width" onClick={handleClickSubmitActivity}>
                                        Submit
                                    </button>
                            }
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={assignTaskModalIsOpen}
                onRequestClose={() => setAssignTaskModalIsOpen(false)}
                style={customAddActivityModalStyles}
                contentLabel="Assign task"
            >
                <div className="addactivitymodal">
                    <div className="addactivitymodal__header">
                        <div className="addactivitymodal__title">
                            Assign task
                        </div>
                        <div className="addactivitymodal__close" onClick={() => setAssignTaskModalIsOpen(false)}>
                            <img src={cancel} alt="" />
                        </div>
                    </div>
                    <div className="addactivitymodal__content">
                        {
                            (userRole == 'manager') ?
                                <div className="content__item task__item--taskassign">
                                    <div className="task__item--taskassign__select">
                                        <Select
                                            // isMulti
                                            value={selectedAssociate}
                                            onChange={(selectedOption: any) => { setSelectedAssociate([selectedOption]); }}
                                            options={storeAssociates}
                                        />
                                    </div>
                                    <div className="task__item--taskassign__cta">
                                        {
                                            (assignTaskLoading) ?
                                                <LoadingButton
                                                    className="btn btn--primary btn--full-width"
                                                    onClick={() => { return null; }}
                                                /> :
                                                <Button
                                                    className="btn btn--primary btn--full-width"
                                                    onClick={handleClickAssignTask}
                                                    buttonText="Assign task"
                                                />
                                        }
                                    </div>
                                </div>
                                :
                                null
                        }
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={taskDoneModalIsOpen}
                onRequestClose={() => setTaskDoneModalIsOpen(false)}
                style={customTaskDoneModalStyles}
                contentLabel="Proceed with task"
                overlayClassName="taskdonemodal__overlay"
            // className="taskdonemodal__wrapper"
            >
                <div className="taskdonemodal">
                    <div className="taskdonemodal__header" onClick={() => setTaskDoneModalIsOpen(false)}>
                        <img className="taskdonemodal__header__icon" src={cancel} />
                    </div>
                    {
                        (reviewRequested) ?
                            // Review is requested
                            (userRole === 'manager') ?
                                // review is requested and the role is a manager
                                (requestReviewLoading) ?
                                    <button className="taskdonemodal__item taskdonemodal__item--request-review btn btn--full-width" onClick={() => { return null }}>
                                        <div className="loadingSpinner"></div>
                                    </button>
                                    :
                                    <button className="taskdonemodal__item taskdonemodal__item--request-review" onClick={handleClickMarkAsReviewed}>
                                        <div className="taskdonemodal__item__icon">
                                            <img src={review} alt="" />
                                        </div>
                                        <div className="taskdonemodal__item__content">
                                            Mark as reviewed
                                        </div>
                                    </button>
                                :
                                // review is requested and the role is not manager
                                // it should not even come here
                                null
                            :
                            // Review is not requested
                            (userRole === "associate") ?
                                // Review requested.. loading
                                (requestReviewLoading) ?
                                    <button className="taskdonemodal__item taskdonemodal__item--request-review btn btn--full-width" onClick={() => { return null }}>
                                        <div className="loadingSpinner"></div>
                                    </button>
                                    :
                                    <button className="taskdonemodal__item taskdonemodal__item--request-review btn btn--full-width" onClick={handleClickRequestReview}>
                                        <div className="taskdonemodal__item__icon">
                                            <img src={review} alt="" />
                                        </div>
                                        <div className="taskdonemodal__item__content">
                                            Request review
                                        </div>
                                    </button>

                                :
                                <button className="taskdonemodal__item taskdonemodal__item--request-review btn btn--full-width" onClick={() => { return null }}>
                                    <div className="taskdonemodal__item__icon">
                                        <img src={reviewDisabled} alt="" />
                                    </div>
                                    <div className="taskdonemodal__item__content taskdonemodal__item__content--disabled">
                                        Request review
                                    </div>
                                </button>
                    }
                    {/* <div className="taskdonemodal__item taskdonemodal__item--mark-completed"> */}
                    {
                        (reviewRequested) ?
                            <button className="taskdonemodal__item taskdonemodal__item--mark-completed btn btn--full-width" onClick={() => { return null }}>
                                <div className="taskdonemodal__item__icon">
                                    <img src={completedDisabled} alt="" />
                                </div>
                                <div className="taskdonemodal__item__content taskdonemodal__item__content--disabled">
                                    Mark as completed
                                </div>
                            </button>
                            :
                            (markAsDoneLoading) ?
                                <button className="taskdonemodal__item taskdonemodal__item--mark-completed btn btn--full-width" onClick={() => { return null }}>
                                    <div className="loadingSpinner"></div>
                                </button>
                                :
                                <button className="taskdonemodal__item taskdonemodal__item--mark-completed btn btn--full-width" onClick={handleClickMarkAsDone}>
                                    <div className="taskdonemodal__item__icon">
                                        <img src={completed} alt="" />
                                    </div>
                                    <div className="taskdonemodal__item__content">
                                        Mark as completed
                                    </div>
                                </button>
                    }

                    {/* </div> */}
                </div>
            </Modal>
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
                        Are you sure to delete the task?
                    </div>
                    <div className="deletemodal__cta">
                        {
                            (deleteLoading) ?
                                <button className="deletemodal__cta__button btn btn--danger" onClick={() => { return null; }}>
                                    <div className="loadingSpinner"></div>
                                </button>
                                :
                                <button className="deletemodal__cta__button btn btn--danger" onClick={handleClickTaskDelete}>
                                    Yes
                                </button>
                        }
                        <button className="deletemodal__cta__button btn" onClick={() => setDeleteModalIsOpen(false)}>
                            No
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    )
}

export default Task;