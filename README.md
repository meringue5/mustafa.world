# Mustafa World

웹에서 실행되는 xterm.js 기반 TUI/MUD 프로토타입이다.

## 접속

- GitHub Pages: https://meringue5.github.io/mustafa.world/

## 실행

루트 `index.html`을 브라우저에서 직접 연다. 소스 변경을 확인하는 데 설치, 빌드, 개발 서버가 필요하지 않다.

월드 원본을 바꿨다면 생성 데이터를 갱신한다.

```sh
npm run build:world
```

배포 전 정적 산출물은 다음 명령으로 검증한다.

```sh
npm run build
```

## 기본 입력

- `둘러봐`
- `<장소>`
- `가 `
- `<장소>로 가`
- `상태`
- `기다려`
- `도움`

입력 후보는 확정된 입력이 공백으로 끝나는 단어 경계에서 열린다.
후보 선택은 `←`, `→`로 이동하고 `Tab` 또는 `Enter`로 확정한다.

이전 장식형 웹 UI는 `archive/prototype-01-sugar-terminal`에 보관되어 있다.
