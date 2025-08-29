
- Post/ Redirect/ Get 패턴의 약자.
- 일반적으로 [[멱등성]]이 보장되지 않는 POST 요청에 사용된다.

### 문제가 무엇이냐?

- 폼 제출 후 새로고침 하면 요청이 중복으로 제출된다.
- 브라우저 뒤로가기 하면 폼이 재제출되는 경우가 생김.
	- 왜 재 제출되느냐? : POST 이후 페이지를 보여주려면 서버에서 이페이지는 post 해야지만 보여줄 수 있어! 라고 판단하고 한번 더 post를 한다고함. 


## 그래서 이 패턴은 뭔데?

- 사용자가 폼을 제출하면(POST) 하면 서버는 결과 페이지를 직접 반환하는게 아니라
- 클라이언트에게 리다이렉션을 지시한다.
- 클라이언트는 이 리다이렉션을 따라서 GET 요청을 하게 되어 결과적으로 주소창도 새로운 URL로 바뀜


## 정리해보자면

- PRG 패턴이란 흐름이 POST -> Redirect -> GET 으로 흘러가서 PRG 패턴이라고 하는듯.
- 페이지를 2개를 만들어놔 (POST 전 페이지), (POST 후 페이지)
- 이떄 POST가 들어오면 서버가 바로 HTML을 응답해주는게 아니라 Redirect 를 시켜서 다른 페이지를 보여주게끔 넘겨준다. 
![](https://upload.wikimedia.org/wikipedia/commons/3/3c/PostRedirectGet_DoubleSubmitSolution.png)