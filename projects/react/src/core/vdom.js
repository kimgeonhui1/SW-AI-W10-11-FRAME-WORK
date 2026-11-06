// [vdom.js] Virtual DOM 생성 및 변환 (실제 DOM ↔ Virtual DOM)

/**
 * [팀 공통] Virtual DOM 노드 형식
 * 요소: { type: "div", props: { id: "box" }, children: [VNode, ...] }
 * 텍스트: "문자열"
 */

// Virtual DOM 생성 헬퍼
export function h(type, props = {}, ...children) {
  return { type, props: { ...props }, children };
}

// 실제 DOM → Virtual DOM
export function domToVdom(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.data;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const props = Object.fromEntries(
    Array.from(node.attributes, ({ name, value }) => [name, value])
  );
  const vnode = h(node.localName, props);
  for (const child of node.childNodes) {
    const childVNode = domToVdom(child);
    if (childVNode !== null) {
      vnode.children.push(childVNode);
    }
  }
  return vnode;
}

// Virtual DOM → 실제 DOM
export function createElement(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  const element = document.createElement(vnode.type);
  for (const [name, value] of Object.entries(vnode.props)) {
    element.setAttribute(name, value);
  }
  for (const child of vnode.children) {
    element.appendChild(createElement(child));
  }
  return element;
}
