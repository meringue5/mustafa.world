---
id: home.living
type: room
name: 거실
area: home
tags: [home, indoor, hub]

objects:
  - sofa
  - table
  - tv

links:
  - to: home.entryway
    label: 현관
    type: doorway
    aliases: [현관, 밖]
    bidirectional: true
  - to: home.bedroom
    label: 침실
    type: doorway
    aliases: [침실]
    bidirectional: true
  - to: home.kitchen
    label: 주방
    type: opening
    aliases: [주방, 부엌]
    bidirectional: true
  - to: home.small_room
    label: 작은방
    type: doorway
    aliases: [작은방]
    bidirectional: true
  - to: home.study
    label: 서재
    type: doorway
    aliases: [서재]
    bidirectional: true
  - to: home.living_veranda
    label: 거실 베란다
    type: threshold
    aliases: [거실 베란다, 베란다]
    bidirectional: true
---

# 거실

## 설명

집 안의 허브다.

## 감각

사람이 지나간 자국이 가장 많이 남는 방. 다른 방들이 여기에서 갈라진다.

## 연결

- [[entryway|현관]]
- [[bedroom|침실]]
- [[kitchen|주방]]
- [[small-room|작은방]]
- [[study|서재]]
- [[living-veranda|거실 베란다]]

## 메모

초기 홈 맵의 중심 노드.
