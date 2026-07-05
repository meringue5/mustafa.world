# Mustafa World Agent Notes

## 프로젝트 성격

Mustafa World는 브라우저에서 실행되는 MUD/TUI 프로토타입이다. 구현은 `xterm.js`를 기반으로 한다.

터미널 내부 UI는 반드시 터미널의 논리로 구성한다. ANSI 출력, 터미널 행/열, 고정 입력 영역, 키보드 중심 조작을 기본으로 삼는다. DOM 버튼, HTML form, 장식적인 웹 UI로 터미널 입력을 대체하지 않는다.

DOM/CSS는 다음 용도까지 허용한다.

-   xterm 컨테이너 호스팅
-   폰트 로딩
-   viewport 크기 조정

현재 월드 데이터의 저작 원본은 `world-vault/` 아래의 Obsidian 스타일 vault다. 런타임은 `src/generated/world.json`을 사용한다.

## 명령

-   월드 데이터 빌드: `npm run build:world`
-   개발 서버: `npm run dev -- --port 5173`
-   프로덕션 빌드: `npm run build`

`npm run dev`와 `npm run build`는 먼저 `build:world`를 실행한다. 로컬 확인 URL은 기본적으로 `http://127.0.0.1:5173/`를 사용한다. 예전 Vite 서버가 같은 포트에 남아 있으면 먼저 종료하고 새 서버를 띄운다.

## 설계 문서 규칙

설계 문서는 큰 단일 문서에서 작은 모듈 문서로 옮기는 중이다.

-   `docs/DESIGN.md`는 초기 종합 설계 로그다.
-   `docs/design/README.md`는 모듈형 설계 문서의 색인이다.
-   새 결정이나 크게 수정된 결정은 가능한 한 `docs/design/` 아래의 해당 문서에 기록한다.
-   같은 내용을 긴 형태로 두 곳에 중복하지 않는다.
-   기존 `docs/DESIGN.md`의 내용을 모듈 문서로 옮긴 경우, `docs/DESIGN.md`에는 짧은 요약과 링크만 남긴다.
-   코드 동작이 바뀌면 같은 턴에서 관련 설계 문서도 갱신한다.

현재 모듈:

-   `docs/design/ui.md`
-   `docs/design/command-composer.md`
-   `docs/design/world.md`
-   `docs/design/location.md`
-   `docs/design/actor.md`
-   `docs/design/item.md`
-   `docs/design/ontology.md`
-   `docs/design/environment.md`

## 개발/배포 환경

-   자세한 구조는 `docs/design/environment.md`를 따른다.
-   루트 `index.html`은 GitHub Pages가 직접 서빙하는 사용자용 파일이 아니라 Vite entry/template이다.
-   실제 Pages 배포물은 GitHub Actions가 `npm run build`로 생성한 `dist/index.html`이다.
-   GitHub Pages source는 `GitHub Actions`로 유지한다. `main / root` branch deploy로 바꾸지 않는다.
-   `dist/`, `node_modules/`, `.publish/`는 commit하지 않는다.
-   `.publish/`는 이 작업 환경에서 원격 push가 필요할 때 쓰는 임시 clone일 뿐 canonical source가 아니다.
-   `git push`는 곧 GitHub Pages 배포를 의미한다. 사용자가 해당 턴에서 명시적으로 요청하기 전에는 push하지 않는다.
-   문서 수정, 코드 수정, 로컬 빌드 검증은 push 요청으로 해석하지 않는다.

## 커맨드 컴포저 원칙

커맨드 컴포저를 일반적인 다음 토큰 예측기로 만들지 않는다.

컴포저는 현재 세계 상태가 허용하는 affordance를 보여줘야 한다. 여기서 affordance란 현재 장소, 행위자, 사물, 인벤토리, 관계가 가능하게 만드는 행동이다.

한국어 조사는 파서가 인자 역할을 판단하는 타입 표식에 가깝다. 기본 추천 UI가 플레이어에게 조사를 먼저 고르게 만들지 않는다.

예시:

-   동사 먼저 입력은 함수 시그니처를 사용한다. `먹어`는 먹을 수 있는 대상을 묻고, `가`는 연결된 장소를 묻는다.
-   명사 먼저 입력은 가능한 행동을 우선 제안한다. `노아`는 현재 세계가 허용한다면 `쓰다듬어`, `살펴봐`, `츄르를 줘` 같은 후보를 낸다.
-   `노아를`, `노아에게`, `노아와` 같은 조사는 사용자가 직접 입력했을 때 파싱하되, 기본 후보 UI를 지배하지 않는다.

## TUI 규칙

-   기본 터미널 폰트는 `IyagiGGCHalf`다.
-   `customGlyphs`는 `false`로 둔다. 박스/블록 글리프는 xterm 내장 도형이 아니라 폰트 글리프로 그린다.
-   터미널 UI 색은 ANSI 16색만 사용한다.
-   하단 입력 패널은 5줄 고정이다.
-   후보 선택은 괄호 문자가 아니라 ANSI 반전색으로 표시한다.
-   입력줄에는 보이는 `>` 프롬프트를 두지 않는다.
-   한글 IME 조합 중인 글자를 미리 읽어 후보를 추정하지 않는다.
-   후보 추천은 확정된 입력이 공백으로 끝나는 단어 경계에서만 열린다.

## 월드 데이터 규칙

-   장소는 그래프 노드다.
-   링크는 동서남북 방향이 아니라 의미적 엣지다.
-   링크 라벨은 이동 동사가 아니라 목적지 이름 또는 짧은 장소명이다.
-   장소 저작 원본은 `world-vault/rooms/**/*.md`다.
-   온톨로지도 우선 `world-vault/` 안에서 작성한다. 방침은 `Obsidian-first, export-later`다.
-   템플릿과 스키마가 바뀌면 기존 장소 파일의 마이그레이션/리팩터링이 필요할 수 있다.

## 작업 태도

-   변경은 요청 범위 안에서 작게 유지한다.
-   브라우저/DOM API를 쓰더라도 터미널 우선 설계를 보존한다.
-   임의 문자열 예측보다 구조화된 세계 데이터와 명시적 관계를 우선한다.
-   파서 동작을 추가할 때는 그것이 문법 기반인지, affordance 기반인지, 임시 프로토타입인지 문서에 남긴다.
