import React, { useEffect, useState } from 'react'
import { Table, Tooltip, Select } from 'antd'
import axios from 'axios'
import ManageSingleUserModal from './SingleModal'
import { Switch, useRouteMatch, Route, useHistory } from 'react-router-dom'

export default function UserList({ setLoading }) {
    document.title = 'Danh sách tài khoản'
    let { path } = useRouteMatch()
    let navigate = useHistory()

    // const imgLink = 'https://aui.atlassian.com/aui/8.8/docs/images/avatar-person.svg'
    const [data, setData] = useState([])
    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'avatar',
            key: 'avatar',
            width: '80px'
        },
        {
            title: 'MSSV',
            dataIndex: 'userId',
            key: 'userId',
            width: '18%',
            ellipsis: {
                showTitle: false
            },
            render: (userId) => (
                <Tooltip placement="topLeft" title={userId}>
                    {userId}
                </Tooltip>
            )
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
            ellipsis: {
                showTitle: false
            },
            width: '30%',
            render: (name) => (
                <Tooltip placement="topLeft" title={name}>
                    {name}
                </Tooltip>
            )
        },
        {
            title: 'Lớp',
            dataIndex: '_class',
            key: '_class',
            ellipsis: {
                showTitle: false
            },
            render: (_class) => (
                <Tooltip placement="topLeft" title={_class}>
                    {_class}
                </Tooltip>
            )
        }
    ]

    const [faculties, setFaculties] = useState([])
    const [classes, setClasses] = useState([])

    useEffect(() => {
        setLoading(true)
        axios
            .get('http://localhost:5148/api/faculty/')
            .then((res) => {
                setFaculties(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setLoading(false)
                console.error('Error on fetching faculties:', err)
                alert('Kết nối tới server thất bại')
            })
    }, [])

    const handleSelectFaculty = (data) => {
        data = JSON.parse(data)
        if (data.facultyId === 0) {
            let temp = []
            axios
                .get(`http://localhost:5148/api/classroom`)
                .then((res) => {
                    temp = res.data
                    temp = temp.map((_class) => {
                        return {
                            faculty: faculties.filter(
                                (_faculty) =>
                                    _class.classroomId.substring(0, 3) === _faculty.facultyId
                            )[0].name,
                            key: _class.classroomId,
                            id: _class.classroomId,
                            name: _class.name
                        }
                    })
                    setClasses(temp)
                })
                .catch((err) => {
                    setLoading(false)
                    console.error('Error on fetching classes: ', err)
                })
            return
        }

        let temp = [
            {
                key: 0,
                faculty: data.facultyId,
                id: 0,
                name: 'Tất cả'
            }
        ]
        axios
            .get(`http://localhost:5148/api/faculty/classes/${data.facultyId}`)
            .then((res) => {
                temp = temp.concat(
                    res.data.map((_class) => {
                        return {
                            key: _class.classroomId,
                            faculty: data.name,
                            id: _class.classroomId,
                            name: _class.name
                        }
                    })
                )
                setClasses(temp)
            })
            .catch((err) => {
                setLoading(false)
                console.error('Error on fetching classes: ', err)
            })
        return
    }

    const handleSelectClass = (data) => {
        setLoading(true)
        data = JSON.parse(data)

        //handle select multiple class in faculty
        if (data.id === 0) {
            axios
                .get(`http://localhost:5148/api/user/faculty/${data.faculty}`)
                .then((res) => {
                    let tempData = []
                    res.data.forEach((singleClass) => {
                        singleClass.students.forEach((user) => {
                            tempData.push({
                                key: user.userId,
                                avatar: (
                                    <img
                                        src={`data:image/jpeg;base64,${user.profileImage}`}
                                        alt="User Profile"
                                    />
                                ),
                                name: user.name,
                                userId: user.userId,
                                _class: singleClass.name
                            })
                        })
                    })
                    setData(tempData)
                    setLoading(false)
                })
                .catch((err) => {
                    setLoading(false)
                    console.error('Error on fetching students:', err)
                })
            return
        }

        // handle select single class
        axios
            .get(`http://localhost:5148/api/user/class/${data.id}`)
            .then((res) => {
                let tempData = []
                let currentClassName = data.name
                res.data.forEach((user) => {
                    tempData.push({
                        key: user.userId,
                        avatar: (
                            <img
                                src={`data:image/jpeg;base64,${user.profileImage}`}
                                alt="User Profile"
                            />
                        ),
                        name: user.name,
                        userId: user.userId,
                        _class: currentClassName
                    })
                })
                setData(tempData)
                setLoading(false)
            })
            .catch((err) => {
                setLoading(false)
                console.error('Error on fetching students:', err)
            })
    }

    const handleDeleteUser = (id) => {
        axios
            .delete(`http://localhost:5148/api/user/${id}`)
            .then(() => {
                setData(data.filter((user) => user.key !== id))
            })
            .catch((err) => {
                console.log(JSON.stringify(err))
            })
    }

    return (
        <div id="user-list">
            <div className="select-field mb-3">
                {/* Faculty */}
                <Select
                    className="select-faculty"
                    showSearch
                    placeholder="Chọn khoa"
                    optionFilterProp="children"
                    onChange={handleSelectFaculty}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }>
                    {faculties.map((item) => (
                        <Select.Option key={item.facultyId} value={JSON.stringify(item)}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>
                {/* Class */}
                <Select
                    className="select-class"
                    showSearch
                    placeholder="Chọn một lớp"
                    optionFilterProp="children"
                    onChange={handleSelectClass}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }>
                    {classes.map((item) => (
                        <Select.Option key={item.id} value={JSON.stringify(item)}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            <Table
                className="students-table"
                dataSource={data}
                columns={columns}
                pagination={{
                    position: ['topRight'],
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
                onRow={(record) => {
                    return {
                        onClick: () => {
                            navigate.push(`${path}/user/${record.key}`)
                        }
                    }
                }}
            />

            <Switch>
                <Route path={`${path}/user/:id`}>
                    <ManageSingleUserModal handleDeleteUser={handleDeleteUser} />
                </Route>
            </Switch>
        </div>
    )
}
