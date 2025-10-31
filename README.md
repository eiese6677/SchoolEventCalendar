School Event Calendar Web App
프로젝트 개요

학생들이 학교 행사, 수행평가, 지필고사 등의 일정을 한눈에 보고, 클릭하면 상세 내용을 확인할 수 있는 웹 애플리케이션.
이번 업데이트로 연도·월별 이벤트 구분, 모달 크기 화면 비율 적용, X 버튼 닫기 기능까지 적용됨.

목표

학교 관련 일정 통합 관리

클릭 시 상세 정보 확인 (모달)

월/연도별 이벤트 표시

PC/모바일 웹 모두 지원

기술 스택

Frontend: React, HTML, CSS

Backend: Python Flask

Database: JSON 파일 (추후 SQLite/PostgreSQL 연동 가능)

Deployment: 라즈베리파이 OS 또는 Ubuntu

핵심 기능

🗓️ 달력 UI

연도/월별 이동 가능

각 날짜에 이벤트 표시

🔍 상세 이벤트 모달

클릭 시 모달로 이벤트 상세 정보 표시

모달 크기: 화면 비율 기준(vw/vh)

닫기 버튼: 오른쪽 위 X 아이콘

➕ 관리자용 일정 추가/수정

현재는 JSON 기반, 추후 DB 연동 가능

데이터 구조 (events.json)
{
"2025": {
"10": [
{ "day": 5, "title": "체육대회", "description": "체육관에서 열림" },
{ "day": 12, "title": "과학실험", "description": "실험실에서 진행" }
],
"11": [
{ "day": 1, "title": "독서의 날", "description": "도서관 행사" }
]
},
"2026": {
"1": [
{ "day": 3, "title": "신년 행사", "description": "강당에서 진행" }
]
}
}

최상위 키: 연도

두 번째 키: 월

값: 해당 달 이벤트 배열

프로젝트 구조
/frontend
├─ App.js
├─ Calendar.jsx
├─ Day.jsx
└─ App.css
/backend
└─ app.py
events.json
README.md

설치 및 실행

1. Backend (Flask)
   cd backend
   pip install flask flask-cors
   python app.py

서버 주소: http://localhost:5000

2. Frontend (React)
   cd frontend
   npm install
   npm start

브라우저 열면 달력 UI 확인 가능

월/연도 버튼으로 이동 가능

이벤트 클릭 시 모달 표시

React 코드 수정 시 Flask 서버는 그대로 켜둬도 됨.
Flask 코드나 events.json 변경 시에는 서버 재시작 필요.

향후 확장 아이디어

사용자 로그인 & 즐겨찾기 일정

알림 기능 (디스코드/카톡/메일)

다크 모드 및 테마

DB 연동 및 관리자 UI 강화

반응형 디자인 개선 (모바일 최적화)
