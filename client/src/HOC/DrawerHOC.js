import React, { useState } from 'react';
import { Drawer, Button, Space, Popconfirm } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { drawerAction, drawer_edit_form_action } from '../redux/actions/DrawerAction';
import { deleteFileAction } from '../redux/actions/CategoryAction';
import { delay } from '../util/Delay';
export default function DrawerHOC() {
    const visible = useSelector(state => state.isOpenDrawer.visible)
    const component = useSelector(state => state.isOpenDrawer.component)
    const submit = useSelector(state => state.isOpenDrawer.submit)
    const textButton = useSelector(state => state.isOpenDrawer.textButton)
    const width = useSelector(state => state.isOpenDrawer.width)
    const padding = useSelector(state => state.isOpenDrawer.padding)
    const tempFileData = useSelector(state => state.isOpenDrawer.tempFileData)
    const [isOpenConfirm, setIsOpenConfirm] = useState(false)
    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(async () => {
            if (tempFileData && Object.keys(tempFileData).length > 0 && tempFileData?.length > 0) {
                for (let index = 0; index < tempFileData?.length; index++) {
                    dispatch(deleteFileAction(tempFileData[index]))
                    await delay(200)
                }
            }
            dispatch(drawer_edit_form_action(<div />))
            dispatch(drawerAction(true))
            setConfirmLoading(false);
            setIsOpenConfirm(false)
        }, 1000);
    }
    const [confirmLoading, setConfirmLoading] = useState(false);
    const dispatch = useDispatch()
    const handleClose = async () => {
        setIsOpenConfirm(true)
    }
    const renderButton = () => {
        if (textButton?.toLowerCase().includes("submit")) {
            return <Button onClick={handleClose}>Cancel</Button>
        }
        return <></>
    }
    return (
        <Drawer
            width={width}
            onClose={handleClose}
            open={visible}
            styles={{
                body: {
                    paddingBottom: 80,
                    padding: padding
                },
            }}
            extra={
                <Space>
                    {renderButton()}
                    <Button onClick={submit} type="primary">
                        {textButton}
                    </Button>
                </Space>
            }
        >
            <Popconfirm
                title="Your changes won’t be saved"
                description="We won’t be able to save your data if you move away from this page."
                open={isOpenConfirm}
                onConfirm={handleOk}
                okButtonProps={{
                    loading: confirmLoading,
                }}
                onCancel={() => {
                    setIsOpenConfirm(false)
                }}
            >

            </Popconfirm>
            {component}
        </Drawer>


    );
}
