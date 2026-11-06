// [vdom.js] Virtual DOM 생성 및 변환 (실제 DOM ↔ Virtual DOM)

/**
 * [팀 공통] Virtual DOM 노드 형식
 * 요소: { type: "div", props: { id: "box" }, children: [VNode, ...] }
 * 텍스트: "문자열"
 */

// Virtual DOM 생성 헬퍼
export function h(type, props = {}, ...children) {
  throw new Error("TODO");
}

// 실제 DOM → Virtual DOM
export function domToVdom(node) {
  throw new Error("TODO");
}

// Virtual DOM → 실제 DOM
export function createElement(vnode) {
  throw new Error("TODO");
}
