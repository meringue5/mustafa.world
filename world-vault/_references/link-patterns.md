# Link Patterns Reference

장소 간 연결은 방향이 아니라 경험적 링크로 표현한다.

## 문 / 통로

```yaml
links:
  - to: home.living
    label: 거실
    type: doorway
    aliases: [거실]
    bidirectional: true
```

## 베란다

```yaml
links:
  - to: home.living_veranda
    label: 거실 베란다
    type: threshold
    aliases: [거실 베란다, 베란다]
    bidirectional: true
```

## 셔틀 / 포탈형 이동

```yaml
links:
  - to: company.office
    label: 회사
    type: shuttle
    aliases: [회사, 출근, 셔틀]
    oneWay: true
    visibleWhen:
      - knows.company_shuttle
    enabledWhen:
      - time.weekday_morning
    blockedText: 지금은 셔틀이 다니지 않는다.
    arrivalText: 눈을 뜨니 회사 로비다.
```
