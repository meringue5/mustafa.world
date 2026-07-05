---
id: home.study
type: room
name: 서재
area: home
tags: [home, indoor, work, books]

objects:
  - id: desk
    name: 책상
    aliases: [책상]
  - id: laptop
    name: 노트북
    aliases: [노트북, 컴퓨터]
  - id: bookshelf
    name: 책장
    aliases: [책장]
    tags: [furniture, container]
  - id: book
    name: 책
    aliases: [책, 읽다 만 책]
    tags: [readable]

actors:
  - id: noa
    name: 노아
    aliases: [노아]
    description: 노아가 책상 위에 드러누워 있다.
    ambient:
      - 노아가 자기 발바닥을 핥는다.
      - 노아가 당신을 빤히 본다.
      - 노아가 사냥 놀이 자세를 취한다.

links:
  - to: home.living
    label: 거실
    type: doorway
    aliases: [거실]
    bidirectional: true
  - to: home.study_veranda
    label: 서재 베란다
    type: threshold
    aliases: [서재 베란다, 베란다]
    bidirectional: true
---

# 서재

## 설명

읽고 쓰고 생각을 펼치는 장소다. 책상 위에는 노트북이 열려 있고, 책장에는 아직 읽다 만 책들이 꽂혀 있다.

## 감각

책, 화면, 미뤄둔 문장.

## 연결

- [[living|거실]]
- [[study-veranda|서재 베란다]]

## 메모

프로젝트, 문서, 개발 작업과 연결될 수 있다.
