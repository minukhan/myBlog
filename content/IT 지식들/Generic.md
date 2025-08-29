## Generic 을 사용하는 이유.

##### 1. 같은 로직인데 자료형만 다른경우에 제네릭을 사용하면 중복된 코드 없이 하나의 코드로 다양한 자료형들을 처리 할 수 있음. 

- 라이브러리나 프레임워크를 만들 때, 제네릭을 사용하면 다양한 타입을 지원하는 유연한 API 를 만들 수 있음. 

```
// 제네릭 없이
public void printInt(int value) { System.out.println(value); }
public void printString(String value) { System.out.println(value); }

// 제네릭 사용
public <T> void print(T value) { System.out.println(value); }

```

##### 2. 타입 안정성을 보장해준다. 
- 컴파일 타임에 타입을 검사할 수 있어서 런타임 오류를 줄일 수 있고 버그를 예방할 수 있다. 

##### 3. 캐스팅(Casting) 불필요
- 제네릭을 사용하면 타입 캐스팅 없이 값을 안전하게 사용할 수 있습니다. 

```
**비제네릭 예시:**

`List list = new ArrayList(); list.add("hello"); String str = (String) list.get(0); // 강제 캐스팅 필요`

**제네릭 예시:**

`List<String> list = new ArrayList<>(); list.add("hello"); String str = list.get(0); // 캐스팅 불필요`
```

##### 무공변 (Invariant)

- 타입이 **완전히 일치해야 함** (예: `List<T>`는 `List<T>`만 가능)
- 읽기/쓰기 **둘 다 가능**
- 예) `List<T> list`에 `T` 타입만 넣고 꺼낼 수 있음
```
`List<Animal> animals = new ArrayList<Cat>(); // ❌ 
List<Cat> cats = new ArrayList<Animal>();    // ❌`
```
#####  공변 (Covariant) — `<? extends T>`

- **읽기 전용**으로 사용하는 경우가 많음 (실제로 쓰기 불가능하거나 제한적)
- 타입은 `T` 또는 `T`의 하위 타입 가능
- **읽기 가능**: 꺼낼 때 `T` 타입으로 안전하게 읽음
```
public void readAnimals(List<? extends Animal> animals) {
    for (Animal a : animals) {
        System.out.println(a);
    }
    // animals.add(new Cat()); // ❌ 컴파일 에러: 쓰기 불가
}

```
##### 반공변 (Contravariant) — `<? super T>`

- **쓰기 전용**으로 주로 사용됨
- 타입은 `T` 또는 `T`의 **부모 타입** 가능
- **쓰기 가능**: `T` 타입의 값을 안전하게 넣을 수 있음

```
List<? super Integer> list = new ArrayList<Number>();
list.add(10); // 가능 (Integer 타입 넣기)
Object obj = list.get(0); // 읽을 땐 Object 타입 (다운캐스팅 필요)
```


#### SAFFY 정리

- 다양한 타입의 객체를 다루는 메서드, 컬렉션 클래스에서 컴파일 시에 타입을 체크함. 
- 미리 사용할 타입을 명시해서 형 변환을 하지 않아도 되게 한다. 
- 객체를 생성할때 변수쪽과 생성쪽의 타입은 반드시 같아야한다. 
- `GenericBox`는 제네릭 클래스인데, 타입 파라미터 없이 사용하는 걸 **raw type**이라고 해요.`@SuppressWarnings`를 남발하면 참 좋겠다.  
→ (비꼬는 표현) **경고를 억지로 무시하면 안 되고**, 올바른 제네릭 타입을 명시하는 게 바람직하다는 뜻입니다.

### 핵심 요약

|개념|설명|
|---|---|
|**Raw Type**|제네릭 타입 없이 사용하는 것. 비추천.|
|**@SuppressWarnings**|경고 무시. 남용하면 안 좋음.|
|**GenericBox<Person> ≠ GenericBox<SpiderMan>**|타입 파라미터가 다르면 **상속 관계가 없음**.|
|**다형성**|`SpiderMan extends Person`은 가능하지만, `GenericBox<SpiderMan> extends GenericBox<Person>`은 아님!|
