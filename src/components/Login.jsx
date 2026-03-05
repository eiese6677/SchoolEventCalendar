import React, { useState, useEffect } from 'react';
import './Login.css';

function Login({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!password.trim()) {
            setError('비밀번호를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: password.trim() })
            });

            const data = await response.json();

            if (data.token) {
                localStorage.setItem('authToken', data.token);
                onLogin();
            } else {
                setError(data.error || '로그인 실패');
            }
        } catch (error) {
            setError('로그인 중 오류가 발생했습니다.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    useEffect(() => {
        // Check if already logged in
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const response = await fetch('/api/events', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        onLogin();
                    } else {
                        localStorage.removeItem('authToken');
                    }
                } catch (error) {
                    localStorage.removeItem('authToken');
                }
            }
        };

        checkAuth();
    }, [onLogin]);

    return (
        <div className="login-container">
            <h1>학교 일정 캘린더</h1>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                onKeyPress={handleKeyPress}
                disabled={isLoading}
            />
            <button onClick={handleLogin} disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
            </button>
            {error && <div className="error">{error}</div>}
        </div>
    );
}

export default Login;