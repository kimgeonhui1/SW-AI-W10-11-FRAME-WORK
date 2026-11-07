// [patch.js] Diff 결과(변경 목록)를 실제 DOM에 반영

import { createElement, setProp, removeProp } from "./vdom.js";

/**
 * ■ patch : diff가 만든 패치 트리를 실제 DOM에 적용한다
 *
 * @param container 루트 노드를 담고 있는 부모 요소. 루트 = container.childNodes[0]
 * @param patches   diff(oldVNode, newVNode)의 결과 (null이면 아무것도 안 함)
 *
 * 사용 예)
 *   container.appendChild(createElement(oldVNode));   // 처음 한 번 그리기
 *   patch(container, diff(oldVNode, newVNode));        // 이후엔 바뀐 곳만 고치기
 *
 * ⚠️ "VDOM 자식 i번째 = 실제 DOM 자식 i번째"를 전제로 한다.
 *    실제 DOM을 domToVdom으로 읽었다면 createElement 결과로 한 번 교체해 둘의 모양을 맞춰야 한다 (vdom.js 참고).
 */
export function patch(container, patches) {
  applyPatch(container, patches, container.firstChild);
}

// 실제 DOM 노드(node)에 패치 하나를 적용하고, UPDATE면 자식들로 재귀한다. (CREATE일 때 node는 없음)
function applyPatch(parent, p, node) {
  if (p === null) return;

  switch (p.type) {
    case "CREATE":
      // diff는 늘어난 자식을 "끝에만" CREATE로 만들고, 아래에서 앞→뒤 순서로 적용하므로 맨 끝에 붙이면 순서가 맞다
      parent.appendChild(createElement(p.node));
      return;
    case "REMOVE":
      parent.removeChild(node);
      return;
    case "REPLACE":
      parent.replaceChild(createElement(p.node), node);
      return;
    case "TEXT":
      // 텍스트 노드는 지우고 다시 만들 필요 없이 글자만 바꾸면 된다
      node.nodeValue = p.text;
      return;
    case "UPDATE":
      // 자식을 "먼저" 고치고 속성은 나중에 바꾼다. (createElement와 같은 순서)
      // <select>의 value는 그 값의 <option>이 이미 있어야 적용되고,
      // 자식 option의 selected 제거가 나중에 실행되면 방금 고른 값이 다시 풀리기 때문이다.
      {
        // 패치를 적용하기 "전에" 자식 노드 목록을 복사해 둔다.
        // childNodes는 살아 있는 목록이라 REMOVE로 하나 지우면 뒤 자식들의 인덱스가 당겨져 엉뚱한 노드를 고치게 된다.
        // 미리 잡아 둔 노드 참조로 작업하면 인덱스 변화와 상관없이 항상 원래 i번째 노드를 가리킨다.
        const childNodes = [...node.childNodes];
        p.children.forEach((childPatch, i) => applyPatch(node, childPatch, childNodes[i]));
      }
      for (const { name, value, oldValue } of p.props) {
        if (value === undefined) removeProp(node, name, oldValue);
        else setProp(node, name, value, oldValue);
      }
      return;
  }
}
