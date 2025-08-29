
- `replaceAll()`은 Java에서 문자열 내의 특정 **패턴(정규 표현식)을 찾아서 다른 문자열로 바꾸는 메서드**입니다.

```
String result = str.replaceAll(String regex, String replacement);
```

- 인자값 : String, Strnig
- 리턴값 : String

```
String str = "apple banana apple";

String result = str.replaceAll("apple", "orange");

System.out.println(result);  // 출력: "orange banana orange"
```


### 하나만 바꾸는 메서드 replce()

String.replace(char , char)
String.replace(String, String) 

이렇게 두가지가 있다. 




