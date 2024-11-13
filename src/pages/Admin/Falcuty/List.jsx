import React, { useEffect, useState } from 'react'
import { Table, Tooltip, Button, Modal } from 'antd'
import axios from 'axios'

export default function FacultysList({ setLoading }) {
    document.title = 'Danh sách khoa và lớp'

    const [faculties, setFaculties] = useState([])
    const [classes, setClasses] = useState([])
    const [selectedFaculty, setSelectedFaculty] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false)

    const facultyColumns = [
        {
            title: 'Mã khoa',
            dataIndex: 'facultyId',
            key: 'facultyId',
            width: '15%',
            render: (facultyId) => (
                <Tooltip placement="topLeft" title={facultyId}>
                    {facultyId}
                </Tooltip>
            )
        },
        {
            title: 'Tên khoa',
            dataIndex: 'name',
            key: 'name',
            width: '40%',
            render: (name) => (
                <Tooltip placement="topLeft" title={name}>
                    {name}
                </Tooltip>
            )
        },
        {
            title: 'Chi tiết',
            key: 'detail',
            render: (record) => (
                <Button type="primary" onClick={() => handleViewClasses(record)}>
                    Chi tiết
                </Button>
            )
        },
        {
            title: 'Xóa',
            key: 'delete',
            render: (record) => (
                <Button type="primary" danger onClick={() => handleDeleteFaculty(record.facultyId)}>
                    Xóa
                </Button>
            )
        }
    ]

    const classColumns = [
        {
            title: 'Mã lớp',
            dataIndex: 'id',
            key: 'id',
            width: '20%',
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
            width: '40%',
            render: (name) => (
                <Tooltip placement="topLeft" title={name}>
                    {name}
                </Tooltip>
            )
        }
    ]

    // Fetch list of faculties on load
    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get('https://10.10.36.197:5001/api/faculty/')
                setFaculties(data)
            } catch (err) {
                console.error('Error fetching faculties:', err)
                alert('Không thể kết nối đến server')
            } finally {
                setLoading(false)
            }
        }
        fetchFaculties()
    }, [])

    // Fetch classes for the selected faculty
    const handleViewClasses = async (faculty) => {
        try {
            setLoading(true)
            setSelectedFaculty(faculty)
            const { data: classesData } = await axios.get(
                `https://10.10.36.197:5001/api/classroom/by-faculty/${faculty.facultyId}`
            )
            setClasses(classesData)
            setIsModalVisible(true)
        } catch (err) {
            console.error('Error fetching classes for faculty:', err)
            alert('Không thể lấy danh sách lớp')
        } finally {
            setLoading(false)
        }
    }

    // Delete a faculty
    const handleDeleteFaculty = async (id) => {
        try {
            setLoading(true)
            await axios.delete(`https://10.10.36.197:5001/api/faculty/${id}`)
            setFaculties(faculties.filter((faculty) => faculty.facultyId !== id))
            alert('Xóa khoa thành công')
        } catch (err) {
            console.error('Error deleting faculty:', err)
            alert('Không thể xóa khoa')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div id="faculty-class-list">
            <Table
                dataSource={faculties}
                columns={facultyColumns}
                rowKey="facultyId"
                pagination={{
                    position: ['topRight'],
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
            />

            <Modal
                title={`Danh sách lớp của khoa ${selectedFaculty?.name}`}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}>
                <Table
                    dataSource={classes}
                    columns={classColumns}
                    rowKey="id"
                    pagination={{
                        position: ['topRight'],
                        defaultPageSize: 5,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20']
                    }}
                />
            </Modal>
        </div>
    )
}
