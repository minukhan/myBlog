

> [!note] 알아야하는것만
> - `==`는 **두 문자열 객체가 같은 메모리 주소**를 가리키는지(즉, 같은 객체인지)만 비교해요.
> - `equals()`는 **문자열 안에 들어있는 실제 문자 내용**을 비교해요.
    
```
String s1 = new String("apple");
String s2 = new String("apple");

System.out.println(s1 == s2);       // false, 서로 다른 객체라서
System.out.println(s1.equals(s2));  // true, 내용이 같으니까
```

추가 팁: NPE(NullPointerException) 방지도 해준다. equals() 가 
## `==` 연산자

- **기본 타입(primitive)** 비교: 값을 직접 비교
- **참조 타입(reference)** 비교: **참조값(주소)** 비교 (즉, 같은 객체인지 여부)

## `equals()` 메서드

- **객체 내부의 값(내용)을 비교**하기 위해 사용
- 보통 `String`, `Wrapper 클래스`, `사용자 정의 클래스`에서 오버라이드 되어 있음
- 기본적으로 `Object` 클래스에서 `==`처럼 동작하지만, 대부분의 클래스에서 내용을 비교하도록 재정의함
