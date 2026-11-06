// [component.js] 함수형 컴포넌트를 감싸 상태 저장(hooks)과 렌더링(mount/update)을 담당

export class FunctionComponent {
  constructor(component, container) {
    this.hooks = [];
  }
  // 처음 렌더링
  mount() {
    throw new Error("TODO");
  }
  // 상태 변경 후 다시 렌더링 (새 Virtual DOM → Diff → Patch)
  update() {
    throw new Error("TODO");
  }
}
