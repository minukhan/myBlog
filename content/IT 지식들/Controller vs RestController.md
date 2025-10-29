

|구분|`@Controller`|`@RestController`|
|---|---|---|
|**역할**|웹 애플리케이션에서 뷰(View)를 반환하는 컨트롤러|RESTful API를 제공하는 컨트롤러|
|**리턴 값 처리 방식**|ViewResolver가 뷰 이름을 해석해 HTML을 생성|객체나 문자열을 JSON/XML로 변환해 HTTP Response Body에 직접 반환|
|**조합 관계**|`@Controller` + `@ResponseBody` = `@RestController`|이미 `@ResponseBody`가 포함되어 있음|
|**주 사용 시점**|JSP, Thymeleaf, Mustache 등 템플릿 기반 UI 제공 시|프론트엔드(Vue, React, Angular 등)와 데이터(JSON) 통신 시|
|**HTTP 응답 형태**|HTML 페이지|JSON 또는 XML 데이터|

### `@Controller`의 동작 흐름

1. 클라이언트가 `/hello` 요청을 보냄.
2. 컨트롤러 메서드가 문자열 `"hello"`를 반환.
3. `ViewResolver`가 `"hello"`라는 이름의 뷰 파일(`hello.html` 혹은 `hello.jsp`)을 찾아 렌더링.
4. 완성된 HTML이 브라우저로 응답.

```
@Controller
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "hello"; // View 이름
    }
}
```

### `@RestController`의 동작 흐름

1. 클라이언트가 `/hello` 요청을 보냄.
2. 컨트롤러 메서드가 객체 또는 문자열을 반환.
3. `HttpMessageConverter`가 해당 데이터를 JSON/XML로 변환.
4. 변환된 데이터가 HTTP Response Body에 직접 담겨 응답됨.

```
@RestController
public class HelloRestController {
    @GetMapping("/hello")
    public String hello() {
        return "hello"; // 문자열이 그대로 응답 본문으로 반환됨
    }

    @GetMapping("/user")
    public User user() {
        return new User("홍길동", 30); // JSON 형태로 반환됨
    }
}
```