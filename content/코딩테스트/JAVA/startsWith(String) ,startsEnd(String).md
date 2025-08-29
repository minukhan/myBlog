
앞에 붙어있는지 확인해주는 메서드 
```
String s = "hello world";
System.out.println(s.startsWith("hello")); // true
System.out.println(s.startsWith("world")); // false
```


인자값 : String
리턴값 : boolean 


```
String s = "example.txt";
System.out.println(s.endsWith(".txt")); // true
System.out.println(s.endsWith(".java")); // false
```


인자값 : String
리턴값 : boolean 


### 알아두어야 할 점

- 이 메서드는 대소문자를 구분한다. 
- 위치를 지정가능한 오버로딩이 있다. 

```
String s = "Java Programming";
System.out.println(s.startsWith("Programming", 5)); // true
```

인자값 : String, int
리턴값 : boolean
