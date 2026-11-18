# SNU Dental Prep Portfolio

서울대학교 치의학대학원 프렙 포트폴리오 — 전임상 실습(마네킹·덴티폼)과 원내생진료 케이스를
한 구조로 누적하는 정적 웹사이트입니다. 빌드 도구 없이 GitHub Pages에서 그대로 열립니다.

- **Live**: https://weakold26.github.io/snu-dental-prep-portfolio/
- **Stack**: HTML + CSS + Vanilla JS (no build step, no dependencies)
- **Data**: `assets/js/data.js` (seed) + `localStorage` (browser-only records)

## 구조

```
index.html                 마크업 전체 (히어로 · 트랙 · 케이스 · 로드맵 · 안내 · 푸터)
assets/css/style.css       디자인 시스템 (SNU Blue #0F2D75 기반, PC/모바일 반응형)
assets/js/data.js          케이스 시드 데이터 — 사진 경로도 여기서 지정
assets/js/app.js           렌더링 · 필터 · 상세 모달 · 등록 · JSON 백업
assets/img/logo.png        헤더용 컬러 로고 (319×61, 원본 비율 유지)
assets/img/logoW.png       푸터용 화이트 로고 (319×61)
assets/img/mobileicon.png  파비콘 (114×114)
```

## 케이스 데이터

`data.js`의 `SDP_CASES` 배열에 케이스가 들어 있습니다. 카드 하나에 필요한 항목:

| 필드 | 설명 |
| --- | --- |
| `track` | `preclinical`(전임상 · 본2) 또는 `clinic`(원내생진료 · 본3–4) |
| `subject` | `conservative` / `prosthodontics` / `endodontics` / `pediatric` / `perio` |
| `tooth` | FDI 치식 번호 (`#46`, `#11`, `#75` …) |
| `title` | 시술·프렙명 |
| `course`, `date` | 실습 과목명, 실습일 |
| `instruments` | 사용 기구·버 배열 |
| `photos[]` | 다각도 사진 슬롯 `{ label, src }` — **`src: null`이면 검은색 `(사진)` 빈칸** |
| `checks[]` | 체크포인트/자가평가 `{ k, v, state }`, `state`: `good` \| `fair` \| `warn` |
| `feedback` | 교수님 피드백 메모 |

### 사진 넣는 두 가지 방법

1. **저장소에 올려 연결 (권장)** — 사진을 `assets/photos/`에 두고 `src`를 경로로 지정합니다.
   모든 기기에서 보이고 기록이 저장소에 남습니다.
2. **브라우저에서 바로 넣기** — 카드의 `(사진)` 칸을 클릭해 파일을 고르면 `localStorage`에
   저장됩니다. 새로고침해도 유지되지만, 그 브라우저에만 남으므로 `JSON 내보내기`로 백업하세요.

## 원내생진료로 전환

`data.js`에는 원내생진료 슬롯 2개(`slot: true`, 카드에 `예시` 배지)가 들어 있습니다.
본3 진료가 시작되면 그 슬롯을 복제해 실제 케이스로 채우면 됩니다.
트랙 필터 `전임상 / 원내생진료`로 나눠 보고, `전체`에서는 시간순으로 함께 봅니다.

## 개인정보

- 공개 저장소입니다. 이름·학교 메일·학번 등 식별 정보를 코드나 커밋에 넣지 않았습니다.
- 사진에는 환자 식별 정보(얼굴, 이름, 차트 번호)가 찍히지 않게 해 주세요.
- 브라우저에 저장한 사진은 서버로 전송되지 않습니다.

## License

개인 학습 기록입니다. 코드는 자유롭게 참고하셔도 됩니다.
