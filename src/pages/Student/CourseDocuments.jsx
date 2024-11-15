import React, { useEffect, useState, useRef } from 'react'
import { Table, Tooltip, Button, Modal } from 'antd'
import axios from 'axios'
import InputField from './../../components/InputField'

export default function CourseDocuments({ setLoading, user }) {
    document.title = 'Tài liệu học phần'

    const [searchText, setSearchText] = useState('')
    const [courseClasses, setCourseClasses] = useState([])
    const [documentModalVisible, setDocumentModalVisible] = useState(false)
    const [documents, setDocuments] = useState([])
    const [selectedCourseClassId, setSelectedCourseClassId] = useState(null)
    const inputSearchEl = useRef(null)

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
            title: 'Giảng viên',
            dataIndex: 'teacher',
            key: 'teacher',
            ellipsis: {
                showTitle: false
            },
            render: (teacher) => (
                <Tooltip placement="topLeft" title={teacher}>
                    {teacher}
                </Tooltip>
            )
        },
        {
            title: 'Thời khóa biểu',
            dataIndex: 'schedule',
            key: 'schedule',
            width: '260px',
            ellipsis: {
                showTitle: false
            },
            render: (schedule) => (
                <Tooltip placement="topLeft" title={schedule}>
                    {schedule}
                </Tooltip>
            )
        },
        {
            title: 'Tài liệu',
            key: 'documents',
            render: (text, record) => (
                <Button type="link" onClick={() => handleShowDocuments(record.courseClassId)}>
                    Chi tiết
                </Button>
            )
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

    const handleUnregister = async (courseClassId) => {
        try {
            await axios.delete(
                `https://192.168.1.7:5001/api/course-classroom/user/${user.name}/${courseClassId}`
            )
            setCourseClasses(courseClasses.filter((item) => item.courseClassId !== courseClassId))
        } catch (err) {
            console.log(err)
        }
    }
    console.log(handleUnregister)
    console.log(selectedCourseClassId)

    const handleShowDocuments = async (courseClassId) => {
        try {
            setLoading(true)
            const { data } = await axios.get(`https://192.168.1.7:5001/api/documents/${courseClassId}`)
            setDocuments(data)
            console.log(data)
            setSelectedCourseClassId(courseClassId)
            setDocumentModalVisible(true)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = (doc) => {
        try {
            // Decode the base64 string to binary data
            const base64Data = doc.details;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
    
            // Get the MIME type and determine the file extension
            const mimeType = doc.mimeType || 'application/octet-stream';
            
            // Default file extension based on MIME type
            let fileExtension = 'file';  // Default fallback
            if (mimeType === 'application/pdf') {
                fileExtension = 'pdf';
            } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                fileExtension = 'docx';
            } else if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                fileExtension = 'xlsx';
            } else if (mimeType === 'image/jpeg') {
                fileExtension = 'jpg';
            } else if (mimeType === 'image/png') {
                fileExtension = 'png';
            }
            // Add more cases as necessary for other MIME types.
    
            // Create a Blob with the binary data and MIME type
            const blob = new Blob([byteNumbers], { type: mimeType });
            const url = URL.createObjectURL(blob);
    
            // Create an anchor element to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = `${doc.documentId}.${fileExtension}`; // Use documentId and the determined extension for the filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
    
            // Clean up by revoking the URL
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };
    
    

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const { data: courseClasses } = await axios.get(
                    `https://192.168.1.7:5001/api/course-classroom/user/${user.name}`
                )
                const data = []
                courseClasses.forEach(async (item) => {
                    const { data: course } = await axios.get(
                        `https://192.168.1.7:5001/api/course/${item.courseClassroom.courseId}`
                    )
                    data.push({
                        courseClassId: item.courseClassroom.courseClassId,
                        name: course.name,
                        credits: course.credits,
                        capacity: item.courseClassroom.capacity,
                        teacher: item.teacherName,
                        schedule: scheduleRawToString(item.schedule),
                        registeredCount: item.numberOfRegisteredStudent,
                        studied: item.courseClassroom.isComplete || !course.isAvailable
                    })
                })
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
                        objectToString(item).toLowerCase().indexOf(searchText.toLowerCase()) >= 0 &&
                        !item.studied
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

            <Modal
                title="Tài liệu học phần"
                visible={documentModalVisible}
                onCancel={() => setDocumentModalVisible(false)}
                footer={null}>
                {documents.length > 0 ? (
                    documents.map((doc) => (
                        <div
                            key={doc.documentId}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '10px'
                            }}>
                            <span>{doc.content}</span>
                            <Button type="primary" onClick={() => handleDownload(doc)}>
                                Tải xuống
                            </Button>
                        </div>
                    ))
                ) : (
                    <p>Không có tài liệu nào để hiển thị.</p>
                )}
            </Modal>
        </div>
    )
}
