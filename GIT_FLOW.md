# Git 브랜치 전략 (Solaness)

## 브랜치 구조

```
main                # 항상 배포 가능한 상태 (Firebase Hosting 배포 대상)
 └─ develop         # 다음 배포 전 통합 브랜치
     ├─ feature/onboarding-login
     ├─ feature/map-search
     ├─ fix/calendar-date-select-bug
     └─ ...
```

- `main`: 항상 정상 동작해야 함. 여기 직접 커밋 금지, `develop`에서 PR로만 병합
- `develop`: 각자 작업한 feature 브랜치를 여기로 모음. 주 1회 정도 `main`에 병합해서 배포 상태 갱신
- `feature/*`, `fix/*`: 화면/기능 단위로 새 브랜치 생성해서 작업

## 브랜치 이름 규칙

```
feature/이슈번호-화면-기능        예: feature/1-onboarding-wbti-test
fix/이슈번호-버그내용             예: fix/2-map-search-result-missing
chore/이슈번호-작업내용           예: chore/3-firebase-initial-setup
```

## 작업 순서

1. `develop`에서 새 브랜치 생성
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/screen-feature-name
   ```
2. 작업 후 커밋 (커밋 메시지는 아래 컨벤션 참고)
3. `develop`으로 PR 생성 → 팀원 1명 리뷰 후 **Squash and merge**로 병합
   - PR 안의 여러 커밋(작업 중 기록)이 `develop`엔 1개 커밋으로 합쳐짐
   - 병합 시 뜨는 커밋 메시지 입력창(기본값: PR 제목)에 **최종적으로 위 컨벤션에 맞는 메시지**를 넣기
     → 즉, PR 제목을 `feat: 지도 상세페이지 구현` 처럼 지어두면 그대로 커밋 메시지가 됨
4. 병합된 브랜치는 삭제

## 커밋 메시지 컨벤션

**Squash and merge를 사용하므로, `develop`에 실제로 남는 커밋 메시지는 PR 제목이에요.**
- feature 브랜치 안에서 작업할 때 개별 커밋 메시지는 편하게 적어도 됨 (`wip`, `수정` 등도 OK — 어차피 병합되면서 하나로 합쳐짐)
- 대신 **PR 제목은 반드시 아래 컨벤션에 맞게** 작성하기 → 이게 곧 `develop`/`main`의 커밋 히스토리가 됨

타입은 아래 표 기준으로 사용.

| 타입 | 의미 | 예시 |
|---|---|---|
| `feat` | 새 기능/화면 추가 | `feat: 온보딩 유형검사 화면 구현` |
| `fix` | 버그 수정 | `fix: 캘린더 날짜 선택 시 오류 수정` |
| `style` | 코드 동작에 영향 없는 스타일/포맷 변경 (레이아웃, 색상, 여백 등 UI 스타일 포함) | `style: 홈 화면 반응형 레이아웃 조정` |
| `refactor` | 기능 변화 없이 코드 구조 개선 | `refactor: PlaceThumbCard 공용 컴포넌트로 분리` |
| `chore` | 빌드/설정/패키지 등 기타 작업 | `chore: Firebase 초기 설정` |
| `docs` | 문서 추가/수정 | `docs: README 업데이트` |
| `test` | 테스트 코드 추가/수정 | `test: 유형검사 답변 저장 로직 테스트 추가` |
| `perf` | 성능 개선 | `perf: 지도 검색 쿼리 최적화` |
| `remove` | 파일/코드/기능 삭제 | `remove: 사용하지 않는 더미 데이터 삭제` |
| `merge` | 브랜치 병합 (주로 자동 생성됨) | `merge: develop into feature/map-search` |

### 작성 팁
- 한 커밋에 여러 타입 섞이면 커밋 나누기 (예: 기능 추가 + 오타 수정은 따로)
- 내용은 한글로 편하게, 무엇을 했는지 명확하게만 적으면 충분
- 이슈 번호 있으면 뒤에 붙이기: `feat: 지도 상세페이지 구현 (#12)`

## 병합 주기

- **feature → develop**: 화면 하나 완성될 때마다 수시로 (미루지 말 것)
- **develop → main**: 주 1회 (매주 금요일 등 정해두면 좋음) — 이때 배포까지 같이 진행

## 충돌 방지 팁

- 화면 단위로 담당을 나눴으니(온보딩/지도/기록 등) 같은 파일을 여러 명이 동시에 건드릴 일은 적음
- 공용 컴포넌트(`BottomNav`, `ProgressBar` 등)를 수정할 땐 팀 채널에 먼저 알리고 작업하기
- `develop` pull 자주 하기
