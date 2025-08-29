### **1. JSX (JavaScript XML)**

- JSX는 **JavaScript 코드 안에 HTML처럼 생긴 코드를 쓸 수 있는 문법**이에요.
    
- 예전에는 `React.createElement()`로 UI를 만들었는데, JSX 덕분에 훨씬 직관적이고 가독성이 좋아졌죠.
    

#### 예시


`const element = <h1>Hello, React!</h1>;`

위의 코드는 사실 아래처럼 변환돼요:

`const element = React.createElement('h1', null, 'Hello, React!');`