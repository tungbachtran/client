import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BsChevronDown } from 'react-icons/bs'
import axios from 'axios'

const Navbar = ({ user, handleLogout }) => {
    const [profileImage, setProfileImage] = useState('')
    const [, setLoading] = useState(false)
    const [error, setError] = useState(false) // Thêm state để theo dõi lỗi kết nối ban đầu

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data } = await axios.get(`http://localhost:5148/api/user/${user.name}`)
            setProfileImage(data.userInformation.profileImage)
            setError(false) // Đặt lại lỗi khi kết nối thành công
        } catch (err) {
            if (!profileImage) {
                // Chỉ hiện thông báo lỗi nếu ảnh chưa được tải
                setError(true)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user.role === 'Student' || user.role === 'Teacher') {
            fetchData()
        }
    }, [user.role])

    return (
        <nav id="navbar">
            <div className="navbar-left"></div>
            <div className="navbar-right">
                <div className="navbar-profile">
                    <div className="avatar">
                        {(user.role === 'Student' || user.role === 'Teacher') && profileImage && (
                            <img
                                src={`data:image/jpeg;base64,${profileImage}`}
                                alt="User Profile"
                            />
                        )}
                        {user.role === 'Admin' && (
                            <img
                                src="https://aui.atlassian.com/aui/8.8/docs/images/avatar-person.svg"
                                alt="Admin Avatar"
                            />
                        )}
                    </div>
                    <div className="profile-name-role">
                        <div className="profile-name">{user.name}</div>
                        <div className="profile-role">
                            {user.role === 'Student'
                                ? 'Sinh Viên'
                                : user.role === 'Teacher'
                                ? 'Giảng viên'
                                : 'Admin'}
                        </div>
                    </div>
                    <div className="drop-down-icon">
                        <BsChevronDown value={{ color: 'rgba(0,134,103,1)' }} className="BsIcon" />
                    </div>
                    <ul className="navbar-profile-drop-down">
                        {user.role !== 'Admin' && (
                            <Link to="/auth/profile">
                                <li>Thông tin cá nhân</li>
                            </Link>
                        )}
                        <li onClick={handleLogout}>Đăng xuất</li>
                    </ul>
                </div>
                {/* Thông báo lỗi kết nối nếu không thể lấy dữ liệu */}
                {error && <div className="error-message">Không thể kết nối đến server</div>}
            </div>
        </nav>
    )
}

export default Navbar
