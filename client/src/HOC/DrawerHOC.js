import React from 'react';
import { Drawer, Button, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { drawerAction, drawer_edit_form_action } from '../redux/actions/DrawerAction';
export default function DrawerHOC() {
    const visible = useSelector(state => state.isOpenDrawer.visible)
    const component = useSelector(state => state.isOpenDrawer.component)
    const submit = useSelector(state => state.isOpenDrawer.submit)
    const textButton = useSelector(state => state.isOpenDrawer.textButton)
    const width = useSelector(state => state.isOpenDrawer.width)
    const padding = useSelector(state => state.isOpenDrawer.padding)
    
    const dispatch = useDispatch()
    const handleClose = () => {
        dispatch(drawer_edit_form_action(<div/>))
        dispatch(drawerAction(true))
    }
    const renderButton = () => {
        if(textButton?.toLowerCase().includes("submit")) {
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
                {component}
            </Drawer>
    );
}
