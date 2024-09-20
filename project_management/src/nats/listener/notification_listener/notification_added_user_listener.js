const projectModel = require("../../../models/projectModel")
const natsWrapper = require("../../../nats-wrapper")

const projectManagementUserAdded = () => {
    try {
        const options = natsWrapper.client.subscriptionOptions()
            .setManualAckMode(true)

        const subscription = natsWrapper.client.subscribe('projectmanagement-user:added', options)

        subscription.on('message', async (msg) => {
            if (typeof msg.getData() === 'string') {
                console.log(`Received event projectmanagement-user:added with sequence number: ${msg.getSequence()}`);
                const parseData = JSON.parse(msg.getData())
                console.log("parseData ", parseData);
                
                //tiến hành lưu vào auth db
                const projectInfo = await projectModel.findById(parseData.project_id)
                
                if (projectInfo) {
                    const getCurrentMemberIndex = projectInfo.members.findIndex(user => user.user_info.toString() === parseData.user_id.toString())
                    if (getCurrentMemberIndex !== -1) {
                        const userFieldInMembers = projectInfo.members[getCurrentMemberIndex]
                        
                        projectInfo.members.splice(getCurrentMemberIndex, 1)
                        projectInfo.members.push({ user_info: userFieldInMembers.user_info, user_role: userFieldInMembers.user_role, status: "approved" })
                        await projectModel.updateOne({ _id: parseData.project_id }, { $set: { members: projectInfo.members } })
                    }
                }
                msg.ack()
            }
        })
    } catch (error) {

    }
}

module.exports = projectManagementUserAdded