# School Event Calendar (학사일정 캘린더)

학교 행사, 수행평가, 지필고사 등의 일정을 관리하고 시간표를 조회할 수 있는 웹 애플리케이션입니다.
React 프론트엔드와 Flask 백엔드로 구성되어 있으며, 컴시간(Comci) 시간표 파싱 기능을 포함하고 있습니다.

## 🚀 주요 기능

### 1. 캘린더 (Calendar)
- **월별/연도별 보기**: 캘린더 형식으로 일정을 직관적으로 확인.
- **일정 관리 (CRUD)**:
    - 일정 추가, 수정, 삭제 기능.
    - 완료 여부 표시.
    - 상세 내용은 모달 창을 통해 확인 및 수정 가능.

### 2. 시간표 파싱 (Board API) (지원 예정)
- `comci_parser.py`를 통해 컴시간 서버에서 학급 시간표 데이터를 실시간으로 크롤링 및 파싱.
- 학년, 반 별 시간표 조회 지원.

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 19, Vite, CSS Modules
- **Backend**: Python Flask
- **Database**: JSON 파일 기반 로컬 저장소 (`events.json`)
- **Utility**: Python `requests` (시간표 파싱용)

## 📂 프로젝트 구조

```
/
├── src/                  # React 프론트엔드 소스
│   ├── components/       # Calendar, Day 등 UI 컴포넌트
│   ├── App.jsx           # 메인 애플리케이션 컴포넌트
│   └── main.jsx          # 진입점
├── flask-server/         # Flask 백엔드 서버
│   ├── app.py            # API 서버 및 데이터 처리 로직
│   └── events.json       # 일정 데이터 저장 파일
├── public/               # 정적 파일
├── comci_parser.py       # 컴시간 시간표 파싱 스크립트
├── vite.config.js        # Vite 설정
└── README.md             # 프로젝트 문서
```

## 💿 설치 및 실행 방법

### 1. 프론트엔드 (Frontend) 빌드

Node.js 환경이 필요합니다.

```bash
# 1. 루트 디렉토리에서 의존성 설치
npm install

# 2. 개발 서버 실행
npm run build
```

### 2. 백엔드 (Backend) 실행

Python 환경이 필요합니다.

```bash

# 1. 필요한 라이브러리 설치
uv sync

# 2. 서버 실행
python3 -m flask_server.app
```
* 서버는 기본적으로 `http://localhost:5000`에서 실행됩니다.

## 📝 API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/events` | 저장된 모든 일정 데이터를 조회합니다. |
| POST | `/api/post_data` | 새로운 일정을 추가합니다. |
| PUT | `/api/events/<id>` | 기존 일정을 수정합니다. |
| DELETE | `/api/events/<id>` | 일정을 삭제합니다. |
| PATCH | `/api/events/<id>/complete` | 일정의 완료 상태를 토글합니다. |

## 💡 참고 사항

- **데이터 저장**: 데이터는 `flask_server/events.json` 파일에 저장되므로, 서버를 재시작해도 데이터가 유지됩니다.
- **포트 충돌**: 5000번 포트가 사용 중일 경우 포트 설정을 변경하세요.
