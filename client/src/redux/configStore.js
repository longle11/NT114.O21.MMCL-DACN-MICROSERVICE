import {applyMiddleware, combineReducers, legacy_createStore as createStore} from 'redux'
import {thunk} from 'redux-thunk'
import CategoryReducer from './reducers/CategoryReducer'
import ListProjectReducer from './reducers/ListProjectReducer'
import DrawerReducer from './reducers/DrawerReducer'
import EditCategoryReducer from './reducers/EditCategoryReducer'
import UserReducer from './reducers/UserReducer'
import IssueReducer from './reducers/IssueReducer'
import LoadingReducer from './reducers/LoadingReducer'
const rootReducer = combineReducers({
    //reducer khai báo ở đây
    categories: CategoryReducer,
    listProject: ListProjectReducer,
    isOpenDrawer: DrawerReducer,
    editCategory: EditCategoryReducer,
    user: UserReducer,
    issue: IssueReducer,
    loading: LoadingReducer
})

const store = createStore(rootReducer, applyMiddleware(thunk))
export default store