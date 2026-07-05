# Ontology Design

이 문서는 가벼운 온톨로지와 관계 규칙을 담는다.

온톨로지는 LLM이 아니다. 태그, 관계, 행동 스키마를 사람이 검토 가능한 형태로 기록해 커맨드 컴포저가 가능한 행동을 도출하게 하는 장치다.

## Obsidian-First 방침

초기 온톨로지는 별도 전문 온톨로지 툴이 아니라 현재의 Obsidian vault 안에서 작성한다.

이유:

-   장소, 행위자, 사물, 관계를 같은 저작 환경에서 함께 볼 수 있다.
-   Markdown과 YAML frontmatter는 사람이 읽고 고치기 쉽다.
-   Obsidian Graph View와 링크는 개발 중 시각적 검토에 충분히 유용하다.
-   우리 앱은 이미 `world-vault/`를 source of truth로 삼고 있으므로, 온톨로지도 같은 파이프라인에서 컴파일할 수 있다.

초기 구조 후보:

```text
world-vault/
  rooms/
  actors/
  items/
  ontology/
    classes.yaml
    relations.yaml
    actions.yaml
    affordances.yaml
```

`world-vault/ontology/`는 세계의 개별 사실과 규칙을 담는다. 앱 런타임은 이 파일들을 직접 읽지 않고, 빌드 단계에서 JSON으로 컴파일된 결과를 사용한다.

```text
world-vault/**/*.md
world-vault/ontology/**/*.yaml
  -> scripts/build-world.mjs
  -> src/generated/world.json
```

정통 온톨로지 도구는 당장 도입하지 않는다. Protégé, RDF, OWL, SPARQL/Fuseki 같은 도구는 다음 조건이 생기면 검토한다.

-   사람이 YAML로 관계를 추적하기 어려울 만큼 스키마가 커진다.
-   자동 추론이나 일관성 검사가 필요해진다.
-   외부 지식 그래프나 표준 vocab과 연동해야 한다.
-   관계 질의가 앱 로직보다 별도 쿼리 계층을 요구한다.

따라서 현재 결정은 `Obsidian-first, export-later`다.

Obsidian vault가 저작 원본이고, RDF/OWL 계열은 필요해질 때 내보내기/검증/상호운용 레이어로 붙인다.

## 열린 저작 세계와 닫힌 추천 세계

월드 저작은 열린 세계처럼 다룬다. 아직 기록되지 않은 사물, 관계, 행동이 나중에 추가될 수 있다.

반면 런타임 후보 추천은 닫힌 세계처럼 동작해야 한다. 사용자가 아직 볼 수 없거나, 알 수 없거나, 발견하지 못한 affordance는 후보에 노출하지 않는다.

이 분리를 유지해야 한다.

-   저작 단계: 계속 확장되는 open world
-   플레이 단계: 현재 관찰/소유/학습한 것만 추천하는 local closed world

이 원칙은 힌트 누출을 막고, 커맨드 컴포저가 플레이어 대신 세계를 추측하지 않게 한다.

가능한 사실:

```text
actor(노아)
item(츄르)
tag(노아, touchable)
tag(츄르, giftable)
likes(노아, 츄르)
has(player, 츄르)
```

도출 가능한 affordance:

```text
노아 -> 쓰다듬어
노아 + 츄르 -> 츄르를 줘
츄르 -> 줘 / 살펴봐
```

이 문서는 파서 분기문으로 흩어지기 쉬운 규칙들의 집이 되어야 한다.
