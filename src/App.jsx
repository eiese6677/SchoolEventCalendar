import React, { useState, useEffect } from "react";
import Calendar from "./components/Calendar.jsx";
import "./App.css";

function App() {
    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <div className="App" style={{ minHeight: "100vh", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>학교 일정 캘린더</h1>
                <button
                    onClick={toggleTheme}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "1px solid var(--border-color)",
                        background: "var(--cell-bg)",
                        color: "var(--text-color)",
                        cursor: "pointer"
                    }}
                >
                    {theme === "light" ? "🌙 다크 모드" : "☀️ 라이트 모드"}
                </button>
            </div>
            <Calendar />
        </div>
    );
}

export default App;
