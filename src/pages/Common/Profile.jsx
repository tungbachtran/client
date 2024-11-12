import React, { useEffect, useState } from 'react'
import ChangePasswordModal from '../../components/ChangePasswordModal'
import { Switch, Route, Link } from 'react-router-dom'
import { Button, Form, Input, Switch as AntSwitch } from 'antd'
import axios from 'axios'
import MsgModal from '../../components/MsgModal'

export default function Profile({ user, handleLogout, setLoading }) {
    document.title = 'Thông tin cá nhân'

    const [modal] = useState({
        isShow: false,
        Fn: () => {},
        isDanger: false,
        msg: ''
    })

    const [info, setInfo] = useState({
        userInformation: {
            userId: '',
            name: '',
            dob: '1/1/1900',
            phoneNumber: '',
            email: '',
            gender: true,
            imageUrl: ''
        },
        classroomName: '',
        educationalProgram: {
            educationalProgramId: '',
            name: ''
        },
        faculty: {
            facultyId: '',
            name: ''
        }
    })

    const [isEditing, setIsEditing] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data } = await axios.get(`http://localhost:5148/api/user/${user.name}`)
            setInfo(data)
        } catch (err) {
            alert('Không thể kết nối đến server')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = async (values) => {
        const data = {
            name: info.userInformation.name,
            dob: values.dob,
            phoneNumber: values.phoneNumber,
            email: values.email,
            gender: info.userInformation.gender
        }
        setLoading(true)
        try {
            await axios.put(`http://localhost:5148/api/user/${user.name}`, data)
            fetchData()
            setIsEditing(false)
        } catch (err) {
            alert('Không thể kết nối đến server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div id="profile">
            <MsgModal msg={modal.msg} Fn={modal.Fn} show={modal.isShow} danger={modal.isDanger} />
            <Switch>
                <Route exact path="/auth/profile/change-password">
                    <ChangePasswordModal user={user} handleLogout={handleLogout} />
                </Route>
            </Switch>
            <h3 className="title">THÔNG TIN CÁ NHÂN</h3>
            <div className="profile-content">
                <div className="profile-content-left">
                    <div className="avatar">
                        {user.role === 'Student' && info.userInformation.profileImage && (
                            <img
                                src={`data:image/jpeg;base64,${info.userInformation.profileImage}`}
                                alt="User Profile"
                            />
                        )}
                        {user.role === 'Teacher' && info.userInformation.profileImage && (
                            <img
                                src={`data:image/jpeg;base64,${info.userInformation.profileImage}`}
                                alt="User Profile"
                            />
                        )}
                        {user.role === 'Admin' && (
                            <img
                                src="https://aui.atlassian.com/aui/8.8/docs/images/avatar-person.svg"
                                alt="#"
                            />
                        )}
                    </div>
                    <Link to="/auth/profile/change-password">
                        <Button size="large" type="default">
                            Đổi mật khẩu
                        </Button>
                    </Link>
                </div>
                <div className="profile-content-right flex flex-col items-end relative">
                    <div className="toggle-edit flex justify-center items-center">
                        Chỉnh sửa thông tin &nbsp;&nbsp;
                        <AntSwitch
                            checkedChildren="ON"
                            unCheckedChildren="OFF"
                            className="w-16"
                            onChange={(e) => setIsEditing(e)}
                            checked={isEditing}
                        />
                    </div>

                    <div className="personal-information w-full">
                        <ul>
                            <li>
                                <div>Họ Tên</div>
                                <div>{info.userInformation.name}</div>
                            </li>
                            <li>
                                <div>Giới tính</div>
                                <div>{info.userInformation.gender ? 'Nam' : 'Nữ'}</div>
                            </li>

                            {isEditing ? (
                                <Form
                                    onFinish={handleEdit}
                                    initialValues={{
                                        dob: info.userInformation.dob,
                                        email: info.userInformation.email,
                                        phoneNumber: info.userInformation.phoneNumber
                                    }}>
                                    <li>
                                        <div>Ngày sinh</div>
                                        <div>
                                            <Form.Item
                                                name="dob"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Bạn chưa nhập ngày sinh!'
                                                    }
                                                ]}>
                                                <Input size="small" className="w-96" />
                                            </Form.Item>
                                        </div>
                                    </li>
                                    <li>
                                        <div>Điện thoại</div>
                                        <div>
                                            <Form.Item
                                                name="phoneNumber"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: 'Bạn chưa nhập SĐT!'
                                                    }
                                                ]}>
                                                <Input size="small" className="w-96" />
                                            </Form.Item>
                                        </div>
                                    </li>
                                    <li>
                                        <div>Email</div>
                                        <div>
                                            <Form.Item
                                                name="email"
                                                rules={[
                                                    {
                                                        required: true,
                                                        type: 'email',
                                                        message: 'Bạn chưa nhập email!'
                                                    }
                                                ]}>
                                                <Input size="small" className="w-96" />
                                            </Form.Item>
                                        </div>
                                    </li>
                                    <li className="absolute -bottom-10">
                                        <div></div>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit">
                                                Lưu thông tin
                                            </Button>
                                        </Form.Item>
                                    </li>
                                </Form>
                            ) : (
                                <>
                                    <li>
                                        <div>Ngày sinh</div>
                                        <div>{info.userInformation.dob}</div>
                                    </li>
                                    <li>
                                        <div>Điện thoại</div>
                                        <div>{info.userInformation.phoneNumber}</div>
                                    </li>
                                    <li>
                                        <div>Email</div>
                                        <div>{info.userInformation.email}</div>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Only show school information if the user is not a Teacher */}
                    {user.role !== 'Teacher' && (
                        <>
                            <hr />
                            <div className="school-information w-full">
                                <ul>
                                    <li>
                                        <div>Khoa</div>
                                        <div>{info.faculty.name}</div>
                                    </li>
                                    <li>
                                        <div>Lớp</div>
                                        <div>{info.classroomName}</div>
                                    </li>
                                    <li>
                                        <div>Chương trình đào tạo</div>
                                        <div>{info.educationalProgram.name}</div>
                                    </li>
                                    <li>
                                        <div>MSSV</div>
                                        <div>{info.userInformation.userId}</div>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
