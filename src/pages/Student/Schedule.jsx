import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import axios from 'axios'

export default function Schedule({ user, setLoading }) {
    document.title = 'Lịch học'
    const localizer = momentLocalizer(moment)
    const [events, setEvents] = useState([])

    // Giờ học theo từng tiết
    const periodList = {
        1: { startHour: 7, startMinute: 0, endHour: 7, endMinute: 50 },
        2: { startHour: 8, startMinute: 0, endHour: 8, endMinute: 50 },
        3: { startHour: 9, startMinute: 0, endHour: 9, endMinute: 50 },
        4: { startHour: 10, startMinute: 0, endHour: 10, endMinute: 50 },
        5: { startHour: 11, startMinute: 0, endHour: 11, endMinute: 50 },
        6: { startHour: 12, startMinute: 30, endHour: 13, endMinute: 20 },
        7: { startHour: 13, startMinute: 30, endHour: 14, endMinute: 20 },
        8: { startHour: 14, startMinute: 30, endHour: 15, endMinute: 20 },
        9: { startHour: 15, startMinute: 30, endHour: 16, endMinute: 20 },
        10: { startHour: 16, startMinute: 30, endHour: 17, endMinute: 20 }
    }

    // Lấy ngày trong tuần
    const getDayInWeek = (day) => {
        const today = new Date()
        const first = today.getDate() - today.getDay() + day - 1
        return new Date(today.setDate(first))
    }

    // Chuyển dữ liệu lớp học thành sự kiện cho lịch
    const eventsFromClassesData = (classesData) => {
        let events = []
        let id = 0
        classesData.forEach((item) => {
            item.schedule.forEach((scheduleItem) => {
                let startPeriod = scheduleItem.startPeriod
                let endPeriod = scheduleItem.endPeriod
                let startPeriodTime = periodList[startPeriod]
                let endPeriodTime = periodList[endPeriod]
                let date = getDayInWeek(scheduleItem.dateInWeek)
                events.push({
                    id: id,
                    allDay: false,
                    title: (
                        <span className="whitespace-pre-wrap">{`${item.name}\n${item.teacher}\n${scheduleItem.room}`}</span>
                    ),
                    start: new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        startPeriodTime.startHour,
                        startPeriodTime.startMinute
                    ),
                    end: new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        endPeriodTime.endHour,
                        endPeriodTime.endMinute
                    )
                })
                id++
            })
        })
        return events
    }

    // Hàm lấy dữ liệu từ API và tạo danh sách sự kiện
    const fetchData = async () => {
        let data = []
        setLoading(true)
        try {
            // Lấy danh sách các lớp học của user
            const { data: courseClassroomsData } = await axios.get(
                `https://10.10.36.197:5001/api/course-classroom/user/${user.name}`
            )

            // Tạo danh sách các yêu cầu API để lấy thông tin khóa học
            const courseRequests = courseClassroomsData.map((item) =>
                axios.get(`https://10.10.36.197:5001/api/course/${item.courseClassroom.courseId}`)
            )

            // Chờ tất cả các yêu cầu API hoàn thành
            const courseResponses = await Promise.all(courseRequests)

            // Xử lý dữ liệu khóa học và lớp học
            courseResponses.forEach((response, index) => {
                let item = courseClassroomsData[index]
                const course = response.data

                // Bỏ qua lớp học đã hoàn thành hoặc khóa học không khả dụng
                if (item.courseClassroom.isComplete || !course.isAvailable) return

                // Thêm thông tin khóa học vào data
                data.push({
                    name: course.name,
                    teacher: item.teacherName,
                    schedule: item.schedule
                })
            })
        } catch (err) {
            console.log(err)
        } finally {
            // Tạo các sự kiện từ dữ liệu lớp học và cập nhật trạng thái events
            setEvents(eventsFromClassesData(data))
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div id="schedule">
            <h3 className="title">LỊCH HỌC</h3>
            <div className="calendar-container">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="week"
                    views=""
                    toolbar={false}
                    min={new Date(0, 0, 0, 6, 0, 0)}
                    max={new Date(0, 0, 0, 20, 0, 0)}
                />
            </div>
        </div>
    )
}
