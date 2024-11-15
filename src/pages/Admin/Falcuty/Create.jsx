import React, { useState } from 'react'
import axios from 'axios'
import { Form, Input, Button } from 'antd'
import MsgModal from '../../../components/MsgModal'

export default function CreateFaculty() {
    document.title = 'Tạo khoa'

    const [modal, setModal] = useState({
        isShow: false,
        Fn: () => {},
        isDanger: false,
        msg: ''
    })

    const handleSubmit = async (e) => {
        const data = {
            name: e.name,
            facultyId: e.id
        }
        try {
            await axios.post('https://192.168.1.7:5001/api/faculty', data)
            setModal({
                isShow: true,
                Fn: () => setModal({ isShow: false }),
                isDanger: false,
                msg: 'Thêm thành công'
            })
        } catch (err) {
            console.error('Error on submit:', err)
            setModal({
                isShow: true,
                Fn: () => setModal({ isShow: false }),
                isDanger: true,
                msg: 'Thêm thất bại'
            })
        }
    }

    return (
        <div id="create-account">
            <MsgModal msg={modal.msg} Fn={modal.Fn} show={modal.isShow} danger={modal.isDanger} />
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 10 }}
                size="default"
                onFinish={handleSubmit}>
                <Form.Item
                    label="Mã khoa"
                    name="id"
                    rules={[{ required: true, message: 'Bạn chưa nhập mã khoa!' }]}>
                    <Input className="id" />
                </Form.Item>
                <Form.Item
                    label="Tên khoa"
                    name="name"
                    rules={[{ required: true, message: 'Bạn chưa nhập tên khoa!' }]}>
                    <Input className="name" />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 4 }}>
                    <Button type="primary" htmlType="submit">
                        Tạo
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}
