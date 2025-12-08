import requests
import json
import base64
import math

class ComciParser:
    def __init__(self, data):
        self.data = data
        self.bunri = data.get("분리", 100)

    def get_teacher_index(self, val):
        """mTh: 교사 인덱스 계산"""
        if self.bunri == 100:
            return math.floor(val / self.bunri)
        return val % self.bunri

    def get_subject_index(self, val):
        """mSb: 과목 인덱스 계산"""
        if self.bunri == 100:
            return val % self.bunri
        return math.floor(val / self.bunri)

    def get_time_string(self, sb):
        """mTime: 시간 문자열 계산 (동시그룹 등)"""
        if self.bunri == 100:
            return ""
        t = math.floor(sb / self.bunri)
        if 1 <= t <= 26:
            return chr(t + 64) + "_"
        return ""

    def get_concurrent_group_code(self, grade, class_num, subject_code, day, period):
        """동시그룹코드"""
        if "동시그룹" not in self.data or not isinstance(self.data["동시그룹"], list):
            return ""

        # Check nested lists safe access
        concurrent_groups = self.data["동시그룹"]
        if not concurrent_groups or len(concurrent_groups) <= 1:
            return ""

        # 1-based index in JS logic, adjusted for 0-based list access if needed
        # JS: for(var i=1; i<=자료.동시그룹[0][0]; i++)
        # cdata.js logic is complex, direct port:
        
        try:
            group_count = concurrent_groups[0][0]
            for i in range(1, group_count + 1):
                if i >= len(concurrent_groups): break
                
                current_group_list = concurrent_groups[i]
                if not current_group_list: continue
                
                group_list_len = current_group_list[0]
                
                for k in range(1, 3): # k=1, 2
                    ck = 0
                    for j in range(1, group_list_len + 1):
                        if j >= len(current_group_list): break
                        
                        val = current_group_list[j]
                        subj4 = math.floor(val / 1000)
                        group2 = math.floor(subj4 / 1000)
                        subj2 = subj4 - group2 * 1000
                        teacher_idx = math.floor(group2 / 100)
                        group_idx = group2 - teacher_idx * 100
                        
                        class_code = val - subj4 * 1000
                        target_grade = math.floor(class_code / 100)
                        target_class = class_code - target_grade * 100
                        
                        # Timetable lookup
                        # Use get_teacher_index and get_subject_index for consistency
                        raw_val = self.data["자료147"][target_grade][target_class][day][period]
                        subj3 = self.get_teacher_index(raw_val) # Corresponds to mTh
                        teacher2 = self.get_subject_index(raw_val) # Corresponds to mSb
                        
                        if k == 1:
                            if not (subj2 == subj3 and teacher_idx == teacher2):
                                ck = 0
                                break
                            if (grade == target_grade and class_num == target_class and 
                                subject_code == subj2 and teacher_idx == teacher2 and group_idx > 0):
                                ck = 1
                        else:
                            if not (subj2 == subj3):
                                ck = 0
                                break
                            if (grade == target_grade and class_num == target_class and 
                                subject_code == subj2 and group_idx > 0):
                                ck = 1
                    
                    if ck == 1:
                        n2 = group_idx + 64
                        return chr(n2) + "_"
                        
        except Exception as e:
            # print(f"Error in concurrent group calculation: {e}")
            return ""
            
        return ""

    def get_timetable(self, grade, class_num):
        """특정 학년/반의 시간표를 파싱하여 반환"""
        timetable = {}
        # day: 1(Mon) ~ 5(Fri)
        days = ["월", "화", "수", "목", "금"]
        
        # Check if data exists for this grade/class
        raw_147 = self.data.get("자료147", [])
        if not raw_147 or len(raw_147) <= grade or len(raw_147[grade]) <= class_num:
             print(f"No data found for Grade {grade} Class {class_num}")
             return {}

        for day_idx, day_name in enumerate(days, start=1):
            timetable[day_name] = {}
            for period in range(1, 9):
                try:
                    daily_data = raw_147[grade][class_num][day_idx][period]
                    
                    if daily_data > 100:
                        th = self.get_teacher_index(daily_data)
                        sb = self.get_subject_index(daily_data)
                        
                        teacher_name = ""
                        if "자료446" in self.data and th < len(self.data["자료446"]):
                            teacher_name = self.data["자료446"][th][:2]
                        
                        subject_name = ""
                        if "자료492" in self.data and sb < len(self.data["자료492"]):
                            subject_name = self.data["자료492"][sb]
                            
                        # 동시그룹 체크 (Optional, for advanced display)
                        # group_code = self.get_concurrent_group_code(grade, class_num, sb, day_idx, period) 
                        
                        timetable[day_name][period] = {
                            "subject": subject_name,
                            "teacher": teacher_name,
                            "raw": daily_data
                        }
                    else:
                        timetable[day_name][period] = None
                except (IndexError, KeyError, TypeError):
                     pass
                    
        return timetable

