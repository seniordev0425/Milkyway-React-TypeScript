import moment from 'moment'

const getUTCTime =  function (localTime: string) {
    return moment(localTime, "HH:mm:ss").utc().format("HH:mm:ss")
}

const getCurrentTimeZone = function() {
    // Change this
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

const getLocalTime = function (utcTime: string) {
    return moment.utc(utcTime, "HH:mm:ss").local().format('HH:mm:ss')
}


export {
    getUTCTime,
    getCurrentTimeZone,
    getLocalTime
}