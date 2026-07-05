---
id: home.kitchen
type: room
name: 주방
area: home
tags: [home, indoor, food]

objects:
  - sink
  - fridge
  - stove

links:
  - to: home.living
    label: 거실
    type: opening
    aliases: [거실]
    bidirectional: true
  - to: home.kitchen_veranda
    label: 주방 베란다
    type: threshold
    aliases: [주방 베란다, 베란다]
    bidirectional: true
---

# 주방

## 설명

물, 불, 냉장고가 모여 있는 실용적인 장소다.

## 감각

아침의 물소리와 밤의 냉장고 소리.

## 연결

- [[living|거실]]
- [[kitchen-veranda|주방 베란다]]

## 메모

식사, 물, 쓰레기, 루틴과 연결될 수 있다.
