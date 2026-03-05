import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Day from "./Day.jsx";

function Calendar() {
  const [events, setEvents] = useState({});
  const [selectedDay, setSelectedDay] = useState(null); // Refactored from selectedEvent object to just day number
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0=1월, 11=12월

  // 이벤트 Map 생성 (day -> event[])
  const eventMap = useMemo(() => {
    const yearEvents = events[currentYear] || {};
    const monthEvents = yearEvents[currentMonth + 1] || [];
    const map = new Map();
    monthEvents.forEach((e) => {
      if (!map.has(e.day)) {
        map.set(e.day, []);
      }
      map.get(e.day).push(e);
    });
    return map;
  }, [events, currentYear, currentMonth]);

  // Derived state for the modal
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return eventMap.get(selectedDay) || [];
  }, [selectedDay, eventMap]);

  // API Base URL
  // 로컬/외부/Ngrok 등 모든 환경에서 작동하도록 Proxy("/api")를 사용
  const API_BASE_URL = "/api";

  // 이벤트 데이터 가져오기 함수
  const fetchEvents = () => {
    fetch(`${API_BASE_URL}/events`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => setEvents(data))
      .catch((err) => console.error("Failed to fetch events:", err));
  };

  useEffect(() => {
    fetchEvents();
    // 2초마다 자동 새로고침 (Polling)
    const intervalId = setInterval(fetchEvents, 2000);
    return () => clearInterval(intervalId);
  }, []);

  // --- 이벤트 추가 모달 상태 및 핸들러 ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newYear, setNewYear] = useState(today.getFullYear());
  const [newMonth, setNewMonth] = useState(today.getMonth() + 1);
  const [newDay, setNewDay] = useState(1);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const openAddModal = () => {
    // 현재 보고 있는 연/월로 초기값 설정 (일은 1일로)
    setNewYear(currentYear);
    setNewMonth(currentMonth + 1);
    setNewDay(1);
    setNewTitle("");
    setNewDesc("");
    setIsEditMode(false);
    setEditingEventId(null);
    setShowAddModal(true);
  };

  const openEditModal = (event) => {
    setNewYear(currentYear);
    setNewMonth(currentMonth + 1);
    setNewDay(event.day);
    setNewTitle(event.title);
    setNewDesc(event.description);
    setIsEditMode(true);
    setEditingEventId(event.id);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleSaveEvent = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      alert("제목과 내용은 필수입니다.");
      return;
    }

    const dataToSend = {
      year: parseInt(newYear, 10),
      month: parseInt(newMonth, 10),
      day: parseInt(newDay, 10),
      title: newTitle,
      description: newDesc,
    };



    if (isEditMode) {
      axios
        .put(`${API_BASE_URL}/events/${editingEventId}`, dataToSend)
        .then((response) => {
          console.log("Success:", response.data);
          alert("이벤트가 수정되었습니다.");
          closeAddModal();
          fetchEvents();
        })
        .catch((error) => {
          console.error("Error updating event:", error);
          alert("이벤트 수정 실패");
        });
    } else {
      axios
        .post(`${API_BASE_URL}/post_data`, dataToSend)
        .then((response) => {
          console.log("Success:", response.data);
          alert("이벤트가 추가되었습니다.");
          closeAddModal();
          fetchEvents(); // 목록 갱신
        })
        .catch((error) => {
          console.error("Error saving event:", error);
          alert("이벤트 저장 실패");
        });
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;

    axios
      .delete(`${API_BASE_URL}/events/${eventId}`)
      .then(() => {
        alert("삭제되었습니다.");
        fetchEvents(); // Refresh events
        // Modal stays open, list updates automatically via derived state
      })
      .catch((err) => {
        console.error("Error deleting event:", err);
        alert("삭제 실패");
      });
  };

  const handleToggleComplete = (eventId) => {
    axios
      .patch(`${API_BASE_URL}/events/${eventId}/complete`)
      .then((res) => {
        fetchEvents(); // Refresh events
        // Modal updates automatically via derived state
      })
      .catch((err) => {
        console.error("Error toggling complete:", err);
        alert("상태 변경 실패");
      });
  };

  const handleDayClick = (month, day) => {
    setSelectedDay(day);
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
        <button className="transparent-button" onClick={prevMonth}>
          ◀
        </button>
        <span>
          {currentYear}년 {currentMonth + 1}월
        </span>
        <button className="transparent-button" onClick={nextMonth}>
          ▶
        </button>
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
          const events = eventMap.get(day);
          const titleString = events ? events.map((e) => e.title).join(", ") : null;

          const todayDate = new Date();
          const isToday =
            day === todayDate.getDate() &&
            currentMonth === todayDate.getMonth() &&
            currentYear === todayDate.getFullYear();

          return (
            <Day
              key={idx}
              day={day}
              eventTitle={titleString}
              isToday={isToday}
              onClick={() => handleDayClick(currentMonth + 1, day)}
            />
          );
        })}
      </div>

      {/* 모달 */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {/* X 아이콘 버튼 */}
            <button
              className="modal-close"
              onClick={() => setSelectedDay(null)}
            >
              &times;
            </button>

            <h2>{selectedDay}일 일정</h2>
            {selectedDayEvents.length > 0 ? (
              <div className="event-list">
                {selectedDayEvents.map((evt, i) => (
                  <div
                    key={i}
                    className="event-item"
                    style={{
                      marginBottom: "15px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: "0 0 5px 0",
                          textDecoration: evt.completed ? "line-through" : "none",
                          color: evt.completed ? "#999" : "inherit",
                        }}
                      >
                        {evt.title}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          textDecoration: evt.completed ? "line-through" : "none",
                          color: evt.completed ? "#999" : "inherit",
                        }}
                      >
                        {evt.description}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => openEditModal(evt)}
                        style={{
                          padding: "5px 10px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          backgroundColor: "#2196F3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleToggleComplete(evt.id)}
                        style={{
                          padding: "5px 10px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          backgroundColor: evt.completed ? "#aaa" : "#4caf50",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        {evt.completed ? "취소" : "완료"}
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        style={{
                          padding: "5px 10px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>행사 없음</p>
            )}
          </div>
        </div>
      )}
      {/* 이벤트 추가 모달 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAddModal}>
              &times;
            </button>
            <h2>{isEditMode ? "이벤트 수정" : "새 이벤트 추가"}</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>날짜</label>
                <div className="date-inputs">
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="년"
                  />
                  <span>년</span>
                  <input
                    type="number"
                    value={newMonth}
                    onChange={(e) => setNewMonth(e.target.value)}
                    placeholder="월"
                    min="1"
                    max="12"
                  />
                  <span>월</span>
                  <input
                    type="number"
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    placeholder="일"
                    min="1"
                    max="31"
                  />
                  <span>일</span>
                </div>
              </div>
              <div className="form-group">
                <label>제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="이벤트 제목"
                />
              </div>
              <div className="form-group">
                <label>내용</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="이벤트 상세 내용"
                  rows="4"
                ></textarea>
              </div>
              <button className="save-btn" onClick={handleSaveEvent}>
                {isEditMode ? "수정하기" : "저장하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이벤트 추가 FAB 버튼 */}
      <button
        className="add-event-btn"
        onClick={openAddModal}
        title="이벤트 추가"
      >
        +
      </button>
    </div>
  );
}

export default Calendar;
