import dayjs from "dayjs"
import { DateTime } from "luxon"

const regexs = [
    /^(\d+)w([1-6])d([1-9]|1\d|2[0-4])h([1-9]|[1-5]\d|)m$/, //_w_d_h_m
    /^(\d+)d([1-9]|1\d|2[0-4])h([1-9]|[1-5]\d|)m$/,  //_d_h_m
    /^(\d+)h([1-9]|[1-5]\d|)m$/,   //h_m
    /^(\d+)w([1-7])d([1-9]|1\d|2[0-4])h$/, //_w_d_h
    /^(\d+)w([1-7])d([1-9]|[1-5]\d|)m$/, //_w_d_m
    /^(\d+)w([1-9]|1\d|2[0-4])h([1-9]|[1-5]\d|)m$/, //_w_h_m
    /^(\d+)w[1-7]d$/,   //_w_d
    /^(\d+)w([1-9]|1\d|2[0-4])h$/, //_w_h
    /^(\d+)w([1-9]|[1-5]\d|)m$/,    //_w_m
    /^(\d+)d([1-9]|1\d|2[0-4])h$/,   //_d_h
    /^(\d+)d([1-9]|[1-5]\d|)m$/, //_d_m
    /^(\d+)w$/, //w
    /^(\d+)d$/, //d
    /^(\d+)h$/, //h 
    /^(\d+)m$/, //m
]

const splitTimeToObject = (time) => {
    var indexForW = -1, startForW = 0, indexForD = -1, startForD = 0, indexForH = -1, startForH = 0, indexForM = -1, startForM = 0
    var startIndex = 0
    var timeObject = []
    if (time !== null || time !== undefined) {
        for (var index = 0; index < time?.length; index++) {
            if (time[index] === 'w') {
                startForW = startIndex
                indexForW = index
                startIndex = index
            }
            if (time[index] === 'd') {
                startForD = startIndex
                indexForD = index
                startIndex = index
            }
            if (time[index] === 'h') {
                startForH = startIndex
                indexForH = index
                startIndex = index
            }
            if (time[index] === 'm') {
                startForM = startIndex
                indexForM = index
                startIndex = index
            }
        }
    }

    if (indexForW !== -1) {
        timeObject.push({
            key: 'w',
            value: time.substring(startForW !== 0 ? startForW + 1 : 0, indexForW)
        })
    }
    if (indexForD !== -1) {
        timeObject.push({
            key: 'd',
            value: time.substring(startForD !== 0 ? startForD + 1 : 0, indexForD)
        })
    }
    if (indexForH !== -1) {
        timeObject.push({
            key: 'h',
            value: time.substring(startForH !== 0 ? startForH + 1 : 0, indexForH)
        })
    }
    if (indexForM !== -1) {
        timeObject.push({
            key: 'm',
            value: time.substring(startForM !== 0 ? startForM + 1 : 0, indexForM)
        })
    }
    return timeObject
}
export const validateOriginalTime = (input) => {
    for (const regex of regexs) {
        if (input.match(regex)) {
            return true
        }
    }
    return false
}

export const calculateTimeAfterSplitted = (time) => {
    const timeObject = splitTimeToObject(time)
    var totalTimeConvertToMinute = 0
    for (var index = 0; index < timeObject.length; index++) {
        if (timeObject[index].key === 'w') {
            totalTimeConvertToMinute += parseInt(timeObject[index].value) * 7 * 24 * 60
        } else if (timeObject[index].key === 'd') {
            totalTimeConvertToMinute += parseInt(timeObject[index].value) * 24 * 60
        } else if (timeObject[index].key === 'h') {
            totalTimeConvertToMinute += parseInt(timeObject[index].value) * 60
        } else if (timeObject[index].key === 'm') {
            totalTimeConvertToMinute += parseInt(timeObject[index].value)
        }
    }

    return totalTimeConvertToMinute
}

export const convertMinuteToFormat = (time) => {
    if (time === 0 || time === undefined || time === NaN) {
        return "None"
    }
    var timeAfterConverting = ''

    //truong hop neu lon hon week
    if (time >= 7 * 24 * 60) {
        const getWeek = parseInt(time / (7 * 24 * 60))
        timeAfterConverting += getWeek + 'w'
        var timeRemaining = time - getWeek * 7 * 24 * 60
        //neu truong hop lon hon 1 ngay
        if (timeRemaining >= 24 * 60) {
            const getDay = parseInt(timeRemaining / (24 * 60))
            //neu lon hon 1 ngay
            timeAfterConverting += getDay + 'd'
            timeRemaining -= getDay * 24 * 60
            //neu lon hon 1 gio
            if (timeRemaining >= 60) {
                const getHour = parseInt(timeRemaining / 60)
                timeAfterConverting += getHour + 'h'
                timeRemaining -= getHour * 60
                if (timeRemaining !== 0) {
                    timeAfterConverting += timeRemaining + 'm'
                }
            } else {
                //neu nho hon 1 gio
                timeAfterConverting += timeRemaining + 'm'
            }
        } else {
            const getHour = parseInt(timeRemaining / 60)
            if (getHour >= 1) {
                timeAfterConverting += getHour + 'h'
                timeRemaining -= getHour * 60
                if (timeRemaining !== 0) {
                    timeAfterConverting += timeRemaining + 'm'
                }
            } else {
                timeAfterConverting += timeRemaining + 'm'
            }
        }
    } else {
        //truong hop nho hon 1 tuan
        const getDay = parseInt(time / (24 * 60))
        if (getDay >= 1) {
            timeAfterConverting += getDay + 'd'
            time -= getDay * 24 * 60
            //neu lon hon 1 gio
            if (time >= 60) {
                const getHour = parseInt(time / 60)
                timeAfterConverting += getHour + 'h'
                time -= getHour * 60
                if (time !== 0) {
                    timeAfterConverting += time + 'm'
                }
            } else {
                if (time !== 0) {
                    timeAfterConverting += time + 'm'
                }
            }
        } else {
            //truong hop nho hon 1 ngay
            const getHour = parseInt(time / 60)
            if (getHour >= 1) {
                timeAfterConverting += getHour + 'h'
                time -= getHour * 60
                if (time !== 0) {
                    timeAfterConverting += time + 'm'
                }
            } else {
                if (time !== 0) {
                    timeAfterConverting += time + 'm'
                }
            }
        }
    }

    return timeAfterConverting
}

export const calculateTaskRemainingTime = (currentDate, endDate) => {
    if (endDate !== null) {
        const diff = endDate.diff(currentDate, 'day', true);
        const days = Math.floor(diff);
        const hours = Math.floor((diff - days) * 24);

        return `${days} days ${hours} hours`
    }
    return null
}

export const convertTime = (commentTime, type) => {
    if (type === false) {
        const diff = DateTime.now().diff(DateTime.fromISO(commentTime), ['minutes', 'hours', 'days', 'months']).toObject();

        if (diff.hours >= 1) {
            return `${Math.round(diff.hours)} hour ago`
        }
        if (diff.minutes >= 1) {
            return `${Math.round(diff.minutes)} minutes ago`
        }
        if (diff.days >= 1) {
            return `${Math.round(diff.days)} days ago`
        }
        if (diff.months >= 1) {
            return `${Math.round(diff.months)} months ago`
        } else {
            return 'a few second ago'
        }
    }else {
        return dayjs(commentTime).format('D MMM, YYYY [at] h:mm A')
    }
}