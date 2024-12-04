import Check_Box from "../child-components/Issue-Setting/New-Tags-Created/Check_Box/Check_Box"
import Date from "../child-components/Issue-Setting/New-Tags-Created/Date/Date"
import DropDown from "../child-components/Issue-Setting/New-Tags-Created/DropDown/DropDown"
import Labels from "../child-components/Issue-Setting/New-Tags-Created/Labels/Labels"
import MultiUsers from "../child-components/Issue-Setting/New-Tags-Created/MultiUsers/MultiUsers"
import Number from "../child-components/Issue-Setting/New-Tags-Created/Number/Number"
import Paragraph from "../child-components/Issue-Setting/New-Tags-Created/Paragraph/Paragraph"
import ShortText from "../child-components/Issue-Setting/New-Tags-Created/ShortText/ShortText"
import SingleUser from "../child-components/Issue-Setting/New-Tags-Created/SingleUser/SingleUser"
import TimeStamp from "../child-components/Issue-Setting/New-Tags-Created/TimeStamp/TimeStamp"

export const renderInterfaceForCreatingNewTag = (index, is_edited, positionNewIssueTagAdded, setPositionNewIssueTagAdded, issue_config) => {   
    if (index === 0) {
        return <ShortText is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 1) {
        return <Paragraph is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 2) {
        return <Date is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 3) {
        return <Number is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 4) {
        return <TimeStamp is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 5) {
        return <Labels is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 6) {
        return <DropDown is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 7) {
        return <Check_Box is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 8) {
        return <SingleUser is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    } else if (index === 9) {
        return <MultiUsers is_edited={is_edited} positionNewIssueTagAdded={positionNewIssueTagAdded} setPositionNewIssueTagAdded={setPositionNewIssueTagAdded} issue_config={issue_config}/>
    }
}