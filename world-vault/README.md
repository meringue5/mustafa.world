# Mustafa World Vault

Obsidian에서 열어 편집할 월드 제작용 vault다.

이 vault의 기본 단위는 장소 Markdown 파일이다.

-   장소 = 노드
-   `links` = 장소 간 연결 엣지
-   Obsidian `[[wikilink]]` = 사람이 검토하기 쉬운 보조 링크

초기 예시는 집(`home`)을 기준으로 만든다.

## 폴더

-   `_templates/`: Obsidian Templates 플러그인으로 삽입하는 실제 템플릿
-   `_references/`: 패턴, 규칙, 예시를 열어보고 참고하는 문서
-   `rooms/`: 장소 노드

Obsidian의 Templates folder location은 `_templates`로 설정한다.

`_references/link-patterns.md`는 템플릿으로 삽입하기보다, 링크를 작성할 때 참고하는 패턴 사전이다.

## 앱 반영

앱에서 사용하는 장소 데이터의 기준은 `rooms/**/*.md`다.

프로젝트 루트에서 다음 명령을 실행하면 vault가 앱용 JSON 그래프로 컴파일된다.

```sh
npm run build:world
```

출력:

```text
src/generated/world.json
```

앱의 현재 시작 위치는 `home.study`다.
