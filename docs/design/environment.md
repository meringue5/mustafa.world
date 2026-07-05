# Environment Design

이 문서는 개발, 빌드, 배포 환경의 약속을 기록한다. 게임/UI/월드 설계와 달리, 여기의 내용은 프로젝트를 어떻게 실행하고 GitHub Pages에 올리는지에 관한 것이다.

## 현재 구조

Mustafa World는 Vite 기반 브라우저 앱이다.

```text
index.html                  Vite entry/template
src/main.js                 브라우저 앱 진입점
src/world.js                xterm 월드 런타임
world-vault/                Obsidian 기반 월드 저작 원본
src/generated/world.json    런타임이 읽는 월드 데이터
dist/                       빌드 산출물, commit하지 않음
```

루트의 `index.html`은 GitHub Pages가 직접 서빙하는 사용자용 HTML이 아니다. Vite가 개발 서버와 프로덕션 빌드에서 읽는 entry/template이다.

GitHub Pages에 실제로 올라가는 파일은 GitHub Actions가 `npm run build`로 만든 `dist/index.html`이다.

```text
루트 index.html      소스: 필요함
dist/index.html      산출물: 자동 생성, commit하지 않음
```

따라서 루트 `index.html`은 유지한다. 삭제하면 `vite build`가 깨진다.

## 빌드

개발 서버와 프로덕션 빌드는 먼저 월드 데이터를 생성한다.

```sh
npm run build:world
npm run build
```

`npm run build:world`는 `world-vault/rooms/**/*.md`를 읽어서 `src/generated/world.json`을 만든다.

`npm run build`는 Vite가 `index.html`을 entry로 삼아 `dist/`를 만든다.

## GitHub Pages

배포 대상은 다음 URL이다.

```text
https://meringue5.github.io/mustafa.world/
```

GitHub Pages source는 `GitHub Actions`로 설정한다. `main / root` branch deploy로 바꾸지 않는다. branch deploy는 루트 `index.html`을 그대로 서빙하므로 Vite 번들 경로가 깨질 수 있다.

배포 workflow는 `.github/workflows/deploy-pages.yml`이다.

흐름:

```text
push to main
-> GitHub Actions
-> npm ci
-> npm run build
-> dist/ upload
-> GitHub Pages deploy
```

`vite.config.js`의 `base: "./"`는 GitHub Pages의 하위 경로(`/mustafa.world/`)에서도 asset 경로가 깨지지 않게 하기 위한 설정이다.

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

-   소스 코드
-   설계 문서
-   `world-vault/`의 저작 원본
-   `src/generated/world.json`
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
