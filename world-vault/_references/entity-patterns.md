# Entity Patterns

장소 안의 `objects`와 `actors`는 앱의 후보 추천과 하이라이트 기준이다.

## 핵심 규칙

-   사용자가 입력할 수 있어야 하는 명사는 명시적 엔티티로 둔다.
-   `aliases`는 같은 대상을 부르는 다른 이름이다.
-   포함물, 부품, 위에 놓인 물건은 alias가 아니라 별도 엔티티다.

## 좋은 예

```yaml
objects:
  - id: bookshelf
    name: 책장
    aliases: [책장]
    tags: [furniture, container]
  - id: book
    name: 책
    aliases: [책, 읽다 만 책]
    tags: [readable]
```

이 경우 `책장`과 `책`은 각각 다른 컨텍스트를 가진다.

## 나쁜 예

```yaml
objects:
  - id: bookshelf
    name: 책장
    aliases: [책장, 책]
```

이렇게 쓰면 사용자가 `책`을 입력했을 때 `책장` 컨텍스트가 활성화된다.

## 행위자 예

```yaml
actors:
  - id: noa
    name: 노아
    aliases: [노아]
    tags: [animate, touchable]
    description: 노아가 책상 위에 드러누워 있다.
    ambient:
      - 노아가 자기 발바닥을 핥는다.
      - 노아가 당신을 빤히 본다.
```

행위자는 방 설명에 섞지 않고 별도 존재 라인으로 출력한다.
