
- `indexOf()`는 Java에서 **문자열(String) 내에서 특정 문자 또는 문자열이 처음 등장하는 위치(인덱스)를 찾는 메서드**입니다.

```
int index = str.indexOf(charOrString);
int index = str.indexOf(charOrString, fromIndex);  // 두 번째 인자: 시작 위치
```

|형태|의미|
|---|---|
|`indexOf(char c)`|문자 `c`가 처음 등장하는 위치|
|`indexOf(String s)`|문자열 `s`가 처음 등장하는 위치|
|`indexOf(char c, int fromIndex)`|인덱스 `fromIndex`부터 문자 `c`를 찾음|
|`indexOf(String s, int fromIndex)`|인덱스 `fromIndex`부터 문자열 `s`를 찾음|
