const iTagForIssueTypes = (type) => {
    //0 la story
    if (type === 0) {
        return <i className="fa-solid fa-bookmark mr-2" style={{ color: '#65ba43', fontSize: '20px' }} ></i>
    }
    //1 la task
    if (type === 1) {
        return <i className="fa-solid fa-square-check mr-2" style={{ color: '#4fade6', fontSize: '20px' }} ></i>
    }
    //2 la bug
    if (type === 2) {
        return <i className="fa-solid fa-circle-exclamation mr-2" style={{ color: '#cd1317', fontSize: '20px' }} ></i>
    }
}

const iTagForPriorities = (priority) => {
    if (priority === 0) {
        return <i className="fa-solid fa-arrow-up" style={{ color: '#cd1317', fontSize: '20px' }} />
    }
    if (priority === 1) {
        return <i className="fa-solid fa-arrow-up" style={{ color: '#e9494a', fontSize: '20px' }} />
    }
    if (priority === 2) {
        return <i className="fa-solid fa-arrow-up" style={{ color: '#e97f33', fontSize: '20px' }} />
    }
    if (priority === 3) {
        return <i className="fa-solid fa-arrow-down" style={{ color: '#2d8738', fontSize: '20px' }} />
    }
    if (priority === 4) {
        return <i className="fa-solid fa-arrow-down" style={{ color: '#57a55a', fontSize: '20px' }} />
    }
}

module.exports = {iTagForIssueTypes, iTagForPriorities}