def make_comci_url(school_code, main_school_code=73629, week_num=1):
    """
    cdata.js의 sc_data 로직을 기반으로 URL 생성
    Default main_school_code 73629 seems standard for Comci.
    school_code (sc): 학교 고유 코드 (예: 56067)
    week_num (r): 주차 (보통 1)
    """
    prefix = f"{main_school_code}_{school_code}"
    # data_ver (da1) usually 0 initially
    data_ver = 0 
    
    # String to encode: "73629_56067_0_1"
    raw_str = f"{prefix}_{data_ver}_{week_num}"
    encoded = base64.b64encode(raw_str.encode('utf-8')).decode('utf-8')
    
    return f"http://comci.net:4082/36179?{encoded}"

def fetch_and_parse(url, grade, class_num):
    print(f"URL: {url}")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Encoding check
        response.encoding = 'UTF-8' 
        
        try:
            content = response.text.strip()
            # Clean Comci weirdness
            if content.rfind('}') != -1:
                content = content[:content.rfind('}')+1]
            if content.startswith('\x00'): content = content.lstrip('\x00')
                
            data = json.loads(content)
        except json.JSONDecodeError:
            # Fallback EUC-KR
            try:
                content = response.content.decode('euc-kr').strip()
                if content.rfind('}') != -1: content = content[:content.rfind('}')+1]
                data = json.loads(content)
            except:
                print("Failed to decode JSON response")
                return {}
        
        parser = ComciParser(data)
        
        # Check source data logic
        # Some responses might have data in '자료481' instead of '자료147'
        if not data.get("자료147"):
            if data.get("자료481"):
                # print("Info: Using '자료481' as timetable source.")
                parser.data["자료147"] = parser.data["자료481"]
            else:
                 print("Error: valid timetable data (147 or 481) not found.")
                 # Debug: print keys to help user
                 # print(f"Keys found: {list(data.keys())}")
                 return {}

        result = parser.get_timetable(grade, class_num)
        return result
        
    except Exception as e:
        print(f"Request Error: {e}")
        return {}

if __name__ == "__main__":
    # Settings
    SCHOOL_CODE = 56067 
    GRADE = 2
    CLASS = 6
    
    # 1. Generate URL
    target_url = make_comci_url(SCHOOL_CODE)
    
    print(f"Fetching timetable for Grade {GRADE} Class {CLASS}...")
    timetable = fetch_and_parse(target_url, GRADE, CLASS)
    
    if timetable:
        print("\n[시간표]")
        for day, periods in timetable.items():
            print(f"\n[{day}요일]")
            sorted_periods = sorted(periods.keys())
            if not sorted_periods:
                 print("  (휴일/데이터 없음)")
            for p in sorted_periods:
                info = periods[p]
                if info:
                    print(f"  {p}교시: {info['subject']} ({info['teacher']})")
                else:
                    print(f"  {p}교시: -")
    else:
        print("\n시간표를 가져오지 못했습니다.")
