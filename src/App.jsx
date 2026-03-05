import React, { useState, useEffect } from "react";
import Calendar from "./components/Calendar.jsx";
import Login from "./components/Login.jsx";
import "./App.css";
import "./components/Login.css";

function App() {
    const [theme, setTheme] = useState("light");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    const [suggestionMessage, setSuggestionMessage] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    // Get auth token from localStorage
    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
    };

    const fetchSuggestions = () => {
        fetch("/api/suggestions", {
            headers: getAuthHeaders()
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then((data) => setSuggestions(data))
            .catch((err) => console.error("Failed to fetch suggestions:", err));
    };

    const handleSaveSuggestion = () => {
        if (!suggestionMessage.trim()) {
            alert("건의 메시지를 입력해주세요.");
            return;
        }

        fetch("/api/suggestions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                message: suggestionMessage
            })
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then((data) => {
                alert(data.message);
                setSuggestionMessage("");
                fetchSuggestions(); // 목록 갱신
            })
            .catch((err) => {
                console.error("Failed to submit suggestion:", err);
                alert("건의 제출 실패");
            });
    };

    // Check authentication on app load
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Verify token is still valid
            fetch('/api/events', {
                headers: getAuthHeaders()
            })
                .then(response => {
                    if (response.ok) {
                        setIsLoggedIn(true);
                    } else {
                        localStorage.removeItem('authToken');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('authToken');
                });
        }
    }, []);

    if (!isLoggedIn) {
        return (
            <div style={{
                fontFamily: "Arial, sans-serif",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                margin: 0,
                padding: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                color: "white"
            }}>
                <Login onLogin={handleLogin} />
            </div>
        );
    }

    return (
        <div className="App" style={{ minHeight: "100vh", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>학교 일정 캘린더</h1>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: "1px solid var(--border-color)",
                            background: "var(--cell-bg)",
                            color: "var(--text-color)",
                            cursor: "pointer"
                        }}
                    >
                        로그아웃
                    </button>
                </div>
            </div>
            <Calendar />

            {/* 건의하기 버튼 */}
            <button
                onClick={() => {
                    setShowSuggestionModal(true);
                    fetchSuggestions();
                }}
                style={{
                    position: "fixed",
                    bottom: "30px",
                    left: "30px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "var(--fab-bg)",
                    color: "var(--fab-text)",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "transform 0.2s, background-color 0.2s",
                    zIndex: "999"
                }}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--fab-hover)";
                    e.target.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "var(--fab-bg)";
                    e.target.style.transform = "scale(1)";
                }}
            >
                💬
            </button>

            {/* 건의하기 모달 */}
            {showSuggestionModal && (
                <div className="modal-overlay" onClick={() => setShowSuggestionModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "80vh", overflow: "auto" }}>
                        <button
                            className="modal-close"
                            onClick={() => setShowSuggestionModal(false)}
                        >
                            ✕
                        </button>
                        <h2>건의하기</h2>
                        <textarea
                            value={suggestionMessage}
                            onChange={(e) => setSuggestionMessage(e.target.value)}
                            placeholder="건의 내용을 입력해주세요..."
                            style={{
                                width: "100%",
                                height: "120px",
                                padding: "10px",
                                marginTop: "15px",
                                marginBottom: "15px",
                                border: "1px solid var(--input-border)",
                                borderRadius: "4px",
                                backgroundColor: "var(--input-bg)",
                                color: "var(--input-text)",
                                fontSize: "1rem",
                                fontFamily: "inherit",
                                resize: "none",
                                boxSizing: "border-box"
                            }}
                        />
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
                            <button
                                onClick={handleSaveSuggestion}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    border: "none",
                                    backgroundColor: "var(--fab-bg)",
                                    color: "var(--fab-text)",
                                    cursor: "pointer",
                                    fontSize: "1rem"
                                }}
                            >
                                제출
                            </button>
                            <button
                                onClick={() => setShowSuggestionModal(false)}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "4px",
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--cell-bg)",
                                    color: "var(--text-color)",
                                    cursor: "pointer",
                                    fontSize: "1rem"
                                }}
                            >
                                취소
                            </button>
                        </div>

                        {/* 건의사항 목록 */}
                        <h3 style={{ marginTop: "20px", marginBottom: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                            이전 건의사항 ({suggestions.length}개)
                        </h3>
                        {suggestions.length === 0 ? (
                            <p style={{ color: "var(--text-color)", fontStyle: "italic" }}>아직 건의사항이 없습니다.</p>
                        ) : (
                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={suggestion.id}
                                        style={{
                                            backgroundColor: "var(--cell-bg)",
                                            border: "1px solid var(--border-color)",
                                            borderRadius: "4px",
                                            padding: "10px",
                                            marginBottom: "10px",
                                            color: "var(--text-color)"
                                        }}
                                    >
                                        <div style={{ fontSize: "0.9rem", color: "var(--event-text)", marginBottom: "5px" }}>
                                            #{suggestions.length - index} - {new Date(suggestion.timestamp).toLocaleString()}
                                        </div>
                                        <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                                            {suggestion.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
