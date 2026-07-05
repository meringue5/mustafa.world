# Reference Research

이 문서는 Mustafa World를 설계할 때 참고할 만한 외부 프로젝트와 자료를 기록한다.

## Classic Interactive Fiction

### Inform

-   URL: https://github.com/ganelson/inform
-   성격: 자연어 문법으로 interactive fiction을 작성하는 대표적 시스템.
-   참고 포인트:
    -   world model
    -   command parser
    -   action/rule system
    -   웹 배포 템플릿

Inform repository 안의 `CommandParserKit`, `WorldModelKit` 같은 구성은 우리 프로젝트의 커맨드 컴포저, 장소/사물/행위자 모델을 볼 때 주요 참고 후보로 둔다.

### Inform 6

-   URL: https://github.com/DavidKinder/Inform6
-   성격: Z-machine story file을 생성하는 Inform 6 compiler.
-   참고 포인트:
    -   고전 parser-based IF의 컴파일러/라이브러리 경계
    -   object/world model을 VM 대상으로 내리는 방식
    -   verb grammar와 dictionary 구조

Inform 6 library 자체는 별도 프로젝트/배포로 관리된다. parser 구현을 깊게 볼 때는 Inform 6 compiler와 library를 함께 조사한다.

### Z-machine Standard

-   URL: https://inform-fiction.org/zmachine/standards/
-   성격: Infocom 계열 story file을 실행하는 VM 표준.
-   참고 포인트:
    -   object tree
    -   dictionary
    -   parser-oriented data layout
    -   save format과 metadata 표준

우리 프로젝트가 Z-machine을 구현할 필요는 없다. 다만 오래된 텍스트 어드벤처가 제한된 데이터 구조로 세계와 입력을 어떻게 표현했는지 보는 데 중요하다.

### ZILF

-   URL: https://github.com/taradinoc/zilf
-   성격: ZIL interactive fiction language용 compiler, assembler, disassembler, game library.
-   참고 포인트:
    -   Infocom식 ZIL 코드와 현대 오픈소스 도구의 연결
    -   sample game
    -   ZIL library

ZILF는 원 저장소의 GitHub mirror다. 상세 이슈와 개발 흐름은 upstream도 함께 확인한다.

### Zork I Source

-   URL: https://github.com/historicalsource/zork1
-   성격: Infocom `Zork I` 소스 코드 컬렉션.
-   참고 포인트:
    -   실제 고전 IF의 room/object/action 작성 방식
    -   ZIL로 된 오브젝트와 동사 처리 패턴
    -   parser가 읽기 좋은 데이터 설계

라이선스와 역사적 정확성은 별도로 주의한다. 구현을 베끼는 자료가 아니라 구조를 읽는 자료로 둔다.

### TADS

-   URL: https://www.tads.org/
-   성격: 1988년부터 이어진 text adventure development system.
-   참고 포인트:
    -   parser와 world model을 authoring library가 맡는 구조
    -   TADS 3의 커스터마이즈 가능한 parser 방향
    -   액션/객체/문법 authoring 사례

### IF Archive / IntFiction

-   IF Archive: https://ifarchive.org/
-   IntFiction forum: https://intfiction.org/
-   성격: interactive fiction 커뮤니티의 자료 보관소와 기술 논의 공간.
-   참고 포인트:
    -   parser 설계 논의
    -   authoring tool 비교
    -   옛 게임, 문서, 논문, 라이브러리 발굴

## MUD / MU* Clients and Engines

### DangunLand Client

-   URL: https://github.com/khunny7/dangunland
-   성격: 단군의땅 MUD 서버에 접속하기 위한 현대식 web/desktop MUD client.
-   참고 포인트:
    -   한국어 MUD 서버를 대상으로 한 EUC-KR encoding support
    -   React + Vite + xterm.js 기반 terminal UI
    -   web client에서는 Node.js WebSocket proxy로 telnet에 접속
    -   desktop client에서는 Electron으로 direct telnet 접속
    -   command history, macros, triggers, connection logging
    -   한국어/영어 internationalization

