

### Checked Exception

- 검사 예외라고도 하고 
- 컴파일 시점에 확인되고 반드시 처리해야하는 예외를 말함.
- IOException , SQLException 이 여기에 속한다. 

> 개발자가 나 이 코드는 확실하게 짜고싶어 해서 메서드 뒤에 throws Exception 같은걸 붙인다.
> 
> 그렇게 되면 이제 try, catch 를 하라고 컴파일러가 강제로 관리.
> 
> 하지 않으면 너 이거 안했자나 얼른 해! 라고 컴파일 타임에 검사를 하는 것 .


### Unchecked Exception

- 런타임 시점에 발생하는 예외 
- 컴파일러가 강제하지 않는다. 
- RuntimeException 이 여기에 속한다. 

### 그래서 각각 언제 사용해야해??

> 사실 정답은 없음. 

- Checked Exception 은 외부 환경과 상호작용 할때! 
- 파일 입출력, 네트워크 통신 같은 곳

- UnChecked Exception 은 코드 오류, 논리적 결함 등 프로그래머 실수로 발생할 수 있는 예외에 적합. 

### Error 와 Exception 의 차이는 뭐야??

- Error 는 주로 JVM 에서 발생하는 심각한 문제. 
- `OutOfMemoryError`, `StackOverflowError`
- 회복이 어려운 오류에 속하며, 애플리케이션 코드에서 복구할 수 없는 심각한 문제를 나타냄.

- 그러나 Exception 은 프로그램 실행중 발생할 수 있는 오류상황. 
- 회복 가능성이 있고 프로그램 내에서 예외 처리를 통해 오류상황 제어가능. 

### 간단한 에러 상속 구조 
```
Throwable
├── Error                  // 시스템 오류 (비검사 예외)
├── Exception              // 일반 예외 (검사 예외의 부모)
│   ├── IOException        // 대표적인 검사 예외
│   └── RuntimeException   // 비검사 예외의 시작점
```

