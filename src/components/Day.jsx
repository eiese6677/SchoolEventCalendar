import React from "react";

function Day({ day, eventTitle, onClick }) {
  return (
    <div className="day" onClick={onClick}>
      <div>{day}</div>
      {eventTitle && <div className="event-name">{eventTitle}</div>}
    </div>
  );
}

export default Day;