이 저장소는 MUD 서버 엔진 자체보다 클라이언트 구현 레퍼런스에 가깝다. Mustafa World가 브라우저 안에서 xterm.js 기반 TUI를 구현하고, 한국어 입력/출력과 터미널 감각을 다뤄야 한다는 점에서 결정적으로 중요하다. 특히 EUC-KR legacy server를 UTF-8 web UI로 다루는 방식, WebSocket proxy와 terminal frontend의 경계, macro/trigger 같은 전통적 MUD client affordance를 우선 조사 대상으로 둔다.

### VMud

-   URL: https://github.com/mpvmud/Vmud
-   성격: zMUD 경험을 현대적으로 재구성한 desktop MUD client.
-   참고 포인트:
    -   QPainter character grid 기반 pixel-perfect terminal rendering
    -   VT100 emulation, scroll regions, split-screen mode
    -   bundled CP437 font와 editable ANSI 16 color palette
    -   GMCP/MSDP, NAWS, TTYPE, CHARSET negotiation
    -   vitals, equipment, buffs, map 같은 GMCP-powered panels
    -   zMUD scripting, Lua scripting, triggers, aliases, keybindings
    -   GMCP mapper와 screen-scraping automapper

Mustafa World의 직접 기술 스택과는 거리가 있지만, 전통적 MUD client affordance의 밀도를 보는 데 좋다. 특히 터미널 글리프를 HTML 텍스트가 아니라 명시적 character grid로 다루는 관점, 16색 ANSI palette editor, vitals bar, automapper, trigger/alias 편집 UI는 장기 참고 대상으로 둔다.

### DikuMUD / CircleMUD 계열

-   DikuMUD URL: https://www.dikumud.com/
-   CircleMUD URL: https://www.circlemud.org/
-   성격: 1990년대 전투/RPG형 MUD codebase의 대표 계열.
-   참고 포인트:
    -   room, mobile, object, zone 중심 데이터 구조
    -   server tick, reset, respawn, combat loop
    -   builder가 다루는 area/zone 파일 형식
    -   stock world와 custom world의 분리

CircleMUD는 DikuMUD Gamma 0.0의 derivative로 시작했고, 원본의 look and feel을 유지하면서 확장성과 이해 가능성을 높인 codebase다. 우리 프로젝트가 Diku식 전투 MUD를 만들지는 않지만, 장소/사물/행위자 데이터를 런타임이 어떻게 들고 있고 주기적으로 세계를 갱신하는지 볼 때 유용하다.

### Merc / ROM / SMAUG 계열

-   자료 위치: https://www.mudbytes.net/files/
-   성격: DikuMUD에서 파생된 1990년대 인기 codebase 계열.
-   참고 포인트:
    -   Diku 계열이 실제 커뮤니티에서 어떻게 변형되었는지
    -   area file, mob program, online creation 같은 builder affordance
    -   class/race/skill/spell처럼 게임 규칙이 데이터와 결합되는 방식

이 계열은 역사적으로 넓게 퍼졌지만, 원천 저장소와 라이선스가 혼재되어 있다. 구현을 가져오기보다 MUDBytes 같은 아카이브에서 데이터 형식과 builder workflow를 읽는 자료로 둔다.

### LPMud / MudOS / FluffOS 계열

-   FluffOS URL: https://github.com/fluffos/fluffos
-   성격: LPC driver와 mudlib을 분리하는 LPMud 계열의 현대적 후속 엔진.
-   참고 포인트:
    -   driver, language, mudlib의 계층 분리
    -   room, item, NPC, command parser를 mudlib 객체로 정의하는 방식
    -   running world의 hot reload와 event/timer 처리
    -   세계 모델을 코드/데이터 파일 트리로 확장하는 방식

Mustafa World의 vault -> generated world -> runtime 구상과 가장 직접적으로 맞닿는 계열이다. Obsidian vault가 mudlib처럼 작동할 수 있는지, 또는 vault를 별도 컴파일 산출물로 내릴지 판단할 때 우선 참고한다.

### LambdaMOO / ToastStunt 계열

-   LambdaMOO URL: http://lambda.moo.mud.org/
-   ToastStunt URL: https://github.com/lisdude/toaststunt
-   성격: 객체 지향, 사용자 확장 가능 세계를 중시하는 MOO/MU* 계열.
-   참고 포인트:
    -   world database 안의 object, property, verb 모델
    -   사용자가 직접 방과 사물을 만들고 수정하는 authoring affordance
    -   social interaction, emote, say, page 같은 커뮤니케이션 명령
    -   live world editing과 permission 모델

