export const iTagForIssueTypes = (type) => {    
    //0 la story
    if (type == 0) {
        return <i className="fa-solid fa-bookmark mr-2" style={{ color: '#65ba43', fontSize: '20px' }} ></i>
    }
    //1 la task
    if (type == 1) {
        return <i className="fa-solid fa-square-check mr-2" style={{ color: '#4fade6', fontSize: '20px' }} ></i>
    }
    //2 la bug
    if (type == 2) {
        return <i className="fa-solid fa-circle-exclamation mr-2" style={{ color: '#cd1317', fontSize: '20px' }} ></i>
    }
}

export const iTagForPriorities = (priority) => {    
    if (priority == 0) {
        return <i className="fa fa-angle-double-up" style={{ color: '#cd1317', fontSize: '20px' }} />
    }
    if (priority == 1) {
        return <i className="fa fa-chevron-up" style={{ color: '#e9494a', fontSize: '20px' }} />
    }
    if (priority == 2) {
        return <i className="fa fa-equals" style={{ color: '#e97f33', fontSize: '20px' }} />
    }
    if (priority == 3) {
       
        return <i className="fa fa-chevron-down" style={{ color: '#2d8738', fontSize: '20px' }} />
    }
    if (priority == 4) {
        return <i className="fa fa-angle-double-down" style={{ color: '#57a55a', fontSize: '20px' }} />
    }
}
export const priorityTypeOptions = [
    { label: <span className="align-items-center d-flex">{iTagForPriorities(0)} Highest</span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(1)} High</span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(2)} Medium</span>, value: 2 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(3)} Low</span>, value: 3 },
    { label: <span className="align-items-center d-flex">{iTagForPriorities(4)} Lowest</span>, value: 4 }
]
export const issueTypeOptions = [
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(0)} Story</span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(1)} Task</span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(2)} Bug</span>, value: 2 }
]
export const issueTypeWithoutOptions = [
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(0)} </span>, value: 0 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(1)} </span>, value: 1 },
    { label: <span className="align-items-center d-flex">{iTagForIssueTypes(2)} </span>, value: 2 }
]