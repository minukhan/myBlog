
## 자바에서 Object 타입인 value를 String으로 타입 캐스팅하는 것과 String.valueOf()를 사용하는 것의 차이점은 무엇인가요?

- 두 방식 모두 String 타입으로 변환하는것은 동일하다. 
- 하지만 동작 방식과 예외처리에서 차이가 있다. 


### (String) value 로 타입 캐스팅

- (String) value 로 타입 캐스팅 하는것은 value 가 String 타입이 아닌경우에 ClassCaseException 이 발생한다. 
- 또한 null 인경우에 그대로 null 을 반환해서 이후 메서드를 반환할때 NullPointerException 이 발생한다. 

> 타입 캐스팅은 타입 안정성이 부족하기 때문에 캐스팅 하는 타입이 확실할 때만 사용해야 한다. 

### String.valueOf(value)

-  String.valueOf(value) 는 value 가 String 타입이 아닌경우에 value.toString() 을 호출해서 String을 ㅗ변환해준다.
- 만약에 null 일경우에 "null" 인 문자열로 반환해주기 때문에 에러가 안남. 


> 타입 캐스팅에서 발생하는 예외는 런타임 시점에 발생하기 때문에 String.valueOf() 를 사용해라. 


