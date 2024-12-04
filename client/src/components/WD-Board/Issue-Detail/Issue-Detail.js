import { Avatar, Breadcrumb, Button, Checkbox, Col, Input, InputNumber, Row, Select, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getIssuesBacklog, getIssuesInProject } from '../../../redux/actions/IssueAction';
import { GetProcessListAction, GetSprintListAction } from '../../../redux/actions/ListProjectAction';
import { iTagForPriorities, iTagForIssueTypes, issueTypeOptions } from '../../../util/CommonFeatures';
import { getComponentList, getEpicList, getVersionList } from '../../../redux/actions/CategoryAction';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import './Issue-Detail.css'
import InfoModal from '../../Modal/InfoModal/InfoModal';
import { getValueOfArrayObjectFieldInIssue, getValueOfNumberFieldInIssue, getValueOfObjectFieldInIssue, getValueOfStringFieldInIssue } from '../../../util/IssueFilter';
import { ExportCSV } from '../../../util/CSV';
const { TextArea } = Input;
export default function IssueDetail() {
    const location = useLocation()

    const navigate = useNavigate()
    
    // useEffect(() => {
    //     navigate(`${location.pathname}${location.search}`, { replace: true });
    // }, [location, navigate]);
    
    const typeViews = new URLSearchParams(location.search)

    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const processList = useSelector(state => state.listProject.processList)
    const componentList = useSelector(state => state.categories.componentList)
    const epicList = useSelector(state => state.categories.epicList)
    const versionList = useSelector(state => state.categories.versionList)
    const sprintList = useSelector(state => state.listProject.sprintList)
    const issuesInProject = useSelector(state => state.issue.issuesInProject)
    const userInfo = useSelector(state => state.user.userInfo)
    const { id, issueId } = useParams()

    // if (issueId === 'issue-detail' && issuesInProject?.length > 0) {
    //     navigate(`/projectDetail/${id}/issues/issue-detail/${issuesInProject[0]?._id}`)
    // }

    const [typesSearch, setTypesSearch] = useState({
        types: [],
        search: 0,
        isClicked: false
    })
    
    const [moreFieldsSearch, setMoreFieldsSearch] = useState(typeViews.get('componentid') ? [{
        values: [typeViews.get('componentid')],
        isSearch: 0,
        isClicked: true,
        search_id: 'component'
    }] : [])

    console.log("moreFieldsSearch ", moreFieldsSearch);
    

    const [statusesSearch, setStatusesSearch] = useState({
        statuses: [],
        search: 0,
        isClicked: false
    })


    const [assigneesSearch, setAssigneesSearch] = useState({
        assignees: [],
        search: 0,
        isClicked: false
    })


    useEffect(() => {
        if (typesSearch.types.length === 0 && typesSearch.isClicked) {
            setTypesSearch(prev => {
                return { ...prev, isClicked: false }
            })
        }
    }, [typesSearch])

    useEffect(() => {
        moreFieldsSearch.forEach(ele => {
            if (ele.values.length === 0 && ele.isClicked) {
                setMoreFieldsSearch(prev => {
                    const temp = [...moreFieldsSearch]
                    const index = temp.findIndex(field => field.search_id === ele.search_id)
                    temp[index].isClicked = false
                    return [...temp]
                })
            }
        })

    }, [moreFieldsSearch])

    useEffect(() => {
        if (statusesSearch.statuses.length === 0 && statusesSearch.isClicked) {
            setStatusesSearch(prev => {
                return { ...prev, isClicked: false }
            })
        }
    }, [statusesSearch])

    useEffect(() => {
        if (assigneesSearch.assignees.length === 0 && assigneesSearch.isClicked) {
            setAssigneesSearch(prev => {
                return { ...prev, isClicked: false }
            })
        }
    }, [assigneesSearch])

    useEffect(() => {
        dispatch(getIssuesInProject(id, null))
        dispatch(GetProcessListAction(id))
        dispatch(getEpicList(id))
        dispatch(getComponentList(id))
        dispatch(GetSprintListAction(id, null))
        dispatch(getEpicList(id))
        dispatch(getVersionList(id))
    }, [])


    const searchIssues = (arrs) => {
        const data = arrs
            ?.filter(issue => {
                if (typesSearch.types.length > 0) {
                    const data = typesSearch.types.includes(getValueOfNumberFieldInIssue(issue, 'issue_status')?.toString())
                    return typesSearch.search === 0 ? data : !data
                }
                return true
            })
            ?.filter(issue => {
                if (statusesSearch.statuses.length > 0) {
                    const data = statusesSearch.statuses.includes(getValueOfObjectFieldInIssue(issue, 'issue_type')?._id.toString())
                    return statusesSearch.search === 0 ? data : !data
                }
                return true
            })
            ?.filter(issue => {
                if (assigneesSearch.assignees.length > 0) {
                    const data = assigneesSearch.assignees.map(userid => {
                        if (getValueOfObjectFieldInIssue(issue, 'assignees')?.map(currentUser => {
                            if (currentUser) return currentUser?._id?.toString()
                            return 'null'
                        })?.includes(userid)) {
                            return true
                        }
                        return assigneesSearch.assignees.includes('null')
                    })
                    return assigneesSearch.search === 0 ? data.includes(true) : !data.includes(true)
                }
                return true
            })
            ?.filter((issue, index) => {
                const result = moreFieldsSearch.map((field) => {
                    if (field.values.length === 0) {
                        return true
                    } else {
                        if (['current_sprint', 'epic_link', 'fix_version'].includes(field.search_id)) {
                            const currentValue = field.values.includes(getValueOfObjectFieldInIssue(issue, field.search_id)?._id)
                            return field.isSearch === 0 ? currentValue : !currentValue
                        } else if (['component'].includes(field.search_id)) {
                            const getComponents = getValueOfArrayObjectFieldInIssue(issue, field.search_id)
                            if(!getComponents) return false
                            const currentValue = getComponents?.map(value => {
                                if (field.values.includes(value._id)) {
                                    return true
                                }
                                return false
                            })
                            console.log("currentValue ", currentValue);
                            
                            return field.isSearch === 0 ? currentValue?.includes(true) : !currentValue?.includes(true)
                        }
                        else if (Number.isInteger(field.values[0])) {
                            const currentValue = field.values.includes(getValueOfNumberFieldInIssue(issue, field.search_id)?.toString())
                            return field.isSearch === 0 ? currentValue : !currentValue
                        } else if (typeof field.values[0] === 'string') {
                            const currentValue = field.values.includes(getValueOfStringFieldInIssue(issue, field.search_id)?.toString())
                            return field.isSearch === 0 ? currentValue : !currentValue
                        } else {
                            return false
                        }
                    }
                })

                console.log("result ", result);
                

                return moreFieldsSearch.length > 0 ? (result.includes(false) ? false : true) : true
            })
        
            console.log("data ", data, 'search ', moreFieldsSearch);
            
            return data
    }

    const dispatch = useDispatch()

    const renderAllIssuesInProject = () => {
        const getAllIssues = searchIssues(issuesInProject)?.map((issue, index) => {
            return <li onClick={() => {
                navigate(`/projectDetail/${id}/issues/issue-detail/${issue?._id}?typeview=detailview`)
            }} className={`list-group-item`} key={issue._id.toString()} style={{ backgroundColor: issueId === issue._id ? '#E9F2FF' : '#ffff ' }}>
                <p style={{ textDecoration: getValueOfObjectFieldInIssue(issue, 'issue_type')?.type_process === 'done' ? 'line-through' : 'none' }}>{getValueOfStringFieldInIssue(issue, "summary")}</p>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='d-flex align-items-center'>
                        <span className='font-weight-bold mr-2'>{projectInfo?.key_name}-{issue.ordinal_number}</span>
                        {iTagForIssueTypes(getValueOfNumberFieldInIssue(issue, "issue_status"), null, null, projectInfo?.issue_types_default)}
                        {iTagForPriorities(getValueOfNumberFieldInIssue(issue, "issue_priority"), null, null)}
                    </div>
                    <Avatar icon={<UserOutlined />} />
                </div>
            </li>
        })
        return <ul className="list-group">
            {getAllIssues}
        </ul>
    }

    const renderViewDetail = () => {
        return <div className='row h-100'>
            <div className='issue-info-left col-2' style={{ border: '1px solid #dddd', padding: 0, borderRadius: '5px', height: 'fit-content', backgroundColor: '#091e420f' }}>
                <div className='d-flex justify-content-between'>
                    <button className='btn btn-transparent' style={{ fontSize: 14, fontWeight: 'bold' }}>Created <i className="fa-solid fa-caret-down ml-2"></i></button>
                    <div>
                        <button className='btn btn-transparent' style={{ fontSize: 13 }}><i className="fa-solid fa-sort"></i></button>
                        <button className='btn btn-transparent' onClick={() => {
                            dispatch(getIssuesBacklog(id))
                        }}><i className="fa-solid fa-arrows-rotate" style={{ fontSize: 13 }}></i></button>
                    </div>
                </div>
                <div style={{ maxHeight: 600, scrollbarWidth: 'none', overflowY: 'auto' }}>
                    {renderAllIssuesInProject()}
                </div>
                <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>{searchIssues(issuesInProject).length === 0 ? "0 of 0" : `1 - ${searchIssues(issuesInProject).length} of ${searchIssues(issuesInProject).length}`}</div>
            </div>
            {issueId === 'issue-detail' ? <div className='col-10'>{ }</div> : <div className='col-10 h-100'>
                <InfoModal
                    userInfo={userInfo}
                    colLeft={8}
                    colRight={4}
                    height={800}
                    issueIdForIssueDetail={issueId}
                    displayNumberCharacterInSummarySubIssue={25}
                />
            </div>}
        </div>
    }

    const renderColumn = () => {
        if (projectInfo?.issue_fields_config?.length > 0) {
            const getAllFields = []
            projectInfo?.issue_fields_config?.forEach(field => {
                if (field.field_type_in_issue === 'object' || field.field_type_in_issue === 'array-object') {
                    getAllFields.push({ column_type: `${field.field_key_issue}_id`, column_name: `${field.field_name} Id` })
                    getAllFields.push({ column_type: `${field.field_key_issue}_name`, column_name: `${field.field_name} Name` })
                }
                else {
                    getAllFields.push({
                        column_type: field.field_key_issue,
                        column_name: field.field_name
                    })
                }
            })

            //add more columns
            getAllFields.push({ column_type: 'issue_id', column_name: 'Issue Id' })

            getAllFields.push({ column_type: 'issue_status', column_name: 'Status' })
            getAllFields.push({ column_type: 'issue_status_name', column_name: 'Status Name' })

            getAllFields.push({ column_type: 'project_id', column_name: 'Project Id' })
            getAllFields.push({ column_type: 'project_name', column_name: 'Project Name' })

            getAllFields.push({ column_type: 'creator_id', column_name: 'Creator Id' })
            getAllFields.push({ column_type: 'creator_name', column_name: 'Creator Name' })


            getAllFields.push({ column_type: 'createAt', column_name: 'Create At' })
            getAllFields.push({ column_type: 'updateAt', column_name: 'Last Updated' })
            getAllFields.push({ column_type: 'isFlagged', column_name: 'Flagged' })
            getAllFields.push({ column_type: 'is_permissions', column_name: 'Permissions' })
            getAllFields.push({ column_type: 'isCompleted', column_name: 'Issue Completed' })
            const data = getAllFields.map(field => {
                return {
                    title: field.column_name,
                    dataIndex: field.column_type,
                    key: field.column_type,
                    width: 'fit-content'
                }
            })
            return data
        }
        return []
    }

    const getAttributeNameOfIssue = (currentIssue, key_name, type) => {
        var value = null
        if (type === 'object') {
            if (key_name.includes('epic')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'epic_link') ? getValueOfObjectFieldInIssue(currentIssue, 'epic_link')?.epic_name : null
            } else if (key_name.includes('version')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'fix_version') ? getValueOfObjectFieldInIssue(currentIssue, 'fix_version')?.version_name : null
            } else if (key_name.includes('issue_type')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'issue_type') ? getValueOfObjectFieldInIssue(currentIssue, 'issue_type')?.name_process : null
            } else if (key_name.includes('issue_status')) {
                value = projectInfo?.issue_types_default?.find(field => field.icon_id == getValueOfNumberFieldInIssue(currentIssue, 'issue_status'))?.icon_name
            } else if (key_name.includes('current_sprint')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'current_sprint') ? getValueOfObjectFieldInIssue(currentIssue, 'current_sprint')?.sprint_name : null
            } else if (key_name.includes('project')) {
                value = currentIssue.project_id.name_project
            } else if (key_name.includes('parent')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'parent') ? `${projectInfo?.key_name} ${currentIssue.ordinal_number}` : null
            } else if (key_name.includes('creator')) {
                value = currentIssue['creator'] ? currentIssue['creator']?.username : null
            } else {
                const obj = getValueOfObjectFieldInIssue(currentIssue, key_name.substring(0, key_name.lastIndexOf('_')))
                value = obj ? obj.username?.toString() : null
            }
        } else if (type === 'array-object') {
            const getInfoIssueIndex = currentIssue.issue_data_type_array_object.findIndex(field => field.field_key_issue === key_name.substring(0, key_name.indexOf('_')))
            if (getInfoIssueIndex !== -1) {
                currentIssue.issue_data_type_array_object[getInfoIssueIndex]?.value?.forEach((field, index) => {
                    var objName = ''
                    if (currentIssue.issue_data_type_array_object[getInfoIssueIndex].propertyModel === 'components') {
                        objName = 'component_name'
                    } else if (currentIssue.issue_data_type_array_object[getInfoIssueIndex].propertyModel === 'users') {
                        objName = 'username'
                    }
                    if (index === 0) {
                        value = field[objName]
                    } else {
                        value += field[objName]
                    }
                    if (index !== currentIssue.issue_data_type_array_object[getInfoIssueIndex]?.value.length - 1) {
                        value += ', '
                    }
                })
            }

        }

        return { [key_name]: value }
    }

    const getAttributeIdOfIssue = (currentIssue, key_id, type) => {
        var value = null
        if (type === 'object') {
            if (key_id.includes('epic')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'epic_link') ? getValueOfObjectFieldInIssue(currentIssue, 'epic_link')?._id?.toString() : null
            } else if (key_id.includes('version')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'fix_version') ? getValueOfObjectFieldInIssue(currentIssue, 'fix_version')?._id?.toString() : null
            } else if (key_id.includes('project')) {
                value = currentIssue.project_id._id
            } else if (key_id.includes('current_sprint')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'current_sprint') ? getValueOfObjectFieldInIssue(currentIssue, 'current_sprint')?._id?.toString() : null
            } else if (key_id.includes('issue_type')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'issue_type') ? getValueOfObjectFieldInIssue(currentIssue, 'issue_type')?._id?.toString() : null
            } else if (key_id.includes('parent')) {
                value = getValueOfObjectFieldInIssue(currentIssue, 'parent') ? getValueOfObjectFieldInIssue(currentIssue, 'parent')?._id?.toString() : null
            } else if (key_id.includes('creator')) {
                value = currentIssue['creator'] ? currentIssue['creator']?._id : null
            } else {
                const obj = getValueOfObjectFieldInIssue(currentIssue, key_id.substring(0, key_id.lastIndexOf('_')))
                value = obj ? obj._id : null
            }
        } else if (type === 'array-object') {
            const data = getValueOfArrayObjectFieldInIssue(currentIssue, key_id.substring(0, key_id.indexOf('_')))
            data?.forEach((field, index) => {
                if (field) {
                    if (index === 0) {
                        value = field?._id
                    } else {
                        value += field?._id
                    }
                    if (index !== data.length - 1) {
                        value += ', '
                    }
                }
            })
        }
        return { [key_id]: value }
    }

    const renderDatasource = () => {
        const temp = searchIssues([...issuesInProject])
        if (temp?.length > 0 && renderColumn()?.length > 0) {
            const data = temp.map(current_issue => {
                const dataIssues = renderColumn()?.map(field => {
                    if (field.key === 'issue_id') {
                        return { [field.key]: current_issue._id }
                    }

                    const objectIndex = current_issue.issue_data_type_object.findIndex(current_field => current_field.field_key_issue === field.key.substring(0, field.key.indexOf('_')))
                    if (objectIndex !== -1) {
                        if (field.key?.includes('_id')) {
                            return getAttributeIdOfIssue(current_issue, field.key, 'object')
                        } else if (field.key?.includes('_name')) {
                            return getAttributeNameOfIssue(current_issue, field.key, 'object')
                        }
                    }


                    const arrayObjectIndex = current_issue.issue_data_type_array_object.findIndex(current_field => current_field.field_key_issue === field.key.substring(0, field.key.indexOf('_')))
                    if (arrayObjectIndex !== -1) {
                        if (field.key?.includes('_id')) {
                            return getAttributeIdOfIssue(current_issue, field.key, 'array-object')
                        } else if (field.key?.includes('_name')) {
                            return getAttributeNameOfIssue(current_issue, field.key, 'array-object')
                        }
                    }

                    const stringIndex = current_issue.issue_data_type_string.findIndex(current_field => current_field.field_key_issue === field.key)
                    if (stringIndex !== -1) {
                        if (field.key.toLocaleLowerCase() === 'description') {
                            return { [field.key]: current_issue.issue_data_type_string[stringIndex]?.value }
                        }
                        return { [field.key]: current_issue.issue_data_type_string[stringIndex]?.value }
                    }

                    const numberIndex = current_issue.issue_data_type_number.findIndex(current_field => current_field.field_key_issue === field.key)
                    if (numberIndex !== -1) {
                        return { [field.key]: current_issue.issue_data_type_number[numberIndex]?.value }
                    }

                    if (field.key?.includes('_id')) {
                        return getAttributeIdOfIssue(current_issue, field.key, 'object')
                    } else if (field.key?.includes('_name')) {
                        return getAttributeNameOfIssue(current_issue, field.key, 'object')
                    }

                    return { [field.key]: current_issue[field.key]?.toString() ? current_issue[field.key]?.toString() : null }
                })
                return dataIssues.reduce((result, current_obj) => {
                    const key = Object.keys(current_obj)[0]
                    result[key] = current_obj[key]
                    return result
                }, {})
            })

            return data
        }
        return []
    }

    function generateRandomNumberString(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }

    const renderListView = () => {
        return <div style={{ height: 500 }}>
            <Table
                dataSource={renderDatasource()}
                columns={renderColumn()}
                bordered
                size='large'
                pagination={{
                    pageSize: 20
                }}
                scroll={{
                    x: 'max-content'
                }}
                locale={{
                    emptyText: () => {
                        return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 450 }}>
                            <img style={{ height: 100 }} src='https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/search-no-results.10b14394.svg' />
                            <h4 className='mt-3'>No issues were found matching your search</h4>
                        </div>
                    }
                }}
            />
        </div>
    }

    const renderSearchTypes = () => {
        return <div className='dropdown'>
            <Button
                type={typesSearch.isClicked ? 'primary' : 'default'}
                className='mr-2 ml-2 btn-options'
                id="btn-option1 dropdownTypeMenu"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                Type
                {
                    typesSearch.isClicked ? <Select
                        style={{ height: 25, margin: '0 10px', backgroundColor: '#ffff', borderRadius: 6 }}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        disabled
                        defaultValue={typesSearch.search}
                        value={typesSearch.search}
                        options={[
                            {
                                label: '==',
                                value: 0
                            },
                            {
                                label: '!=',
                                value: 1
                            }
                        ]} /> : <></>
                }
                {
                    typesSearch.isClicked && typesSearch.types.length > 0 ? <span>
                        {
                            typesSearch.types.length > 1 ? <span>{projectInfo?.issue_types_default[Number(typesSearch.types[0])]?.icon_name} +{typesSearch.types.length - 1}</span> : projectInfo?.issue_types_default[Number(typesSearch.types[0])]?.icon_name
                        }
                    </span> : <></>
                }
                <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
            </Button>
            <div className="dropdown-menu" aria-labelledby="dropdownTypeMenu" style={{ width: 'max-content', padding: '10px' }}>
                <Select
                    style={{ width: '100%' }}
                    options={[
                        {
                            label: 'Types = (equals)',
                            value: 0
                        },
                        {
                            label: 'Types != (not equals)',
                            value: 1
                        }
                    ]}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    value={typesSearch.search}
                    onSelect={(value) => {
                        setTypesSearch(prev => {
                            return { ...prev, search: value }
                        })
                    }} />
                <p style={{ fontSize: 13, marginBottom: 5 }}>STANDARD ISSUE TYPES</p>
                <Checkbox.Group className='mb-3' onChange={(checkedValues) => {
                    setTypesSearch(prev => {
                        const tempArrs = [...checkedValues]
                        if (typesSearch.types.includes('4')) {
                            tempArrs.push('4')
                            return { ...prev, isClicked: true, types: [...tempArrs] }
                        }
                        return { ...prev, isClicked: true, types: [...tempArrs] }
                    })
                }}>
                    <Row>
                        <Col className='mt-2' span="16">
                            <Checkbox value="0">{issueTypeOptions(projectInfo?.issue_types_default)[0]?.label}</Checkbox>
                        </Col>
                        <Col className='mt-2' span="16">
                            <Checkbox value="1">{issueTypeOptions(projectInfo?.issue_types_default)[1]?.label}</Checkbox>
                        </Col>
                        <Col className='mt-2' span="16">
                            <Checkbox value="2">{issueTypeOptions(projectInfo?.issue_types_default)[2]?.label}</Checkbox>
                        </Col>
                    </Row>
                </Checkbox.Group>
                <p style={{ fontSize: 13, marginBottom: 5 }}>SUB-TASK ISSUE TYPE</p>
                <Checkbox onChange={e => {
                    if (e.target.checked === true) {
                        setTypesSearch(prev => {
                            return { ...prev, isClicked: true, types: [...prev.types, ...e.target.value] }
                        })
                    } else {
                        setTypesSearch(prev => {
                            const tempArrs = [...prev.types]
                            const index = tempArrs.findIndex(number => number == '4')
                            if (index !== -1) {
                                tempArrs.splice(index, 1)
                                return { ...prev, isClicked: true, types: [...tempArrs] }
                            } else {
                                return { ...prev }
                            }

                        })
                    }
                }} value="4">{issueTypeOptions(projectInfo?.issue_types_default)[4]?.label}</Checkbox>
            </div>
        </div>
    }

    const renderSearchStatuses = () => {
        return <div className='dropdown'>
            <Button
                className='mr-2 btn-options'
                type={statusesSearch.isClicked ? 'primary' : 'default'}
                id="btn-option2 dropdownStatusMenu"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                Status
                {
                    statusesSearch.isClicked ? <Select
                        style={{ height: 25, margin: '0 10px', backgroundColor: '#ffff', borderRadius: 6 }}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        disabled
                        defaultValue={statusesSearch.search}
                        value={statusesSearch.search}
                        options={[
                            {
                                label: '==',
                                value: 0
                            },
                            {
                                label: '!=',
                                value: 1
                            }
                        ]} /> : <></>
                }
                {
                    statusesSearch.isClicked && statusesSearch.statuses.length > 0 ? <span>
                        {
                            statusesSearch.statuses.length > 1 ? <span>{processList.find(status => status._id.toString() === statusesSearch.statuses[0])?.name_process} +{statusesSearch.statuses.length - 1}</span> : processList.find(status => status._id.toString() === statusesSearch.statuses[0])?.name_process
                        }
                    </span> : <></>
                }
                <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
            </Button>
            <div className="dropdown-menu" aria-labelledby="dropdownStatusMenu" style={{ padding: '5px 10px' }}>
                <Select
                    style={{ width: '100%' }}
                    options={[
                        {
                            label: 'Statuses = (equals)',
                            value: 0
                        },
                        {
                            label: 'Statuses != (not equals)',
                            value: 1
                        }
                    ]}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    onSelect={(value) => {
                        setStatusesSearch(prev => {
                            return { ...prev, search: value }
                        })
                    }}
                    defaultValue={statusesSearch.search}
                    value={statusesSearch.search}
                />
                <Checkbox.Group style={{ width: '100%', margin: '10px' }} onChange={(checkedValues) => {
                    setStatusesSearch(prev => {
                        const tempArrs = [...checkedValues]
                        return { ...prev, isClicked: true, statuses: [...tempArrs] }
                    })
                }}>
                    <Row className='mb-1'>
                        {processList.map((process) => {
                            return <Col className='mt-2' span="16">
                                <Checkbox value={process._id}><Tag color={process.tag_color}>{process.name_process}</Tag></Checkbox>
                            </Col>
                        })}
                    </Row>
                </Checkbox.Group>
            </div>
        </div>
    }

    const renderSearchAssignees = () => {
        return <div className='dropdown'>
            <Button
                className='mr-2 btn-options'
                id="btn-option3 dropdownAssigneeMenu"
                data-toggle="dropdown"
                type={assigneesSearch.isClicked ? 'primary' : 'default'}
                aria-haspopup="true"
                aria-expanded="false">
                Assignee
                {
                    assigneesSearch.isClicked ? <Select
                        style={{ height: 25, margin: '0 10px', backgroundColor: '#ffff', borderRadius: 6 }}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        disabled
                        defaultValue={assigneesSearch.search}
                        value={assigneesSearch.search}
                        options={[
                            {
                                label: '==',
                                value: 0
                            },
                            {
                                label: '!=',
                                value: 1
                            }
                        ]} /> : <></>
                }
                {
                    assigneesSearch.isClicked && assigneesSearch.assignees.length > 0 ? <span>
                        {
                            assigneesSearch.assignees.length > 1 ? <span>{projectInfo?.members.find(member => member.user_info._id.toString() === assigneesSearch.assignees[0])?.user_info?.username} +{assigneesSearch.assignees.length - 1}</span> : projectInfo?.members.find(member => member.user_info._id.toString() === assigneesSearch.assignees[0])?.user_info?.username
                        }
                    </span> : <></>
                }
                <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
            </Button>
            <div className="dropdown-menu" aria-labelledby="dropdownAssigneeMenu" style={{ padding: '5px 10px' }}>
                <Select
                    style={{ width: '100%' }}
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    defaultValue={assigneesSearch.search}
                    value={assigneesSearch.search}
                    onSelect={(value) => {
                        setAssigneesSearch(prev => {
                            return { ...prev, search: value }
                        })
                    }}
                    options={[
                        {
                            label: 'Assignees = (equals)',
                            value: 0
                        },
                        {
                            label: 'Assignees != (not equals)',
                            value: 1
                        }
                    ]} />
                <Checkbox.Group style={{ width: '100%', margin: '10px' }} onChange={(checkedValues) => {
                    setAssigneesSearch(prev => {
                        const tempArrs = [...checkedValues]
                        return { ...prev, isClicked: true, assignees: [...tempArrs] }
                    })
                }}>
                    <Row className='mb-1'>
                        {projectInfo?.members?.map((user) => {
                            return <Col span="16 mb-1">
                                <Checkbox value={user.user_info._id}>
                                    <div className='d-flex align-items-center'>
                                        <Avatar className='mr-1' size="small" src={user.user_info.avatar} />
                                        <span>{user.user_info.username}</span>
                                    </div>
                                </Checkbox>
                            </Col>
                        })}
                        <Col span="16">
                            <Checkbox value={'null'}>
                                <div className='d-flex align-items-center'>
                                    <Avatar className='mr-1' icon={<UserOutlined style={{ fontSize: 13 }} />} style={{ width: 22, height: 22 }} />
                                    <span>Unassignee</span>
                                </div>
                            </Checkbox>
                        </Col>
                    </Row>
                </Checkbox.Group>
            </div>
        </div>
    }

    const renderOptionsArray = (arrs, default_value_arrs, field) => {
        return <Checkbox.Group value={default_value_arrs} defaultValue={default_value_arrs} style={{ width: '100%', margin: '10px' }} onChange={(checkedValues) => {
            setMoreFieldsSearch(prev => {
                const tempArrs = [...moreFieldsSearch]
                const index = moreFieldsSearch.findIndex(currentField => currentField.search_id === field.search_id)
                tempArrs[index].isClicked = true
                if (tempArrs[index].values.length === 0) {
                    tempArrs[index].values = [...checkedValues]
                } else {
                    tempArrs[index].values = tempArrs[index].values.concat([...checkedValues])
                }
                return [...tempArrs]
            })
        }}>
            <Row className='mb-1'>
                {arrs.map((value, index) => {
                    return <Col className='mt-2' span="16">
                        <Checkbox value={index}>{value}</Checkbox>
                    </Col>
                })}
            </Row>
        </Checkbox.Group>
    }

    const renderOptionsCheckbox = (arrs, type_name, default_value_arrs, field) => {
        return <Checkbox.Group defaultValue={default_value_arrs} value={default_value_arrs} style={{ width: '100%', margin: '10px' }} onChange={(checkedValues) => {
            setMoreFieldsSearch(prev => {
                const tempArrs = [...moreFieldsSearch]
                const index = moreFieldsSearch.findIndex(currentField => currentField.search_id === field.search_id)
                tempArrs[index].isClicked = true
                tempArrs[index].values = [...checkedValues]

                return [...tempArrs]
            })
        }}>
            <Row className='mb-1'>
                {arrs.map((type) => {
                    var template = <></>
                    if (type_name === 'current_sprint') {
                        template = <Checkbox value={type._id}><Tag color={type.tag_color}>{type.sprint_name}</Tag></Checkbox>
                    }
                    if (type_name === 'fix_version') {
                        template = <Checkbox value={type._id}><Tag color={type.tag_color}>{type.version_name}</Tag></Checkbox>
                    }
                    if (type_name === 'epic_link') {
                        template = <Checkbox value={type._id}><Tag color={type.tag_color}>{type.epic_name}</Tag></Checkbox>
                    }
                    if (type_name === 'component') {
                        template = <Checkbox value={type._id}><Tag>{type.component_name}</Tag></Checkbox>
                    }
                    return <Col className='mt-2' span="16">
                        {template}
                    </Col>
                })}
            </Row>
        </Checkbox.Group>
    }

    const renderAllSearchMoreFields = () => {
        const data = moreFieldsSearch.map(field => {
            const tempArrs = projectInfo?.issue_fields_config?.filter(currentField => !['issue_type', 'assignees', 'issue_status'].includes(currentField?.field_key_issue))
            var hideButtonEquals = true
            const index = tempArrs?.findIndex(currentField => currentField?.field_key_issue === field?.search_id)
            if (index !== -1 && tempArrs) {
                const getField = tempArrs[index]
                var promptValues = null
                var arrs = null, type_name = null, template = null
                if (getField?.field_key_issue === 'current_sprint') {
                    arrs = [...sprintList]
                    type_name = 'current_sprint'
                    template = renderOptionsCheckbox(arrs, type_name, field.values, field)
                    promptValues = field.values.length > 1 ? <span>{sprintList.find(sprint => sprint._id.toString() === field.values[0])?.sprint_name} +{field.values.length - 1}</span> : sprintList.find(sprint => sprint._id.toString() === field.values[0])?.sprint_name
                }

                if (getField?.field_key_issue === 'epic_link') {
                    arrs = [...epicList]
                    type_name = 'epic_link'
                    template = renderOptionsCheckbox(arrs, type_name, field.values, field)
                    promptValues = field.values.length > 1 ? <span>{epicList.find(epic => epic._id.toString() === field.values[0])?.epic_name} +{field.values.length - 1}</span> : epicList.find(epic => epic._id.toString() === field.values[0])?.epic_name
                }

                if (getField?.field_key_issue === 'component') {
                    arrs = [...componentList]
                    type_name = 'component'
                    template = renderOptionsCheckbox(arrs, type_name, field.values, field)
                    promptValues = field.values.length > 1 ? <span>{componentList.find(component => component._id.toString() === field.values[0])?.component_name} +{field.values.length - 1}</span> : componentList.find(component => component._id.toString() === field.values[0])?.component_name
                }

                if (getField?.field_key_issue === 'fix_version') {
                    arrs = [...versionList]
                    type_name = 'fix_version'
                    template = renderOptionsCheckbox(arrs, type_name, field.values, field)
                    promptValues = field.values.length > 1 ? <span>{versionList.find(version => version._id.toString() === field.values[0])?.version_name} +{field.values.length - 1}</span> : versionList.find(version => version._id.toString() === field.values[0])?.version_name
                }

                if (getField?.field_type_in_issue === 'number') {
                    hideButtonEquals = false
                    template = <div>
                        <InputNumber onChange={(e) => {

                        }} placeholder='Enter a number'></InputNumber>
                        <hr />
                        <Button onClick={(e) => {
                            e.stopPropagation()
                        }}>Update</Button>
                    </div>
                }

                if (getField?.field_type_in_issue === 'string') {
                    hideButtonEquals = false
                    template = <div>
                        <TextArea rows={4} placeholder={`Enter a ${getField.field_name?.toLowerCase()}`} />
                        <hr />
                        <Button onClick={(e) => {
                            e.stopPropagation()
                        }}>Update</Button>
                    </div>
                }

                if (getField?.field_type_in_issue === 'string' && Array.isArray(getField?.default_value)) {
                    hideButtonEquals = true
                    template = renderOptionsArray(getField?.default_value, field.values, field)
                    promptValues = field.values.length > 1 ? <span>{getField?.default_value[0]} +{field.values.length - 1}</span> : getField?.default_value[0]
                }

                return <div className='dropdown'>
                    <Button
                        className='mr-2 btn-options'
                        type={field.isClicked ? 'primary' : 'default'}
                        id="btn-option2 dropdownStatusMenu"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false">
                        {getField?.field_name}
                        {
                            field.isClicked && hideButtonEquals ? <Select
                                style={{ height: 25, margin: '0 10px', backgroundColor: '#ffff', borderRadius: 6 }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                }}
                                disabled
                                defaultValue={field.isSearch}
                                value={field.isSearch}
                                options={[
                                    {
                                        label: '==',
                                        value: 0
                                    },
                                    {
                                        label: '!=',
                                        value: 1
                                    }
                                ]} /> : <></>
                        }
                        {
                            field.isClicked && field.values.length > 0 ? <span>
                                {promptValues}
                            </span> : <></>
                        }
                    </Button>
                    <div className="dropdown-menu" aria-labelledby="dropdownStatusMenu" style={{ padding: '5px 10px' }}>
                        {hideButtonEquals ? <Select
                            style={{ width: '100%' }}
                            options={[
                                {
                                    label: `${getField?.field_name} = (equals)`,
                                    value: 0
                                },
                                {
                                    label: `${getField?.field_name} != (not equals)`,
                                    value: 1
                                }
                            ]}
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            onSelect={(value) => {
                                setMoreFieldsSearch(prev => {
                                    const index = moreFieldsSearch.findIndex(currentField => currentField.search_id === field.search_id)
                                    const temp = [...moreFieldsSearch]
                                    temp[index].isSearch = value
                                    return [...temp]
                                })
                            }}
                            defaultValue={field.isSearch}
                            value={field.isSearch}
                        /> : <></>}
                        {template}
                    </div>
                </div>
            }
            return <></>
        })
        return <div className='d-flex'>
            {data}
        </div>
    }

    return (
        <div style={{ overflow: 'none', height: '100vh', position: 'fixed', width: '94%' }}>
            <div className='issue-info-header'>
                <Breadcrumb
                    style={{ marginBottom: 10 }}
                    items={[
                        {
                            title: <a href="/manager">Projects</a>,
                        },
                        {
                            title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                        }
                    ]}
                />
                <div className='d-flex justify-content-between align-items-center'>
                    <h4>Issues</h4>
                    <div className='mr-3 d-flex align-items-center'>
                        <Button onClick={() => {
                            ExportCSV(renderColumn(), renderDatasource(), `${projectInfo?.name_project}_${generateRandomNumberString(10)}.csv`)
                        }} className='mr-2' tyle={{ fontSize: 13 }}><i className="fa-solid fa-file-csv mr-2"></i> Export csv</Button>
                        <nav>
                            <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                <a
                                    className={`nav-item nav-link ${typeViews.get('typeview') === 'detailview' ? 'active' : ''}`}
                                    id="nav-detail_view-tab"
                                    data-toggle="tab"
                                    onClick={() => {
                                        dispatch(getIssuesInProject(id, null))
                                        navigate(`/projectDetail/${id}/issues/issue-detail`)
                                    }}
                                    href="#nav-detail_view"
                                    role="tab"
                                    aria-controls="nav-detail_view"
                                    aria-selected="true">
                                    Detail View <i className="fa-regular fa-rectangle-list ml-2"></i>
                                </a>
                                <a
                                    className={`nav-item nav-link ${typeViews.get('typeview') === 'listview' ? 'active' : ''}`}
                                    id="nav-list_view-tab"
                                    data-toggle="tab"
                                    onClick={() => {
                                        dispatch(getIssuesInProject(id, null))
                                        navigate(`/projectDetail/${id}/issues/issue-detail?typeview=listview`)
                                    }}
                                    href="#nav-list_view"
                                    role="tab"
                                    aria-controls="nav-list_view"
                                    aria-selected="false">
                                    List View <i className="fa-solid fa-list ml-2"></i>
                                </a>
                            </div>
                        </nav>
                    </div>
                </div>
                <div className='d-flex align-items-center'>
                    <Search
                        className='issue-search'
                        placeholder="Search issues"
                        style={{
                            width: 200
                        }}
                    />
                    <div className='issue-options d-flex'>
                        {renderSearchTypes()}

                        {renderSearchStatuses()}

                        {renderSearchAssignees()}

                        {renderAllSearchMoreFields()}

                        <div className='dropdown'>
                            <Button
                                type={moreFieldsSearch?.length > 0 ? 'primary' : 'default'}
                                className='mr-2 btn-options'
                                id="btn-option4 dropdownMoreMenu"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                More {moreFieldsSearch?.length > 0 ? <span>({moreFieldsSearch?.length})</span> : <></>} <i className="fa fa-angle-down ml-2" style={{ fontSize: 13, fontWeight: 'bold' }}></i>
                            </Button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMoreMenu" style={{ padding: '5px 20px' }}>
                                <div style={{ width: 'min-content' }}>
                                    <Checkbox.Group className='mb-3' value={moreFieldsSearch.map(field => field.search_id)} onChange={(checkedValues) => {
                                        const fieldsSearchingUpdated = checkedValues.map(id => {
                                            const index = moreFieldsSearch.findIndex(field => field.search_id === id)
                                            if (index !== -1) {
                                                return moreFieldsSearch[index]
                                            }
                                            return {
                                                values: [],
                                                isSearch: 0,
                                                isClicked: false,
                                                search_id: id
                                            }
                                        })
                                        setMoreFieldsSearch([...fieldsSearchingUpdated])
                                    }}>
                                        <Row>
                                            {projectInfo?.issue_fields_config
                                                ?.filter(currentField => !['issue_type', 'assignees', 'issue_status'].includes(currentField?.field_key_issue))
                                                ?.map(field => {
                                                    return <Col span="16" className='mt-1'>
                                                        <Checkbox value={field.field_key_issue}>{field.field_name}</Checkbox>
                                                    </Col>
                                                })}
                                        </Row>
                                    </Checkbox.Group>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button onClick={() => {
                            setAssigneesSearch(prev => ({
                                assignees: [],
                                search: 0,
                                isClicked: false
                            }))

                            setStatusesSearch(prev => ({
                                statuses: [],
                                search: 0,
                                isClicked: false
                            }))

                            setTypesSearch(prev => ({
                                types: [],
                                search: 0,
                                isClicked: false
                            }))

                            setMoreFieldsSearch(prev => [])
                        }} className='mr-2 btn-options'>Clear option filter</Button>
                    </div>
                </div>
            </div>
            <div className="issue-info-body" style={{ width: '100%', height: '90vh', overflowY: 'auto', marginTop: 15, overflowX: 'hidden' }}>
                <div className="tab-content" style={{ marginLeft: 20, height: '100%' }} id="nav-tabContent">
                    <div className={`tab-pane h-100 fade show ${(typeViews.get('typeview') === 'detailview' || typeViews.get('typeview') === null) ? 'active' : ''}`} id="nav-detail_view" role="tabpanel" aria-labelledby="nav-detail_view-tab">
                        {renderViewDetail()}
                    </div>
                    <div className={`tab-pane h-100 fade show ${typeViews.get('typeview') === 'listview' ? 'active' : ''}`} id="nav-list_view" role="tabpanel" aria-labelledby="nav-list_view-tab">
                        {renderListView()}
                    </div>
                </div>
            </div>
        </div>
    )
}
