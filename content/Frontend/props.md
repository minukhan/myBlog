### 🔷 **3. props (속성)**

- `props`는 **부모 컴포넌트가 자식 컴포넌트에 데이터를 전달**할 때 사용해요.
- 읽기 전용(자식 컴포넌트가 props를 직접 수정할 수는 없어요).

```
function Welcome(props) {
  return <h1>안녕, {props.name}!</h1>;
}

// 사용
<Welcome name="철수" />

```