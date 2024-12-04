import React, {  useState } from 'react'
import { Button, Input, message, Modal, Table, Upload } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { deleteFileAction } from '../../../../redux/actions/CategoryAction';
import { csvFileToArray } from '../../../../util/CSV';
import domainName from '../../../../util/Config';
export default function ImportDataStep1(props) {
    const [fileInfo, setFileInfo] = useState({})
    const userInfo = useSelector(state => state.user.userInfo)
    const [getFileInfo, setGetFileInfo] = useState({})
    const setIsEnableClickNext = props.setIsEnableClickNext
    const [delimiter, setDelimiter] = useState(',')


    if (localStorage.getItem('file_info') && JSON.stringify(getFileInfo) !== localStorage.getItem('file_info')) {
        setIsEnableClickNext(prev => false)
        setGetFileInfo({ ...JSON.parse(localStorage.getItem('file_info')) })
    }

    const [openModal, setOpenModal] = useState(false)

    const [columns, setColumns] = useState([])
    const [dataSource, setDatasource] = useState([])
    const [openPreview, setOpenPreview] = useState(typeof localStorage.getItem('content') === 'string')

    const dispatch = useDispatch()


    const uploadFileProps = {
        name: 'file',
        action: `${domainName}/api/files/upload`,
        headers: {
            authorization: 'authorization-text',
        },
        data: {
            creator_id: userInfo.id
        },
        onChange(info) {
            setFileInfo(info.file)
            setGetFileInfo(info.file)
            if (info.file.status === 'done') {
                setIsEnableClickNext(false)
                localStorage.setItem('file_info', JSON.stringify(info.file))
                const reader = new FileReader();
                setGetFileInfo(info.file)
                reader.onload = e => {
                    //proceed to get info in file and save into local storage
                    localStorage.setItem('content', JSON.stringify(e.target.result))
                };

                setOpenPreview(prev => true)

                reader.readAsText(info.file.originFileObj);
                setFileInfo({})
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                setFileInfo({})
                message.error(`${info.file.name} file upload failed.`);
            }
        }
    };

    const renderFileUploading = (fileName) => {
        if (Object.keys(getFileInfo).length !== 0 || localStorage.getItem('file_info')) {
            return <div className="card file-card mt-1 d-flex flex-row align-items-center" style={{ marginRight: 5, width: 'max-content' }}>
                <div style={{ padding: 20, backgroundColor: '#dddd' }}>
                    <i style={{ fontSize: 30 }} className="fa fa-file-csv"></i>
                </div>
                <div className='d-flex flex-column ml-2 mr-2'>
                    <div>
                        <span className='font-weight-bold'>{getFileInfo.name}</span>
                    </div>
                    <div>
                        {Object.keys(fileInfo).length > 0 ? <div className="progress" style={{
                            bottom: 5,
                            paddig: '0 10px',
                            backgroundColor: '#ffff',
                            width: '90%'
                        }}>
                            <div style={{ backgroundColor: '#44546F', width: `${fileInfo?.percent}%` }} className="progress-bar" role="progressbar" aria-valuenow={fileInfo?.percent} aria-valuemin={0} aria-valuemax={100} />
                        </div> : <div>
                            <i className="fa fa-check-circle mr-1 text-success"></i> <span style={{ fontSize: 13 }}>Uploaded</span>
                        </div>}
                    </div>
                </div>
                <div style={{ display: typeof getFileInfo?.response?.data?._id === 'string' ? 'block' : 'none' }} className='ml-2 mr-3'>
                    <NavLink onClick={(e) => {
                        setIsEnableClickNext(prev => true)
                        dispatch(deleteFileAction(getFileInfo?.response?.data?._id))
                        localStorage.removeItem('file_info')
                        localStorage.removeItem('content')
                        localStorage.setItem('delimiter', JSON.stringify(','))
                        setGetFileInfo({})
                        setOpenPreview(prev => false)
                    }}>
                        <i style={{ fontSize: 25 }} className="fa fa-times"></i>
                    </NavLink>
                </div>
            </div>
        }
        return <></>
    }

    return (
        <div className='row p-4'>
            <div className='col-7'>
                <h4>Import data into Taskscheduler</h4>
                <h6>Upload a CSV file</h6>
                <p>Start by finding the Download or Export option on your app and export a CSV file. Structure the CSV to ensure the data is in the right format and upload it to begin.</p>
                <Upload
                    accept='.csv'
                    {...uploadFileProps}
                    showUploadList={false}>
                    <Button style={{ padding: '0 10px', display: Object.keys(getFileInfo).length !== 0 || localStorage.getItem('file_info') ? 'none' : 'block' }}>
                        <i className="fa fa-file-upload mr-2"></i> Upload csv file
                    </Button>
                </Upload>
                <div>
                    {renderFileUploading()}
                </div>

                <div className='mt-2 d-flex flex-column'>
                    <label>Delimiter</label>
                    <div>
                        <Input disabled={!openPreview} style={{ width: 100 }} value={delimiter} defaultValue="," onChange={(e) => {
                            localStorage.setItem('delimiter', JSON.stringify(e.target.value.trim()))
                            setDelimiter(e.target.value.trim())
                        }} />
                        <Button disabled={!openPreview} onClick={() => {
                            if (delimiter !== '') {
                                const convertFormat = csvFileToArray(JSON.parse(localStorage.getItem('content')), delimiter)
                                const tempHeaderColumns = Array.isArray(convertFormat) ? Object.keys(convertFormat[0]) : []

                                setOpenModal(prev => true)

                                setColumns(prev => {
                                    const colArr = [...tempHeaderColumns].map(field => {
                                        return {
                                            title: field,
                                            dataIndex: field,
                                            key: field,
                                            width: 'max-content'
                                        }
                                    })

                                    return [...colArr]
                                })

                                const tempDatasource = Array.isArray(convertFormat) ? convertFormat : []

                                setDatasource(prev => {
                                    return [...tempDatasource]
                                })
                            }
                        }} className='ml-2'>Preview</Button>
                    </div>
                </div>

                <Modal
                    width={'80%'}
                    open={openModal}
                    destroyOnClose={true}
                    onCancel={(e) => {
                        setOpenModal(false)
                    }}
                    onOk={(e) => {
                        setOpenModal(false)
                    }}
                >
                    <div>
                        <Table scroll={{ x: 300 }} columns={columns} dataSource={dataSource} />
                    </div>
                </Modal>
                <br />
            </div>
            <div className='col-4'>
                <img src="https://jira-frontend-bifrost.prod-east.frontend.public.atl-paas.net/assets/select-generic-csv.de6be5f2.svg" />
            </div>
        </div>
    )
}