
### CORS란 무엇인가요??

- 브라우저가 서로 다른 출처(origin) 간의 요청을 안전하게 허용하거나 차단하기 위한 표준 규칙
- **출처(origin)** = `프로토콜 + 호스트 + 포트` 조합  
	예) `https://example.com:443` 과 `http://example.com:80` 은 서로 다른 출처


> [!important] 여기서 출처란??
> 
> **프로토콜(scheme), 호스트(host), 포트(port)**의 조합으로 정의
> 두 URL이 동일한 출처로 간주되려면 이 세 가지 요소가 모두 정확히 일치해야 함.
> 
### CORS가 왜 필요할까??

- 과거에 크로스 사이트 요청 위조(CSRF) 문제가 있었다.
- 피해자의 브라우저에서 다른 애플리케이션으로 가짜 클라이언트 요청을 전송하는 공격. 

- 그래서 이 문제를 해결하기 위해서 SOP(same-origin policy)를 구현했다. 

### SOP가 뭔데??? 

- **Same-Origin Policy(동일 출처 정책)**.
- 브라우저가 다른 출처(origin)의 데이터에 접근하지 못하게 막는 규칙.
- 같은 주소가 아니라면?? 
	- 브라우저는 스크립트의 읽기 접근을 제한한다. 

> 같은 주소만 읽을 수 있도록 한것!

##### SOP 의 세부 규칙

- 읽기 차단 :
	- 기본적으로 한 출처의 스크립트는 다른 출처로부터의 응답을 읽을 수 없음.
- 쓰기 허용 :
	- 링크 클릭, 폼 제출과 같은 교차 출처 쓰기 작업은 일반적으로 허용. SOP가 도입되기 이전부터 존재했던 웹의 기본 동작. 

> 기본적으로 거부 원칙을 구현한 것. 
> 모든 교차 출처 읽기를 기본적으로 차단. 강력한 보안 경계를 형성한다. 

### 근데 왜 CORS 가 나왔을까??

- SOP로는 한계가 있다. 
- 그 이유는 현대 웹 애플리케이션은 다른 출처의 리소스를 사용하는 경우가 많다.(CDN, API 자주사용함. )


- 그래서 같은 주소 말고도 내가 명시를 해준 주소는 읽을 수 있도록 해줄께! 라고 해주는 것. 

### CORS는 어떻게 작동할까?

- 브라우저가 요청을 보냄!
- 서버 응답의 Access-Control-* 헤더로 허용 범위 전달.
- 브라우저가 Origin 헤더와 응답 메시지의 Access-Control-Allow-Origin 헤더를 비교해서 CORS를 위반하는지 확인한다. 
- 허용되면 JS에서 응답 접근 가능하게함. 아니면 차단시킨다. 

### 프리플라이트 요청 (Preflight Request)

- 브라우저가 낮선 서버에 요청을 보내기 전에 먼저 허락을 받는 요청. 
- origin 이 다르네?? -> 이거 위험할 수 있으니까 확인한번 해보자. 
- “허락 요청”은 **HTTP OPTIONS** 메서드로 보낸다. 

- 요청 예시
```
OPTIONS /user/update HTTP/1.1
Origin: https://my-site.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization
```

- 응답이 오면 허용함을 인지하고 진짜 요청을 보낸다! 한번 잘 되나 확인하는 과정을 말함.



콘솔창에서 이런 에러를 만나본 적 있으시죠? CORS(Cross-Origin Resource Sharing, 교차 출처 리소스 공유) 이슈와 해결 방법을 알아봅니다.

