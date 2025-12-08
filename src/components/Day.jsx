import React from "react";

function Day({ day, eventTitle, onClick, isToday }) {
  return (
    <div className={`day ${isToday ? "today" : ""}`} onClick={onClick}>
      <div>{day}</div>
      {eventTitle && <div className="event-name">{eventTitle}</div>}
    </div>
  );
}

export default Day;
