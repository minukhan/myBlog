
### Record란 ??

- 자바 16에서 정식으로 출시된 유형의 클래스로 불변성을 기본으로 한다. 
- 기존의 필드들이 모두 final 키워드로 선언되어서 객체를 변경할 수 없음. 
- 그래서 멀티 스레드 환경에서 원하지 않게 변경되는 현상을 막을 수 있다. 
- 생성자, getter, `equals()`, `hashCode()`, `toString()`을 자동으로 만들어 준다.

### Record가 항상 DTO인가??

- 보통 DTO 만드는 목적으로 많이 사용하지만 꼭 그런건 아니다. 
- Record는 단순히 “데이터를 담는 불변 객체”일 뿐

### VO(Value Object)가 뭐여??

- **Value Object(값 객체)** 란  
- “특정 개념을 **값으로 표현**하기 위한 불변 객체”.

### Record와 VO의 공통점 및 차이점

- 둘다 모두 객체의 상태가 변경되지 않는 공통점이 있음. 
- 데이터를 캡슐화해서 표현. 
- 차이점은 Record는 그냥 변하지않는 객체만드는건데 VO는 비즈니스 규칙까지 넣을 수 있다고 함. 

- Vo 예시. 
```
public record Money(int amount) {

    public Money {
        if (amount < 0) throw new IllegalArgumentException("금액은 음수가 될 수 없습니다.");
    }

    public Money add(Money other) {
        return new Money(this.amount + other.amount);
    }
}
```
### Record의 한계

- `extends`로 다른 클래스를 상속할 수 없음.
- 단, 인터페이스는 `implements` 가능.
- 모든 필드가 `final`이므로 setter가 없고, 생성 후 수정이 불가능합니다.
- 필요 시 새로운 객체를 만들어야 합니다.