import { REACT_APP_API_ENDPOINT } from "./getuserdetails";
import moment from 'moment';

type storeResultType = {
    _id?: string,
    _client?: string,
    name?: string,
    code?: string,
    created_at?: string
}

export const fetchGetApi = async (endpoint: string, idToken: string) => {
    const response = await fetch(endpoint, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        }
    });
    const responseJson = await response.json();
    return responseJson;
}

export const fetchPostApi = async (endpoint: string, idToken: string, body: {}) => {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const responseJson = await response.json();
    return responseJson;
}

export const fetchPutApi = async (endpoint: string, idToken: string, body: {}) => {
    const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const responseJson = await response.json();
    return responseJson;
}

export const fetchDelApi = async (endpoint: string, idToken: string) => {
    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        }
    });
    const responseJson = await response.json();
    return responseJson;
}

export const getStoreIdsOfClient = async (clientId: string, idToken: string) => {
    const storesEndPoint = `${REACT_APP_API_ENDPOINT}/client/${clientId}/stores`;
    const responseJson = await fetchGetApi(storesEndPoint, idToken);
    const responseData: storeResultType[] = responseJson.data;
    const storeIds = responseData.map(result => {
        return result ?._id;
    })
    return storeIds;
}

export const getClusterIdsOfClient = async (clientId: string, idToken: string) => {
    const clustersEndPoint = `${REACT_APP_API_ENDPOINT}/clusters`;
    const responseJson = await fetchGetApi(clustersEndPoint, idToken);
    const responseData: storeResultType[] = responseJson.data;
    const clusterIds = responseData.map(result => {
        return result ?._id;
    })
    return clusterIds;
}

export const getStoreDetails = async (storeId: string | undefined, idToken: string) => {
    if (storeId === undefined) {
        return {};
    }
    const storeDetailsEndPoint = `${REACT_APP_API_ENDPOINT}/store/${storeId}`;
    const responseJson = await fetchGetApi(storeDetailsEndPoint, idToken);
    return responseJson.data;
}

export const getClusterDetails = async (clusterId: string | undefined, idToken: string) => {
    if (clusterId === undefined) {
        return {};
    }
    const clusterDetailsEndPoint = `${REACT_APP_API_ENDPOINT}/cluster/${clusterId}`;
    const responseJson = await fetchGetApi(clusterDetailsEndPoint, idToken);
    console.log(responseJson);
    return responseJson.data;
}

export const createTask = async (
    storeId: string,
    taskTitle: string,
    taskDescription: string,
    type: string,
    idToken: string
) => {
    if (storeId == undefined) {
        return null;
    }
    const storeDetailsEndPoint = `${REACT_APP_API_ENDPOINT}/store/${storeId}/task`;
    const responseJson = await fetchPostApi(storeDetailsEndPoint, idToken, {
        "title": taskTitle,
        "description": taskDescription,
        "type": type
    });
    return responseJson.data;
}

export const getTaskDetails = async (taskId: string, idToken: string) => {
    const taskDetailsEndPoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}`;
    const responseJson = await fetchGetApi(taskDetailsEndPoint, idToken);
    return responseJson;
}

export const getAuditScheduleDetails = async (auditScheduleId: string, idToken: string) => {
    const auditScheduleDetailsEndPoint = `${REACT_APP_API_ENDPOINT}/schedule-task/${auditScheduleId}`;
    const responseJson = await fetchGetApi(auditScheduleDetailsEndPoint, idToken);
    return responseJson;
}


export const markTaskAsDone = async (taskId: string, idToken: string, userId: string) => {
    const markTaskAsDoneEndPoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/completed`;
    const responseJson = await fetchPutApi(markTaskAsDoneEndPoint, idToken, {
        "user_id": userId
    })
    return responseJson;
}

export const updateTask = async (taskId: string, idToken: string, body: {}) => {
    const updateTaskEndPoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}`;
    const responseJson = await fetchPutApi(updateTaskEndPoint, idToken, body)
    return responseJson;
}

export const submitActivityofTask = async (taskId: string, idToken: string, body: {}) => {
    const submitActivityofTaskEndPoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/work-detail`;
    const responseJson = await fetchPostApi(submitActivityofTaskEndPoint, idToken, body);
    return responseJson;
}

export const convertDate = (timestamp: string) => {
    const d = new Date(timestamp);
    return moment(d).format('MMM Do YYYY, h:mm a');
}

export const getReport = async (storeOrClusterId: string, viewByStore: boolean, reportType: string | undefined, reportFilter: string | undefined, startDate: string, endDate: string, idToken: string) => {
    let reportEndPoint = "";
    console.log(reportFilter);
    let filterBy = "store";
    if (!viewByStore) {
        filterBy = "cluster";
    }
    if (reportType === 'promotion') {
        reportEndPoint = `${REACT_APP_API_ENDPOINT}/promotion-report?${filterBy}_id=${storeOrClusterId}&start_date=${startDate}&end_date=${endDate}`;
    } else {
        if (reportFilter) {
            reportEndPoint = `${REACT_APP_API_ENDPOINT}/report?${filterBy}_id=${storeOrClusterId}&view=${reportType}&filter=${reportFilter}&start_date=${startDate}&end_date=${endDate}`;
        } else {
            reportEndPoint = `${REACT_APP_API_ENDPOINT}/report?${filterBy}_id=${storeOrClusterId}&view=${reportType}&start_date=${startDate}&end_date=${endDate}`;
        }
    }
    console.log("reportendpoint");
    console.log(reportEndPoint);
    const responseJson = await fetchGetApi(reportEndPoint, idToken);
    return responseJson;
}

export const getUser = async (userId: string, idToken: string) => {
    const userEndPoint = `${REACT_APP_API_ENDPOINT}/user/${userId}`;
    const responseUserJson = await fetchGetApi(userEndPoint, idToken);
    console.log("getuser");
    console.log(userId);
    console.log(userEndPoint);
    console.log(responseUserJson);
    return responseUserJson;
}

export const getClient = async (idToken: string) => {
    const clientEndPoint = `${REACT_APP_API_ENDPOINT}/client`;
    const responseClientJson = await fetchGetApi(clientEndPoint, idToken);
    return responseClientJson;
}

export const addComment = async (taskId: string, comment: string, idToken: string) => {
    const addCommentEndPoint = `${REACT_APP_API_ENDPOINT}/task/${taskId}/comment`;
    const responseAddCommentJson = await fetchPostApi(addCommentEndPoint, idToken, {
        description: comment
    });
    return responseAddCommentJson;
}

export const convertToFromNow = (timestamp: string) => {
    const d = new Date(timestamp);
    return moment(d).fromNow();
}

export const convertToHumanReadableTime = (storedTime: number) => {
    console.log(storedTime);
    const hours = Math.floor(storedTime / 3600);
    storedTime %= 3600;
    const minutes = Math.floor(storedTime / 60);
    let hoursDisplay = "";
    let minutesDisplay = "";
    if (hours === 0) {
        hoursDisplay = "00";
    } else {
        hoursDisplay = `${hours}`;
    }
    if (minutes === 0) {
        minutesDisplay = "00";
    } else {
        minutesDisplay = `${minutes}`;
    }
    return `${hoursDisplay}:${minutesDisplay}`;
}