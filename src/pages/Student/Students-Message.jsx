import React, { useEffect, useState, useRef } from 'react'
import { Table, Tooltip, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import axios from 'axios'
import InputField from '../../components/InputField'
import { useHistory } from 'react-router-dom'
import MessageStudentListModal from './MessageStudentListModal'

function MessageStudent({ user, setLoading }) {
    document.title = 'Tin nhắn lớp học phần'

    const navigate = useHistory()
    const [searchText, setSearchText] = useState('') // Không cần selectedClass nữa
    const [courseClasses, setCourseClasses] = useState([])
    const [messages, setMessages] = useState([]) // Thêm state để chứa danh sách tin nhắn
    const inputSearchEl = useRef(null)
    const [selectedClassId, setSelectedClassId] = useState(null)

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
            title: 'Tin nhắn',
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
                        onClick={() => handleViewMessages(courseClassId)}
                        icon={<SearchOutlined />}>
                        Xem
                    </Button>
                )
            }
        }
    ]

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

    const handleViewMessages = async (courseClassId) => {
        try {
            setSelectedClassId(courseClassId)
            setLoading(true) // Bật trạng thái loading trước khi gọi API
            const { data: fetchedMessages } = await axios.get(
                `http://localhost:5148/api/messages/${courseClassId}`
            )
            setMessages(fetchedMessages) // Cập nhật danh sách tin nhắn khi nhấn "Xem"
            console.log(user.name)
        } catch (err) {
            console.error(err) // Xử lý lỗi nếu có
        } finally {
            setLoading(false) // Tắt loading sau khi gọi API xong
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const { data: courseClasses } = await axios.get(
                    `http://localhost:5148/api/course-classroom/user/${user.name}`
                )
                const data = []
                for (let item of courseClasses) {
                    if (item.courseClassroom.isComplete) continue
                    const { data: course } = await axios.get(
                        `http://localhost:5148/api/course/${item.courseClassroom.courseId}`
                    )
                    data.push({
                        courseClassId: item.courseClassroom.courseClassId,
                        name: course.name,
                        credits: course.credits,
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
    }, []) // Thêm dependency cho useEffect

    return (
        <div id="course-class-list">
            <h3 className="title">Tin nhắn lớp học phần</h3>
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

            {/* Hiển thị MessageListModal nếu có tin nhắn */}
            <MessageStudentListModal
                messages={messages}
                info={user.name}
                setMessages={setMessages}
                classId={selectedClassId}
                isVisible={messages.length > 0} // Nếu có tin nhắn, modal sẽ hiển thị
                onClose={() => setMessages([])} // Đóng modal khi nhấn "Đóng"
            />
        </div>
    )
}

export default MessageStudent
