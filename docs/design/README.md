# Design Index

이 디렉터리는 Mustafa World의 모듈형 설계 문서 홈이다.

`../DESIGN.md`는 초기 종합 설계 로그로 남긴다. 새 설계는 점진적으로 이 디렉터리 아래의 도메인별 문서로 옮긴다.

## 모듈

-   [UI](ui.md): xterm 레이아웃, 폰트, ANSI 팔레트, 입력 패널, 한글 입력 경계.
-   [Command Composer](command-composer.md): 파서, 동사 시그니처, 슬롯 채우기, 추천 정책.
-   [World](world.md): 그래프 모델, vault 파이프라인, 맵 확장.
-   [Location](location.md): 장소/방 스키마, 링크, 설명, 출구.
-   [Actor](actor.md): 행위자, 존재 라인, 이동, 행동, 관계.
-   [Item](item.md): 사물, 아이템, affordance, 인벤토리 관련 설계.
-   [Ontology](ontology.md): 태그, 관계, affordance 규칙, 향후 스키마 아이디어.

## 마이그레이션 규칙

같은 결정을 긴 형태로 두 문서에 중복 유지하지 않는다.

기존 `../DESIGN.md`의 한 섹션을 이쪽으로 옮길 때는, 기존 문서에는 짧은 요약과 새 문서 링크만 남긴다.
