# how many?

숏폼과 웹 피드 소비를 실시간으로 자각하게 만드는 Safari 웹 확장 MVP입니다. 화면 위에 떠 있는 캐릭터가 현재 분류와 누적 시간을 보여주고, 5분 단위로 색상과 움직임을 바꿔 사용자가 무의식적인 체류를 알아차리도록 돕습니다.

## 현재 구현

- YouTube Shorts와 일반 영상의 재생 시간·시청 개수 측정
- Instagram 릴스 재생 시간과 피드 체류 시간 측정
- TikTok 영상 피드 재생 시간·시청 개수 측정
- 에브리타임 웹페이지 체류 시간 측정
- 5분 단위 색상 변화와 모래시계·화산·고양이 CSS 애니메이션
- Safari 팝업의 사이트별 시간 요약
- 6시간 챌린지, 포인트, 테마 상점
- 신규 지갑 50P 지급, 테마 구매 시 포인트 차감
- 현재 캐릭터를 클릭하면 분류·시간·챌린지 상태를 보여주는 상세 카드

## 기술 구조

`outputs/how-many-safari/extension` 안에 Safari Web Extension MVP가 있습니다.

- `content.js`: 사이트별 분류, 재생·체류 조건 판정, 오버레이 렌더링
- `rules.js`: URL 분류와 시간 측정 규칙
- `background.js`: 저장소, 일별·6시간 집계, 포인트와 상점 상태
- `popup.html/js/css`: Safari 확장 팝업과 사이트별 대시보드
- `tests.cjs`: 측정·분류·포인트 구매 회귀 테스트

## 로컬 검증

```bash
node --test outputs/how-many-safari/extension/tests.cjs
node --check outputs/how-many-safari/extension/content.js
node --check outputs/how-many-safari/extension/background.js
```

Safari에서는 개발자용 메뉴에서 임시 확장을 다시 로드한 뒤 YouTube, Instagram, TikTok, 에브리타임 탭을 새로고침해야 새 권한과 코드를 적용할 수 있습니다.

## 포트폴리오 로드맵

1. Safari 다중 사이트 측정 MVP 정리
2. 테마 상점과 챌린지 UX 개선
3. iOS 공유 데이터 구조와 계정 동기화 검토
4. 사용성 테스트 결과와 측정 정확도 리포트 추가
5. 정식 배포용 Safari App Extension과 개인정보 안내 작성

