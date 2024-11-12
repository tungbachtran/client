import React, { useEffect, useState, useRef } from 'react'
import { Table, Tooltip, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import axios from 'axios'
import MsgModal from '../../components/MsgModal'
import InputField from '../../components/InputField'
import { useHistory } from 'react-router-dom'

function Documents({ user, setLoading }) {
    document.title = 'Quản lí tài liệu lớp học phần'

    let navigate = useHistory()
    const [modal] = useState({
        isShow: false,
        Fn: () => {},
        isDanger: false,
        msg: ''
    })

    const columns = [
        {
            title: 'Mã Lớp HP',
            dataIndex: 'courseClassId',
            key: 'courseClassId',
            width: '160px',
            ellipsis: {
                showTitle: false
            },
            render: (courseClassId) => (
                <Tooltip placement="topLeft" title={courseClassId}>
                    {courseClassId}
                </Tooltip>
            )
        },
        {
            title: 'Tên HP',
            dataIndex: 'name',
            key: 'name',
            width: '260px',
            ellipsis: {
                showTitle: false
            },
            render: (name) => (
                <Tooltip placement="topLeft" title={name}>
                    {name}
                </Tooltip>
            )
        },

        {
            title: 'TC',
            dataIndex: 'credits',
            key: 'credits',
            ellipsis: {
                showTitle: false
            },
            width: '60px',
            render: (credits) => (
                <Tooltip placement="topLeft" title={credits}>
                    {credits}
                </Tooltip>
            )
        },

        {
            title: 'Tài liệu',
            dataIndex: 'courseClassId',
            key: 'detailButton',
            width: '145px',
            ellipsis: {
                showTitle: false
            },
            render: (courseClassId) => {
                return (
                    <Button
                        type="primary"
                        onClick={() => {
                            navigate.push(`/auth/course-class-documents/${courseClassId}`)
                        }}
                        icon={<SearchOutlined />}>
                        Chi tiết
                    </Button>
                )
            }
        }
    ]

    const [searchText, setSearchText] = useState('')
    const [courseClasses, setCourseClasses] = useState([])
    const inputSearchEl = useRef(null)

    const objectToString = (classObject) => {
        return Object.values(classObject).join(' ')
    }

    const scheduleRawToString = (rawData) => {
        const result = []
        const dates = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
        rawData.forEach((item) =>
            result.push(
                `${dates[parseInt(item.dateInWeek - 1)]},${item.startPeriod}-${item.endPeriod},${
                    item.room
                }`
            )
        )
        return result.join('; ')
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setSearchText(inputSearchEl.current.value)
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const { data: courseClasses } = await axios.get(
                    `https://192.168.1.7:5001/api/user/teacher/course-classroom/${user.name}`
                )
                console.log('classes: ', courseClasses)
                const data = []
                for (let index = 0; index < courseClasses.length; index++) {
                    let item = courseClasses[index]
                    if (item.courseClassroom.isComplete) continue
                    let { data: course } = await axios.get(
                        `https://192.168.1.7:5001/api/course/${item.courseClassroom.courseId}`
                    )
                    data.push({
                        courseClassId: item.courseClassroom.courseClassId,
                        name: course.name,
                        credits: course.credits,
                        // teacher: item.teacherName,
                        capacity: item.courseClassroom.capacity,
                        schedule: scheduleRawToString(item.schedule),
                        registeredCount: item.numberOfRegisteredStudent
                    })
                }
                setCourseClasses(data)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div id="course-class-list">
            <MsgModal msg={modal.msg} Fn={modal.Fn} show={modal.isShow} danger={modal.isDanger} />
            <h3 className="title">Quản lí tài liệu lớp học phần</h3>
            <form
                onSubmit={handleSearch}
                action=""
                className="mx-auto w-96 courses-search items-end flex mb-3">
                <InputField type="text" label="Tìm kiếm" ref={inputSearchEl} />
                <Button type="primary" size="medium" htmlType="submit" className="ml-5">
                    Search
                </Button>
            </form>

            <Table
                className="students-table"
                dataSource={courseClasses.filter(
                    (item) =>
                        objectToString(item).toLowerCase().indexOf(searchText.toLowerCase()) >= 0
                )}
                columns={columns}
                pagination={{
                    position: ['topRight'],
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
                rowKey="courseClassId"
            />

            {/* {JSON.stringify(courseClasses)} */}
        </div>
    )
}
export default Documents
