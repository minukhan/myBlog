
### 데이터 모델링 


개념적 모델링

논리적 모델링

물리적 모델링

데이터 항목을 추가하는것도 원래 어렵다. 

테이블 설계에서는 행을 고유하게 식별하기 위해 식별자를 도입함. -> 기본키

##### 중복이 되면 안좋은점? 

- 데이터가 불필요한 공간을 차지한다.
- 만약 변경된 경우에 그것까지 업데이트를 해줘야하는데 안될경우있음. 

--> 이래서 정규화, 테이블 분할을 하는 것.


### 제 1 정규형

- 한 열에 여러개의 값을 저장해선 안된다. 모든 열은 쪼갤 수 없는 원자값이여야함.
  
![](https://blog.kakaocdn.net/dn/beMjvB/btrSpwrH3uE/GJmIkn95rFskitXUOmmFFK/img.png)
![](https://blog.kakaocdn.net/dn/pgeLa/btrSpmwK9hO/Q5WubKaVPEYVwn3kO4aoj1/img.png)
![](https://blog.kakaocdn.net/dn/ofsqd/btrSlEZJaYX/g7RzZluWxtfftKAN7uWFJ1/img.png)



### **제2정규형**

![](https://blog.kakaocdn.net/dn/ev5Zrw/btrSr5nygxg/sn4hVjLpJRn0ZakZ57acnK/img.png)

부분 함수 종속 : dept_name 을 보면 emp_id 와는 전혀 연관이 없음.  dept_id 에만 종속되어있다.

부분 함수 종속을 모두 없앤다면 2 정규형이 만족한다 한다.

함수 종속 : 그니까 x 를 넣으면 y 가 튀어나오는걸 말함. 하나에 대해서 결정되는거 생각하면 될듯.


### 제 3 정규형

이행적 함수 종속성을 모두 없애면 제 3 정규형을 만족하는 것. 
 A -> B
 B -> C
 A -> C

### BCNF 정규형



이상현상을 해결해준다. 

CRUD 에서 CUD 때문에 지금까지 정규화를 한거임 이상을 없애려고

여기서 근데 보통은 BCNF 까지만 정규화를 진행한다고 한다.

그 이유는 보는거 ( R ) 의 효율이 하면할수록 효율이 떨어짐 ( Join 이 많아지기 때문 )

삽입 이상 : 특정

삭제 이상 : 

갱신 이상 : 



index를 타지 않는것

like 에서 "ddd%" 이렇게하면 인덱스 탐 효율적
"%ddd" 이렇게 하면 인덱스를 타지않아서 비효율적

서브쿼리는 좀 느리다고함.

springBatch 

트랜잭션 
0 ~ 3 레벨까지 격리수준이 있다고 한다. 

