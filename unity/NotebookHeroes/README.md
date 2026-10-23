# 낙서 용사단 — Unity 이식 프로토타입

기존 HTML 게임을 바탕으로 C#과 Unity UI로 새로 구성한 **Unity 프로젝트**입니다. 브라우저를 감싼 실행 파일이 아닙니다. 이 ZIP에는 완성된 EXE가 들어 있지 않습니다.

## 열고 플레이하기

1. Unity Hub에서 **Unity 6.0 LTS**와 **Windows Build Support (Mono)**를 설치합니다. 프로젝트 기준 버전은 `6000.0.23f1`이며 설치된 최신 6.0 LTS 패치로 열어도 됩니다. 다른 LTS 계열로 업그레이드할 경우 에디터에서 재검증하세요.
2. ZIP을 압축 해제합니다. Unity Hub → **Add / Add project from disk** → `Assets`, `Packages`, `ProjectSettings`가 들어 있는 **NotebookHeroes** 폴더를 고릅니다.
3. 첫 실행에는 패키지와 리소스를 가져옵니다. 상단 메뉴 **Notebook Heroes → 1. Create or open game scene**을 누릅니다.
4. **Play ▶**를 누르고 `게임 시작`을 선택합니다. Game 뷰는 **16:10 또는 1600×1000**을 권장합니다. 다른 화면에서는 비율을 유지해 맞춥니다.
5. 도감은 원래 웹 버전처럼 **한 장의 스프링 공책을 네 칸으로 나눈 화면**입니다. 마우스 휠·드래그·오른쪽 스크롤바로 아래 칸을 봅니다. 선택 시 스크롤 위치와 위쪽 4인 파티 표시가 유지됩니다.
6. 이야기 네 장면 → 용사 네 명 → 포스트잇 친구 한 명 → 전투 순으로 진행합니다. 적 이름 카드를 눌러 공격 대상을 고릅니다.

## 이전 프로젝트에서 그림이 잘리던 문제

원본 PNG는 1536×1024 등의 크기입니다. 이전 버전에는 비정규 크기 이미지를 2의 거듭제곱으로 바꾸는 Unity 임포트 옵션이 남아 있어, 원본 기준 자르기 좌표와 실제 텍스처가 달라질 수 있었습니다.

이번 버전은 **Non Power of 2 = None**으로 원본 크기를 보존하고, 기존에 크기가 달라진 텍스처도 원본 크기에 비례해 좌표를 보정합니다. 창술사 그림의 옆 캐릭터 영역도 웹 버전과 같은 모양으로 제외합니다. 스프링과 선택 동그라미는 폰트 기호가 아니라 선으로 그리며, 스크롤 밖 그림은 셰이더에서 잘라냅니다.

새 ZIP을 **새 폴더**에 풀어 여는 것을 권장합니다. 기존 프로젝트에 파일을 덮어썼다면 **Notebook Heroes → 3. Reimport original-size artwork**를 한 번 실행하세요. 기존 `ProjectSettings`, `Assets`의 수정본을 보관하고 업데이트하세요.

## Windows EXE 빌드

**Notebook Heroes → 2. Build Windows demo**를 누르면 `Builds/Windows/NotebookHeroes.exe`와 데이터 폴더가 생성됩니다. 빌드 로그는 Unity Console에서 확인합니다. Windows Build Support 모듈이 필요합니다.

배포할 때는 **Windows 폴더 전체**를 압축하세요. EXE만 보내면 실행되지 않습니다. 프로젝트 파일의 ZIP과 실행 게임의 ZIP은 다릅니다.

## 구현 범위

- 공책 메인 화면, 4장면 이야기, 공책 도감에서 10개 직업 중 4명 선택
- 기존 그림·한글 손글씨 폰트·흑연 UI 셰이더 사용
- 30개 스킬: 단일·광역 피해, 회복, 흡수, 보호, 별여우 지원
- 포스트잇 친구 5종 선택 및 전투당 한 번 소환
- 일반 → 에픽 → 보스 자동 진행과 전투 사이 HP·MP 회복
- 보스 2·5·8…라운드 테이프 봉인, 방어/보호로 차단
- 기본 준비 동작·돌진·타격선·회복 표시·연필 등장·지우개 퇴장 연출
- 파일 저장·이어하기, 임시 파일을 통한 교체와 이전 저장 백업
- 새 모험의 저장 덮어쓰기 확인, 전멸/클리어 후 재도전

이식의 첫 기반입니다. 웹 버전의 모든 프레임별 연출을 동일하게 재현한 것은 아닙니다. 이야기 화면은 수동으로 넘기고, 효과음·세밀한 직업별 VFX·관절 애니메이션은 아직 이식하지 않았습니다. Steam SDK, 업적, Steam Cloud, 컨트롤러 대응 및 스팀 출시 심사는 포함하지 않았습니다.

## 저장과 데이터

- 저장 파일: `Application.persistentDataPath/notebook-save.json`
- Windows 기본 위치: `%USERPROFILE%/AppData/LocalLow/NotebookStudio/Notebook Heroes/`
- 직전 저장 백업: `notebook-save.json.bak`. 기본 파일이 손상되면 백업을 시도합니다.
- 동료 선택·소환 사용 여부·테이프·HP/MP·구간·라운드를 저장합니다.
- **HTML 버전의 브라우저 저장은 자동으로 옮겨오지 않습니다.** Unity에서 새 모험을 시작하세요.
- 밸런스: `Assets/Resources/GameData.json`. 이 프로젝트에서는 ScriptableObject 대신 JSON을 사용합니다.
- 전투 규칙: `Assets/Scripts/Combat.cs` — Unity에 의존하지 않는 C# 코드
- 화면/연출: `NotebookGame.cs`, 저장: `SaveStore.cs`, 그림: `PaperArt.cs`
- 화면은 런타임에 Canvas 아래에 생성됩니다. Play 중 계층 구조를 확인할 수 있으며, 정지하면 코드에서 다시 생성합니다. 편집 가능한 개별 화면 프리팹으로 분리하는 작업은 후속 단계입니다.

## 검증 상태

- .NET 8에서 C# 전투 코드 컴파일·실행 완료. 원본/리사이즈 텍스처의 자르기 계산 18개와 마법사 영역 회귀 테스트도 통과했습니다.
- 기존 JavaScript 게임과 **80개 시나리오, 4,034번의 행동/전환 결과** 비교: HP·MP·대상·턴·봉인·소환·승패 상태 모두 일치.
- 런타임 C# 파일은 Unity 2021 엔진/UI 참조 어셈블리와 호환성 컴파일을 추가로 확인했습니다(검사용 복사본에서 오브젝트 검색 API만 구버전 이름으로 변경). Unity 6 에디터 실행 검증을 대신하지 않습니다.
- **제작 환경에 Unity 에디터가 없어 실제 에디터 Play, 셰이더 렌더링, Windows 빌드는 미실행입니다.** 첫 실행 시 Console 오류와 화면 배치를 확인해야 합니다.
- Unity에서 `Window → General → Test Runner → EditMode → Run All`로 동봉한 11개 테스트를 실행할 수 있습니다. 이 EditMode 테스트 자체는 아직 Unity에서 실행하지 않았습니다.

## 리소스

기존 데모의 낙서 이미지와 새로 그린 포스트잇 동료를 포함합니다. 한글 폰트는 Gaegu Regular, SIL Open Font License 1.1이며 `Assets/Resources/Art/Gaegu-OFL.txt`를 동봉했습니다. 실제 판매 전에는 사용 리소스의 출처와 권리를 최종 확인하세요.
