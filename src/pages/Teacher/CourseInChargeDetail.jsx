import React, { useEffect, useState } from 'react'
import { Button, Table, Tooltip, Switch as AntSwitch } from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { BsArrowLeft } from 'react-icons/bs'
import axios from 'axios'

export default function CourseInChargeDetail({ setLoading }) {
    const navigate = useHistory()
    const { courseClassId } = useParams()
    const [score, setScore] = useState([])
    const [editMode, setEditMode] = useState({}) // Trạng thái chỉnh sửa cho từng sinh viên

    const convertGPA10to4 = (score10) => {
        if (score10 === null) return null
        if (score10 < 4) return 0
        if (score10 < 5) return 1
        if (score10 < 5.5) return 1.5
        if (score10 < 6.5) return 2
        if (score10 < 7) return 2.5
        if (score10 < 8) return 3
        if (score10 < 8.5) return 3.5
        return 4.0
    }

    const columns = [
        {
            title: 'MSSV',
            align: 'center',
            dataIndex: 'studentId',
            key: 'studentId',
            width: '120px',
            render: (studentId) => (
                <Tooltip placement="topLeft" title={studentId}>
                    {studentId}
                </Tooltip>
            )
        },
        {
            title: 'Tên sinh viên',
            dataIndex: 'name',
            key: 'name',
            render: (name) => (
                <Tooltip placement="topLeft" title={name}>
                    {name}
                </Tooltip>
            )
        },
        {
            title: 'Công thức điểm',
            align: 'center',
            dataIndex: 'scoreFormula',
            key: 'scoreFormula',
            width: '200px'
        },
        {
            title: 'Điểm',
            children: [
                {
                    title: 'BT',
                    align: 'center',
                    dataIndex: 'scoreBT',
                    key: 'scoreBT',
                    width: '80px',
                    render: (text, record) =>
                        editMode[record.studentId] ? (
                            <input
                                id={`score-bt-${record.studentId}`}
                                className="ant-input"
                                defaultValue={text}
                            />
                        ) : (
                            text
                        )
                },
                {
                    title: 'GK',
                    align: 'center',
                    dataIndex: 'scoreGK',
                    key: 'scoreGK',
                    width: '80px',
                    render: (text, record) =>
                        editMode[record.studentId] ? (
                            <input
                                id={`score-gk-${record.studentId}`}
                                className="ant-input"
                                defaultValue={text}
                            />
                        ) : (
                            text
                        )
                },
                {
                    title: 'CK',
                    align: 'center',
                    dataIndex: 'scoreCK',
                    key: 'scoreCK',
                    width: '80px',
                    render: (text, record) =>
                        editMode[record.studentId] ? (
                            <input
                                id={`score-ck-${record.studentId}`}
                                className="ant-input"
                                defaultValue={text}
                            />
                        ) : (
                            text
                        )
                }
            ]
        },
        {
            title: 'Trung bình',
            children: [
                {
                    title: 'T10',
                    align: 'center',
                    dataIndex: 'average__10',
                    key: 'average__10',
                    width: '80px'
                },
                {
                    title: 'T4',
                    align: 'center',
                    dataIndex: 'average__4',
                    key: 'average__4',
                    width: '80px'
                }
            ]
        },
        {
            title: 'Chỉnh sửa',
            align: 'center',
            dataIndex: 'button',
            key: 'edit',
            width: '100px',
            render: (text, record) => (
                <AntSwitch
                    checked={editMode[record.studentId] || false}
                    onChange={() => handleToggleEdit(record.studentId, record)}
                />
            )
        }
    ]

    const fetchData = async () => {
        setLoading(true)
        try {
            let { data: scoreData } = await axios.get(
                `http://192.168.1.7:5148/api/score/class/${courseClassId}`
            )
            const formattedScore = scoreData.map((item) => {
                return {
                    studentId: item.userId,
                    name: item.student,
                    scoreFormula: `BT*${item.score.excerciseRate}+GK*${item.score.midTermRate}+CK*${item.score.finalTermRate}`,
                    scoreBT:
                        item.score.excerciseScore !== null
                            ? item.score.excerciseScore.toFixed(1)
                            : null,
                    scoreGK:
                        item.score.midTermScore !== null
                            ? item.score.midTermScore.toFixed(1)
                            : null,
                    scoreCK:
                        item.score.finalTermScore !== null
                            ? item.score.finalTermScore.toFixed(1)
                            : null,
                    average__10: item.totalScore,
                    average__4: convertGPA10to4(item.totalScore)
                }
            })
            setScore(formattedScore)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Hàm bật/tắt chế độ chỉnh sửa
    const handleToggleEdit = (studentId, record) => {
        if (editMode[studentId]) {
            // Nếu đang tắt chế độ chỉnh sửa, gọi hàm cập nhật
            updateScore(studentId)
        }
        setEditMode((prevEditMode) => ({
            ...prevEditMode,
            [studentId]: !prevEditMode[studentId] // Đảo trạng thái chỉnh sửa
        }))
    }

    // Hàm cập nhật dữ liệu khi tắt chỉnh sửa
    const updateScore = async (studentId) => {
        const scoreBT = document.getElementById(`score-bt-${studentId}`).value.replace(',', '.')
        const scoreGK = document.getElementById(`score-gk-${studentId}`).value.replace(',', '.')
        const scoreCK = document.getElementById(`score-ck-${studentId}`).value.replace(',', '.')

        if (isNaN(scoreBT) || isNaN(scoreGK) || isNaN(scoreCK)) {
            alert('Vui lòng nhập giá trị hợp lệ.')
            return
        }

        // Gửi dữ liệu cập nhật lên server
        try {
            setLoading(true)
            await axios.put(`http://192.168.1.7:5148/api/score/${studentId}/${courseClassId}`, {
                excerciseScore: parseFloat(scoreBT),
                midTermScore: parseFloat(scoreGK),
                finalTermScore: parseFloat(scoreCK),
                userId: studentId // Thêm mã sinh viên vào payload
            })
            fetchData() // Lấy lại dữ liệu sau khi cập nhật
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div id="course-in-charge-detail">
            <h3 className="title">HỌC PHẦN PHỤ TRÁCH</h3>
            <Button
                icon={<BsArrowLeft className="text-lg" />}
                onClick={() => navigate.push('/auth/course-in-charge')}
                className="flex justify-center items-center gap-2 mb-3">
                Quay lại
            </Button>
            <Table
                columns={columns}
                dataSource={score}
                rowKey="studentId"
                pagination={{ pageSize: 8 }}
                bordered
                scroll={{ x: true }}
            />
        </div>
    )
}
