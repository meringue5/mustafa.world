# Environment Design

이 문서는 개발, 빌드, 배포 환경의 약속을 기록한다. 게임/UI/월드 설계와 달리, 여기의 내용은 프로젝트를 어떻게 실행하고 GitHub Pages에 올리는지에 관한 것이다.

## 기본 방침

Mustafa World는 **정적 우선 개발, 빌드 기반 배포**의 이중 구조를 사용한다.

-   평소 개발 루프에서는 루트 `index.html`을 브라우저에서 직접 연다.
-   소스와 문서만 바꿀 때는 설치, 개발 서버, 프로덕션 빌드가 필요하지 않다.
-   월드 원본이 바뀌면 월드 생성기만 실행한다.
-   push/배포 전에는 정적 배포물을 `dist/`에 조립해 전체 경로를 검증한다.
-   앱이 커져 번들링이나 코드 분할이 필요해지면 배포 빌드 내부에 도입한다. 일상 개발 루프를 먼저 무겁게 만들지는 않는다.

빌드를 없앤 것이 아니라 역할을 배포 경계로 좁힌 것이다. 정적 실행 경로와 배포 경로는 같은 파일을 사용하므로 두 구현을 따로 유지하지 않는다.

## 현재 구조

```text
index.html                         직접 실행 가능한 앱 진입점
styles.css                        앱 스타일
src/main.js                       xterm 초기화
src/world.js                      월드 런타임
src/terminal-ui.js                ANSI/TUI 렌더링
src/generated/world-data.js       브라우저 런타임 월드 데이터
src/generated/world.json          도구/검토용 월드 데이터
vendor/xterm/                     저장소에 고정한 xterm 브라우저 런타임
world-vault/                      Obsidian 기반 월드 저작 원본
dist/                             배포 산출물, commit하지 않음
```

브라우저 스크립트는 `index.html`에 적힌 순서대로 로드되고 각 파일은 자신의 전역 이름공간만 공개한다. npm의 bare import와 JSON module import를 런타임 경로에서 제거했기 때문에 `file://`에서도 실행된다.

`vendor/xterm/`은 직접 실행을 가능하게 하는 고정 런타임이다. 버전을 올릴 때는 npm 패키지의 JS, CSS, LICENSE를 함께 갱신한다.

## 개발 루프

앱 코드나 문서를 바꾼 경우 루트 `index.html`을 다시 열거나 새로고침한다. 기본 개발 명령과 상주 개발 서버는 두지 않는다.

`world-vault/rooms/**/*.md` 또는 월드 생성기를 바꾼 경우에만 다음 명령을 실행한다.

```sh
npm run build:world
```

이 명령은 같은 그래프를 두 형식으로 만든다.

```text
world-vault/rooms/**/*.md
  -> scripts/build-world.mjs
  -> src/generated/world.json
  -> src/generated/world-data.js
```

생성 시각처럼 실행할 때마다 달라지는 값은 넣지 않는다. 입력이 같으면 생성 파일도 같아야 한다.

HTTP 환경에서만 재현되는 동작을 확인해야 하거나 사용자가 명시적으로 요청한 경우에만 임시 서버를 사용한다. 그때도 새 서버를 띄우기 전에 기존 프로세스와 포트를 확인하고, 이미 적절한 서버가 있으면 재사용한다.

## 배포 빌드

```sh
npm run build
```

배포 빌드는 다음 작업만 한다.

1. vault를 검증하고 생성 데이터를 갱신한다.
2. 사용자에게 필요한 정적 파일만 `dist/`에 복사한다.
3. GitHub Pages용 `.nojekyll`을 만든다.

현재는 번들링이나 변환을 하지 않는다. 향후 의존성 수, 파일 수, 캐시 전략, 코드 분할 요구가 커지면 `scripts/build-site.mjs` 내부를 번들러 기반으로 교체할 수 있다. `npm run build`와 `dist/`라는 배포 계약은 그대로 유지한다.

## 검증 수준

변경 범위에 맞춰 가장 작은 검증부터 사용한다.

-   문서 변경: 별도 빌드 없음.
-   브라우저 JS 변경: 구문 검사와 직접 실행 확인.
-   월드 변경: `npm run build:world`와 생성 파일 diff 확인.
-   push/배포: `npm run build` 후 `dist/` 구성 확인.

개발 서버와 브라우저 자동화는 기본 검증 절차가 아니다. 실제 상호작용이나 viewport 회귀를 확인할 필요가 있을 때 선택적으로 사용한다.

## GitHub Pages

배포 대상은 다음 URL이다.

```text
https://meringue5.github.io/mustafa.world/
```

GitHub Pages source는 `GitHub Actions`로 유지한다. `main / root` branch deploy로 바꾸지 않는다. 배포 workflow는 `.github/workflows/deploy-pages.yml`이다.

```text
push to main
-> GitHub Actions
-> npm ci
-> npm run build
-> dist/ upload
-> GitHub Pages deploy
```

상대 경로만 사용하므로 루트의 직접 실행과 GitHub Pages 하위 경로(`/mustafa.world/`)가 같은 파일 구조로 동작한다.

## Push / Deploy Policy

`git push`는 원격 저장소 갱신이면서 GitHub Pages 배포 트리거다. 따라서 push는 단순 저장이나 백업이 아니라 배포 행위로 취급한다.

사용자가 해당 턴에서 명시적으로 요청하기 전에는 push하지 않는다.

다음 표현은 push 요청으로 해석하지 않는다.

-   문서에 적어두자
-   로컬에서 고치자
-   빌드해보자
-   확인해보자

다음처럼 명시된 경우에만 push한다.

-   push해줘
-   배포해줘
-   GitHub에 올려줘
-   원격에 반영해줘

## Commit 대상

commit한다:

-   소스 코드와 설계 문서
-   `world-vault/`의 저작 원본
-   `src/generated/world.json`
-   `src/generated/world-data.js`
-   `vendor/`의 브라우저 런타임과 라이선스
-   GitHub Actions workflow

commit하지 않는다:

-   `node_modules/`
-   `dist/`
-   `.DS_Store`
-   로컬 배포/작업 폴더인 `.publish/`
-   Obsidian 개인 workspace 상태

## 로컬 배포 작업 폴더

현재 작업 환경에서는 프로젝트 루트 자체가 git repository가 아닐 수 있다. 이 경우 GitHub에 push할 때 `.publish/mustafa.world/` 같은 임시 clone을 사용할 수 있다.

`.publish/`는 canonical source가 아니다. 루트 작업물을 원격에 반영하기 위한 로컬 작업 폴더이며 `.gitignore`에 포함한다.
