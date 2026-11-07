// [phase1/main.js] Phase 1 페이지 시작점 — 실제/테스트 영역 렌더링, Patch·뒤로가기·앞으로가기 버튼 동작

import { domToVdom, createElement } from "../core/vdom.js";
import { diff } from "../core/diff.js";
import { patch } from "../core/patch.js";
import { push, undo, redo } from "./history.js";

const realArea = document.getElementById("real-area");
const testInput = document.getElementById("test-input");
const patchLog = document.getElementById("patch-log");

// 처음 화면. 속성 추가/삭제, 자식 개수 변화, input value 같은 경우를 바로 시험해 볼 수 있게 골랐다
const INITIAL_HTML = `<h3 class="title">할 일 목록</h3>
<ul id="todo">
  <li>Virtual DOM 만들기</li>
  <li>Diff 구현</li>
</ul>
<p style="color: gray;">총 <b>2</b>개</p>
<input value="입력값" />
<label><input type="checkbox" checked /> 완료</label>`;

/**
 * HTML 문자열 → VDOM
 * 여러 최상위 태그를 쓸 수 있도록 <div> 하나로 감싸서 읽는다. 그래서 실제 영역의 루트는 항상 이 <div>다.
 * (실제 영역에 그려지는 내용이므로 사용자가 쓴 HTML의 onerror 같은 속성도 실행될 수 있다. 자기 화면에서만 쓰는 도구라 허용)
 */
function htmlToVdom(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  return domToVdom(wrapper);
}

/**
 * 실제 영역을 target VDOM 모양으로 바꾼다 (Patch / 뒤로가기 / 앞으로가기 공통)
 *
 * 이전 VDOM은 기록이 아니라 "지금 실제 영역 화면"을 domToVdom으로 읽어서 쓴다.
 * 사용자가 실제 영역의 input에 입력하거나 체크박스를 눌렀으면 그 상태가 이전 VDOM에 들어가서,
 * diff가 그 차이까지 찾아 target 상태로 되돌린다. (기록의 VDOM을 쓰면 이 차이를 못 본다)
 * Phase 1 HTML에는 onClick 같은 함수 prop이 없어서 화면에서 읽어도 빠지는 정보가 없다.
 */
function render(target) {
  const patches = diff(domToVdom(realArea.firstChild), target);
  patch(realArea, patches);
  patchLog.textContent = patches === null ? "변경 없음 (null)" : JSON.stringify(patches, null, 2);
  return patches;
}

// 처음 그리기: 컨테이너를 비우고 루트 하나만 붙인다.
// patch는 container.firstChild를 루트로 보므로, 줄바꿈 공백 같은 다른 노드가 앞에 있으면 안 된다.
// current = 지금 실제 영역이 보여 주기로 한 기록. 새 기록을 남길지 판단할 때 쓴다
let current = { vdom: htmlToVdom(INITIAL_HTML), html: INITIAL_HTML };
realArea.replaceChildren(createElement(current.vdom));
testInput.value = INITIAL_HTML;
push(current);

document.getElementById("patch-btn").addEventListener("click", () => {
  const html = testInput.value;
  const vdom = htmlToVdom(html);
  render(vdom);
  // 직전 기록과 VDOM이 같으면 기록을 남기지 않는다 (뒤로가기를 눌렀는데 화면이 그대로인 칸이 생기지 않게).
  // render의 diff 결과로 판단하지 않는 이유: 사용자가 실제 영역 input만 바꿨을 때도 diff 결과가 생기기 때문이다
  if (diff(current.vdom, vdom) !== null) {
    current = { vdom, html };
    push(current);
  }
});

// 뒤로/앞으로: 실제 영역은 patch로, 테스트 영역은 그 시점에 사용자가 쓴 HTML 원문으로 되돌린다
function restore(snapshot) {
  if (snapshot === null) return; // 더 갈 기록이 없음
  current = snapshot;
  render(snapshot.vdom);
  testInput.value = snapshot.html;
}
document.getElementById("undo-btn").addEventListener("click", () => restore(undo()));
document.getElementById("redo-btn").addEventListener("click", () => restore(redo()));
