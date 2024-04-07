import { notification } from 'antd';
export const showNotificationWithIcon = (type, message, description) => {
    if(type === "success") {
        notification.success({
            message: message,
            description: description,
            duration: 1
        });
    }else if(type === "error") {
        notification.error({
            message: message,
            description: description,
            duration: 1
        });
    }
};