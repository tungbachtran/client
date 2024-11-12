import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, Table, Upload, message, Form } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function CourseClassDocuments({ setLoading }) {
    const { courseClassId } = useParams()
    const [documents, setDocuments] = useState([])
    const [isAddModalVisible, setIsAddModalVisible] = useState(false)
    const [addFile, setAddFile] = useState(null)
    const [addFileList, setAddFileList] = useState([])
    const [form] = Form.useForm()
    const [titleId, setTitleId] = useState('')
    const [title, setTitle] = useState('')

    useEffect(() => {
        fetchDocuments()
    }, [])

    useEffect(() => {
        fetchTitleId()
    }, [])

    useEffect(() => {
        if (titleId) {
            fetchTitle()
        }
    }, [titleId])

    const fetchTitleId = async () => {
        setLoading(true)
        try {
            const response = await axios.get(
                `http://localhost:5148/api/course-classroom/${courseClassId}`
            )
            setTitleId(response.data.courseClassroom.courseId)
        } catch (error) {
            console.error('Lỗi khi tải tài liệu:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchTitle = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`http://localhost:5148/api/course/${titleId}`)
            setTitle(response.data.name)
        } catch (error) {
            console.error('Lỗi khi tải tài liệu:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchDocuments = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`http://localhost:5148/api/documents/${courseClassId}`)
            setDocuments(response.data || [])
        } catch (error) {
            console.error('Lỗi khi tải tài liệu:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        const values = await form.validateFields()
        if (!addFile) {
            message.error('Vui lòng tải tài liệu lên.')
            return
        }

        const formData = new FormData()
        formData.append('courseClassId', courseClassId)
        formData.append('Content', values.name)
        formData.append('file', addFile)

        try {
            await axios.post(
                `http://localhost:5148/api/documents/${courseClassId}?Content=${values.name}`,
                formData
            )
            message.success('Đã thêm tài liệu thành công.')
            await fetchDocuments()
            handleAddModalClose()
        } catch (error) {
            console.error('Lỗi:', error.response || error.message)
            message.error('Không thể thêm tài liệu.')
        }
    }

    const handleDelete = async (documentId) => {
        try {
            await axios.delete(`http://localhost:5148/api/documents/${documentId}`)
            message.success('Đã xóa tài liệu.')

            // Cập nhật danh sách tài liệu ngay lập tức mà không cần gọi fetchDocuments
            setDocuments((prevDocuments) =>
                prevDocuments.filter((doc) => doc.documentId !== documentId)
            )
        } catch (error) {
            message.error('Không thể xóa tài liệu.')
        }
    }

    const handleAddModalClose = () => {
        setIsAddModalVisible(false)
        setAddFile(null)
        setAddFileList([])
        form.resetFields()
    }

    const handleAddFileChange = (info) => {
        const file = info.file.originFileObj || info.file
        if (file) {
            setAddFile(file)
            setAddFileList([info.file])
        } else {
            message.error('Không thể đọc thông tin của tệp. Vui lòng thử lại.')
        }
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'documentId',
            key: 'documentId'
        },
        {
            title: 'Tên tài liệu',
            dataIndex: 'content',
            key: 'content'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, document) => (
                <Button type="link" danger onClick={() => handleDelete(document.documentId)}>
                    Xóa
                </Button>
            )
        }
    ]

    return (
        <div id="class-management">
            <h3 className="title">Tài liệu lớp học phần {title}</h3>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}>
                Thêm mới
            </Button>
            <Table columns={columns} dataSource={documents} rowKey="documentId" />

            {/* Modal thêm mới */}
            <Modal
                title="Thêm tài liệu mới"
                visible={isAddModalVisible}
                onCancel={handleAddModalClose}
                onOk={handleAdd}>
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên tài liệu"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu!' }]}>
                        <Input placeholder="Nhập tên tài liệu" />
                    </Form.Item>
                    <Form.Item label="Tải tài liệu lên">
                        <Upload
                            beforeUpload={() => false}
                            onChange={handleAddFileChange}
                            maxCount={1}
                            fileList={addFileList}>
                            <Button icon={<UploadOutlined />}>Tải tài liệu lên</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
