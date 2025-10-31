import React, { useState, useEffect, useMemo } from "react";
import Day from "./Day";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(9); // 0=1월, 9=10월

  // 이벤트 Map 생성 (day -> event)
  const eventMap = useMemo(() => {
    const yearEvents = events[currentYear] || {};
    const monthEvents = yearEvents[currentMonth + 1] || [];
    const map = new Map();
    monthEvents.forEach((e) => map.set(e.day, e));
    return map;
  }, [events, currentYear, currentMonth]);

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  const handleDayClick = (day) => {
    const event = eventMap.get(day);
    if (event) setSelectedEvent(event);
    else alert(`${day}일에는 일정이 없습니다.`);
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  return (
    <div>
      {/* 월 이동 버튼 */}
      <div className="month-nav">
        <button onClick={prevMonth}>◀</button>
        <span>
          {currentYear}년 {currentMonth + 1}월
        </span>
        <button onClick={nextMonth}>▶</button>
      </div>

      {/* 달력 그리드 */}
      <div className="calendar-grid">
        {["일", "월", "화", "수", "목", "금", "토"].map((d, idx) => (
          <div key={idx} className="weekday">
            {d}
          </div>
        ))}

        {calendarDays.map((day, idx) => {
          if (!day) return <div key={idx} className="empty-cell"></div>;
          const event = eventMap.get(day);
          return (
            <Day
              key={idx}
              day={day}
              eventTitle={event ? event.title : null}
              onClick={() => handleDayClick(day)}
            />
          );
        })}
      </div>

      {/* 모달 */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {/* X 아이콘 버튼 */}
            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
            >
              &times;
            </button>

            <h2>{selectedEvent.title}</h2>
            <p>{selectedEvent.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
