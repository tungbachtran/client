import React, { useState, useEffect, useRef } from 'react'
import { Modal, Input, Button } from 'antd'
import axios from 'axios'
import * as signalR from '@microsoft/signalr'

function MessageStudentListModal({ messages, isVisible, onClose, info, classId, setMessages }) {
    const [newMessage, setNewMessage] = useState('')
    const [messagesWithSenderNames, setMessagesWithSenderNames] = useState([])
    const [connection, setConnection] = useState(null)
    const messagesEndRef = useRef(null) // Ref để cuộn đến cuối

    useEffect(() => {
        const fetchSenderNames = async () => {
            try {
                const messagesWithNames = await Promise.all(
                    messages.map(async (message) => {
                        const { data } = await axios.get(
                            `https://192.168.1.7:5001/api/user/${message.senderId}`
                        )
                        return {
                            ...message,
                            senderName: data.userInformation.name || 'Unknown'
                        }
                    })
                )
                setMessagesWithSenderNames(messagesWithNames)
            } catch (error) {
                console.error('Error fetching sender names:', error)
            }
        }

        if (messages.length > 0) fetchSenderNames()
    }, [messages])

    // Kết nối tới SignalR khi component mount
    useEffect(() => {
        const connect = new signalR.HubConnectionBuilder()
            .withUrl('https://192.168.1.7:5001/chatHub') // URL tới SignalR hub
            .withAutomaticReconnect()
            .build()

        setConnection(connect)

        connect
            .start()
            .then(() => {
                console.log('SignalR Connected')
                connect.on('ReceiveMessage', (user, message, timestamp) => {
                    // Kiểm tra xem tin nhắn có phải từ client gửi không
                    if (user !== info) {
                        // "info" là ID người gửi (client)
                        const newMessageData = {
                            senderName: user,
                            content: message,
                            timestamp: timestamp || new Date().toISOString()
                        }
                        // Kiểm tra nếu tin nhắn không trùng, thêm vào danh sách
                        setMessagesWithSenderNames((prevMessages) => {
                            // Kiểm tra nếu tin nhắn đã có trong danh sách chưa
                            if (
                                !prevMessages.some(
                                    (msg) => msg.content === message && msg.senderName === user
                                )
                            ) {
                                return [...prevMessages, newMessageData]
                            }
                            return prevMessages
                        })
                    }
                })
            })
            .catch((error) => console.error('Connection failed: ', error))
    }, [info]) // Chỉ khởi tạo lại khi `info` thay đổi

    const handleSendMessage = async () => {
        if (newMessage.trim() && connection) {
            try {
                // Gửi thông tin người dùng từ API
                const { data } = await axios.get(`https://192.168.1.7:5001/api/user/${info}`)
                const senderName = data.userInformation.name || 'Unknown'

                // Gửi tin nhắn qua SignalR với thông tin đầy đủ
                await connection.invoke('SendMessage', info, newMessage, classId) // Thêm courseClassId

                // Cập nhật tin nhắn mới vào danh sách
                const newMessageData = {
                    senderName,
                    content: newMessage,
                    timestamp: new Date().toISOString()
                }

                setMessagesWithSenderNames((prevMessages) => [...prevMessages, newMessageData])
                setNewMessage('')
            } catch (error) {
                console.error('Error sending message:', error)
            }
        }
    }

    // Hàm cuộn xuống cuối modal
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Cuộn xuống dưới mỗi khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom()
    }, [messagesWithSenderNames])

    return (
        <Modal
            title="Tin nhắn lớp học phần"
            visible={isVisible}
            onCancel={onClose}
            footer={null}
            width={600}>
            <div className="messages-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {/* Nếu không có tin nhắn thì hiển thị thông báo */}
                {messagesWithSenderNames.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888' }}>Không có tin nhắn nào.</p>
                ) : (
                    messagesWithSenderNames.map((message, index) => (
                        <div key={index} style={{ marginBottom: '15px' }}>
                            <span className="timestamp">
                                {new Date(message.timestamp).toLocaleString()} &nbsp;
                            </span>
                            <p style={{ marginBottom: '5px' }}>
                                <strong>{message.senderName}:</strong>
                            </p>
                            <p>{message.content}</p>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} /> {/* Thêm div này để cuộn đến cuối */}
            </div>

            {/* Input field for the new message */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                    type="text"
                    placeholder="Nhập tin nhắn"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{ flex: 1, marginRight: '10px' }}
                />
                <Button type="primary" onClick={handleSendMessage}>
                    Gửi
                </Button>
            </div>
        </Modal>
    )
}

export default MessageStudentListModal