[![CORS 에러 예시](https://velog.velcdn.com/images/tosspayments/post/34f703e3-c61f-4730-82ef-9867c8fc4d0a/image.png)](https://velog.velcdn.com/images/tosspayments/post/34f703e3-c61f-4730-82ef-9867c8fc4d0a/image.png)

### 이 에러, 대체 왜 발생하나요?

한 마디로 브라우저가 내 서버가 아닌 다른 서버의 리소스를 요청했기 때문이에요. 브라우저는 기본적으로 다른 서버를 신뢰하지 않아서 다른 서버에 요청을 보내거나 응답을 받는 걸 차단해요. 토큰, 쿠키와 같이 민감한 사용자 정보가 브라우저에 저장되는데, 이 정보를 탈취하면([CSRF](https://www.ibm.com/docs/ko/sva/10.0.4?topic=configuration-prevention-cross-site-request-forgery-csrf-attacks), [XSS](https://ko.wikipedia.org/wiki/%EC%82%AC%EC%9D%B4%ED%8A%B8_%EA%B0%84_%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8C%85)) 심각한 보안 이슈가 생기기 때문이죠. 그래서 서로 다른 서버 리소스는 공유하지 않는 브라우저 정책을 SOP(Same-Origin Policy, 동일 출처 정책)라고 해요. 우리가 자주 마주치는 CORS 에러는 SOP 기준에 맞춰 CORS 정책을 적용하지 않아서 발생해요.

[![cors 에러 도표](https://velog.velcdn.com/images/tosspayments/post/bf19ec1d-b482-4f21-8949-fca7f60aaf14/image.png)](https://velog.velcdn.com/images/tosspayments/post/bf19ec1d-b482-4f21-8949-fca7f60aaf14/image.png)

1. 브라우저에서 `https://myshop.com`의 출처를 가진 웹 애플리케이션에서 `https://othershop.com` 출처의 리소스를 요청함
2. `https://othershop.com` 출처에서는 `https://myshop.com`출처의 리소스 요청을 거부함

이럴 때 브라우저는 보안 상의 이유로 `https://othershop.com`의 리소스를 `https://myshop.com`에서 요청할 수 없도록 차단하고 CORS 에러를 발생시킵니다.

CORS를 한 마디로 정의하자면 서로 다른 서버끼리 리소스를 공유하기 위한 정책이에요. 리소스 요청, 응답을 허용할지 결정하는 브라우저의 검증과 허락, 그를 위한 HTTP 헤더 사용 등을 포함하죠.

### 웹의 발달과 CORS

예전에는 프론트엔드와 백엔드를 따로 구성하지 않고 한 번에 구성해서 모든 처리가 같은 도메인 안에서 가능했습니다. 그래서 다른 출처로 요청을 보내는 게 의심스러운 행위로 보일 수밖에 없었죠. 그런데 시간이 지나 클라이언트에서 API를 직접 호출하는 방식이 당연해지기 시작했어요. 그런데 보통 클라이언트와 API는 다른 도메인에 있는 경우가 많죠. 그래서 CORS 정책이 생겼어요. 출처가 다르더라도 요청과 응답을 주고받을 수 있도록 서버에 리소스 호출이 허용된 출처(Origin)를 명시해 주는 방식으로요.

### ‘출처가 교차한다’?

CORS를 번역하면 “교차 출처 리소스 공유”에요. 여기서 출처가 교차한다는 게 무슨 뜻일까요? 출처는 ‘오리진origin’의 번역 표현이에요. 우리가 흔히 알고 있는 URL에서 도메인만 뜻하는 게 아니라 프로토콜과 포트까지 포함하는 개념이죠. 출처를 구성하는 세 요소는 프로토콜·도메인(호스트 이름)·포트로, 이 중 하나라도 다르면 CORS 에러를 만나게 됩니다.

- 도메인(Hostname): `myshop.com`
- 출처(Origin): `https://www.myshop.com`

[![출처가 교차한다](https://velog.velcdn.com/images/tosspayments/post/7d46bbc5-9277-45d3-9d1d-30067bebd8d7/image.png)](https://velog.velcdn.com/images/tosspayments/post/7d46bbc5-9277-45d3-9d1d-30067bebd8d7/image.png)

즉, ‘출처가 교차한다’는 건 리소스를 주고받으려는 ‘두 출처가 서로 다르다’는 뜻이에요. CORS를 설정한다는 건 ‘출처가 다른 서버 간의 리소스 공유’를 허용한다는 거죠.

위에서 SOP가 서로 다른 출처일 때 리소스 요청과 응답을 차단하는 정책이라면, CORS는 반대로 서로 다른 출처라도 리소스 요청, 응답을 허용할 수 있도록 하는 정책이에요. 그래서 우리가 만나는 에러는 CORS가 가능하도록 뭔가 설정하라는 내용으로 이루어져 있어요.

뒤에 나올 해결 방법에서 사용되는 헤더인 `Access-Control-Allow-Origin`도 ‘허용되는 출처에 대한 접근제어’는 의미라고 이해할 수 있어요.

아래 예시를 통해 어떤 URL이 SOP에 부합하는지 한 번 확인해 보세요.



### CORS 에러 대응하기

#### 서버에서 `Access-Control-Allow-Origin` 응답 헤더 세팅하기

서버에서 `Access-Control-Allow-Origin` 헤더를 설정해서 요청을 수락할 출처를 명시적으로 지정할 수 있어요. 이 헤더를 세팅하면 출처가 다르더라도 `https://myshop.com`의 리소스 요청을 허용하게 되죠.

```
'Access-Control-Allow-Origin': <origin> | *
```

`*`를 설정하면 출처에 상관없이 리소스에 접근할 수 있는 와일드카드이기 때문에 보안에 취약해져요. 그래서 `'Access-Control-Allow-Origin': https://myshop.com`과 같이 직접 허용할 출처를 세팅하는 방법이 더 좋습니다.


웹 애플리케이션이 리소스를 직접적으로 요청하는 대신, **프락시 서버**를 사용하여 웹 애플리케이션에서 리소스로의 요청을 전달하는 방법도 있어요. 이 방법을 사용하면, 웹 애플리케이션이 리소스와 동일한 출처에서 요청을 보내는 것처럼 보이므로 CORS 에러를 방지할 수 있어요.

예를 들어, `http://example.com`에서 동작하는 웹 애플리케이션이 `http://api.example.com`에 데이터를 요청하는 상황을 가정해 볼게요. 두 도메인이 다르기 때문에 브라우저는 cross-origin 요청으로 판단하고, 서버가 CORS 설정을 제대로 하지 않았다면 요청이 실패할 수 있어요.

이 문제를 해결하려면, 웹 애플리케이션이 직접 `http://api.example.com`에 API 요청하는 대신, **같은 출처(`http://example.com`)에 위치한 프락시 서버**를 통해 API 요청을 중계하도록 구성하면 됩니다.

```
웹 애플리케이션 → http://example.com/api/proxy → (서버 내부 요청) → http://api.example.com
```

브라우저 입장에선 `http://example.com`에 요청한 것처럼 보이기 때문에, CORS 검사 없이 응답을 받을 수 있어요.