이 계열은 “세계가 파일이 아니라 살아 있는 객체 데이터베이스”라는 관점이 강하다. 개인 월드 모델을 장기적으로 온톨로지/객체 그래프로 키울 때 좋은 비교 대상이다.

### CoffeeMUD

-   URL: https://www.coffeemud.org/
-   GitHub: https://github.com/bozimmerman/CoffeeMud
-   성격: Java 기반의 성숙한 full-featured MUD engine.
-   참고 포인트:
    -   OLC, web server, mail server, protocol support 같은 통합형 서버 구조
    -   builder guide, scripting guide, protocol guide 등 문서화된 운영/제작 workflow
    -   현대 코드베이스가 고전 MUD 관습을 어떻게 포장하는지

CoffeeMUD는 “전부 들어 있는” 엔진에 가깝다. 우리 프로젝트가 이만큼 거대해질 필요는 없지만, 장기적으로 editor, protocol, scripting, admin 기능이 어떤 식으로 쌓이는지 보는 데 좋다.

### Evennia

-   URL: https://www.evennia.com/
-   GitHub: https://github.com/evennia/evennia
-   성격: Python 기반의 현대 MUD/MU* development system.
-   참고 포인트:
    -   room, exit, character, object 같은 기본 persistent object 모델
    -   web client와 전통적 MUD client를 함께 지원하는 구조
    -   command availability가 game state에 따라 달라지는 방식
    -   prototype, lock/access mini-language, timer/ticker 같은 현대적 도구

Evennia는 고전 엔진은 아니지만, 고전 MUD 개념을 현대 개발 환경으로 재구성한 비교 대상으로 둔다. 우리가 브라우저/xterm 기반 단일 사용자 월드에서 출발하더라도, 나중에 지속성/권한/이벤트 구조를 설계할 때 참고 가치가 크다.

## Adventure Restoration / Runtime Projects

### ScummVM

-   URL: https://github.com/scummvm/scummvm
-   성격: 고전 point-and-click adventure, text adventure, RPG를 원본 데이터 파일로 실행하는 VM/engine 모음.
-   참고 포인트:
    -   여러 게임 엔진을 통합하는 추상화
    -   원본 데이터 파일과 런타임 코드의 분리
    -   복각 프로젝트의 호환성 관리

Mustafa World는 SCUMM식 포인트앤클릭은 아니지만, “원본 데이터와 실행기를 분리한다”는 관점은 vault -> generated world -> runtime 구조와 맞닿아 있다.

### Parchment

-   URL: https://github.com/curiousdannii/parchment
-   성격: 웹에서 interactive fiction story file을 실행하는 player.
-   참고 포인트:
    -   웹 기반 IF 플레이어 UI
    -   Z-code, Glulx, TADS 등 여러 story format 대응
    -   Inform의 웹 배포 템플릿과 연결

## 우리 프로젝트에 적용할 관찰

-   고전 IF는 이미 `verb + object + indirect object` 구조를 오래 다뤄왔다.
-   사물과 행위자는 단순 문자열이 아니라 world model의 엔티티다.
-   parser는 텍스트 추측기가 아니라 dictionary, grammar, scope, affordance를 조합한다.
-   후보 UI는 parser의 내부 슬롯 상태를 사용해야 한다.
-   숨겨진 affordance는 드러내지 않고, visible/scope 안의 엔티티만 후보에 올린다.
-   MUD 엔진은 지속 세계를 room/item/actor/action/event 단위로 관리하는 방식을 보여준다.
-   LPMud/MOO 계열은 editor와 runtime의 경계를 설계할 때 특히 중요하다.
-   DangunLand client는 한국어 MUD, xterm.js, web/desktop client, legacy encoding, macro/trigger affordance를 함께 볼 수 있는 직접 레퍼런스다.
-   VMud는 zMUD 계승형 desktop client로, terminal rendering, protocol panels, automapper, trigger/alias scripting의 높은 밀도를 보는 주변 레퍼런스다.
