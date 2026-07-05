# World Design

이 문서는 그래프 기반 월드 모델과 맵 제작 파이프라인 결정을 담는다.

현재 세부 설계의 상당 부분은 아직 `../DESIGN.md`에 남아 있다.

중요한 현재 결정:

-   장소는 그래프 노드다.
-   링크는 동서남북 방향이 아니라 의미적 엣지다.
-   Obsidian 스타일 Markdown 파일을 `world-vault/`에서 작성한다.
-   런타임은 `src/generated/world.json`에 컴파일된 JSON을 사용한다.
-   온톨로지도 우선 `world-vault/` 안에서 작성한다. 자세한 방침은 [Ontology Design](ontology.md)의 `Obsidian-First 방침`을 따른다.
