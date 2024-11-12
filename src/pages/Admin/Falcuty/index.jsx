import React from 'react'
import { Route, Switch, useRouteMatch, Redirect } from 'react-router-dom'
import CreateFaculty from './Create'
import { Radio } from 'antd'
import { useHistory } from 'react-router-dom'
import FacultyList from './List'

export default function FacultyManagement({ setLoading }) {
    // Nhận setLoading từ props
    const { path } = useRouteMatch()
    const history = useHistory()

    const handleFnSelect = (e) => {
        history.push(`${path}/${e.target.value}`)
    }

    const defaultRdGrValue = document.location.pathname.includes('list') ? 'list' : 'create'

    return (
        <div id="class-management">
            <h3 className="title">Quản lý khoa</h3>
            <Radio.Group
                defaultValue={defaultRdGrValue}
                buttonStyle="solid"
                onChange={handleFnSelect}>
                <Radio.Button value="create">Tạo khoa</Radio.Button>
                <Radio.Button value="list">Danh sách các khoa</Radio.Button>
            </Radio.Group>
            <div className="fns pt-5">
                <Switch>
                    <Route path={`${path}/create`}>
                        <CreateFaculty setLoading={setLoading} />
                    </Route>
                    <Route path={`${path}/list`}>
                        <FacultyList setLoading={setLoading} />
                    </Route>
                    <Redirect to={`${path}/create`} />
                </Switch>
            </div>
        </div>
    )
}
