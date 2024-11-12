import React, { useEffect, useState } from 'react'
import { Table, Tooltip, Select, Button } from 'antd'
import axios from 'axios'

export default function ClassList({ setLoading }) {
    document.title = 'Danh sách lớp sinh hoạt'

    const columns = [
        {
            title: 'Mã lớp',
            dataIndex: 'id',
            key: 'id',
            width: '18%',
            ellipsis: {
                showTitle: false
            },
            render: (id) => (
                <Tooltip placement="topLeft" title={id}>
                    {id}
                </Tooltip>
            )
        },
        {
            title: 'Tên lớp',
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
            title: 'Khoa',
            dataIndex: 'faculty',
            key: 'faculty',
            ellipsis: {
                showTitle: false
            },
            render: (faculty) => (
                <Tooltip placement="topLeft" title={faculty}>
                    {faculty}
                </Tooltip>
            )
        },
        {
            title: 'Xóa',
            dataIndex: 'id',
            key: 'delete',
            width: '100px',
            ellipsis: {
                showTitle: false
            },
            render: (id) => (
                <Button type="primary" danger onClick={() => handleDelete(id)}>
                    Xóa
                </Button>
            )
        }
    ]

    const [faculties, setFaculties] = useState([])
    const [classes, setClasses] = useState([])
    const [selectedFaculty, setSelectedFaculty] = useState(null)

    // fetch a list of faculty
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get('https://192.168.1.7:5001/api/faculty/')
                setFaculties([{ facultyId: 0, name: 'Tất cả' }, ...data])
            } catch (err) {
                setLoading(false)
                console.error('Error on fetching faculties:', err)
                alert('Không thể kết nối đến server')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const fetchClasses = async (data) => {
        setLoading(true)
        if (data.facultyId === 0) {
            try {
                const { data: classesData } = await axios.get(`https://192.168.1.7:5001/api/classroom`)
                setClasses(
                    classesData.map((_class) => {
                        return {
                            faculty: faculties.filter((_faculty) => {
                                if (_class.classroomId.includes('GV')) {
                                    return _class.classroomId.substring(2, 5) === _faculty.facultyId
                                } else {
                                    return _class.classroomId.substring(0, 3) === _faculty.facultyId
                                }
                            })[0].name,
                            key: _class.classroomId,
                            id: _class.classroomId,
                            name: _class.name
                        }
                    })
                )
            } catch (err) {
                console.error('Error on fetching classes: ', err)
            } finally {
                setLoading(false)
            }
            return
        }

        try {
            const { data: classesData } = await axios.get(
                `https://192.168.1.7:5001/api/faculty/classes/${data.facultyId}`
            )
            setClasses(
                classesData.map((_class) => {
                    return {
                        faculty: data.name,
                        key: _class.classroomId,
                        id: _class.classroomId,
                        name: _class.name
                    }
                })
            )
        } catch (err) {
            console.error('Error on fetching classes: ', err)
        } finally {
            setLoading(false)
        }
        return
    }

    // on <Select /> value change => Class select option list change
    const handleSelectFaculty = (data) => {
        data = JSON.parse(data)
        setSelectedFaculty(data)
        fetchClasses(data)
    }

    const handleDelete = async (id) => {
        setLoading(true)
        try {
            await axios.delete(`https://192.168.1.7:5001/api/classroom/${id}`)
            fetchClasses(selectedFaculty)
            setClasses(classes.filter((_class) => _class.key != id)) //don't use !== here
        } catch (err) {
            console.log(err)
        }
        setLoading(false)
    }

    return (
        <div id="class-list">
            {/* Faculty */}
            <div className="select-field mb-3">
                <Select
                    className="select-faculty w-80"
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
            </div>

            <Table
                className="students-table"
                dataSource={classes}
                columns={columns}
                pagination={{
                    position: ['topRight'],
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
                // onRow={(record, rowIndex) => {
                //     return {
                //         onClick: (event) => {
                //             navigate.push(`${path}/class/${record.key}`);
                //         },
                //     };
                // }}
            />

            {/* <Switch>
                <Route path={`${path}/class/:id`}>
                    <ManageSingleClassModal/>
                </Route>
            </Switch> */}
        </div>
    )
}
