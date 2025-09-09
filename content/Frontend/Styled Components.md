
### 🔷 스타일드 컴포넌트란?

관련 개념: [[React]], [[Emotion]], [[JSX]], [[렌더링]]

- **JavaScript 파일 안에서 직접 CSS를 작성할 수 있도록 도와주는 라이브러리**
- 컴포넌트 단위로 스타일을 캡슐화해 재사용성과 유지보수를 쉽게 함
- 스타일을 자바스크립트 코드처럼 작성하고, 컴포넌트에 바로 붙여서 쓸 수 있음

### 왜 스타일드 컴포넌트를 쓸까?

- **스타일 충돌 방지**
    - 각 컴포넌트에 고유한 클래스명이 자동 생성되어, CSS 충돌 걱정이 없음
        
- **동적 스타일링 가능**
    - props를 이용해 상태에 따라 스타일을 쉽게 변경할 수 있음
        
- **코드 가독성 향상**
    - 컴포넌트 코드와 스타일을 한 곳에서 관리할 수 있어 개발 편리
        
- **기존 CSS보다 편리한 기능**
    - 중첩, 변수, 함수 사용 가능 (Sass 같은 전처리기 기능 일부 포함)

```
import styled from 'styled-components';

// 1. styled 객체 뒤에 HTML 태그 이름을 붙이고, 백틱(`) 안에 CSS 작성
const Button = styled.button`
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;

  &:hover {
    background-color: darkblue;
  }
`;

// 2. 컴포넌트처럼 사용
function App() {
  return <Button>클릭하세요</Button>;
}

```