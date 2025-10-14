

### JPA의 ddI-auto옵션이 뭐야??

- JPA([[Hibernate]])는 **엔티티(Entity) 클래스**를 보고 데이터베이스 테이블을 어떻게 관리할지 결정
- 이때 **hibernate.hbm2ddl.auto** 또는 스프링 부트에서는 **spring.jpa.hibernate.ddl-auto** 라는 설정을 통해,  
- **애플리케이션 시작 시 DB 스키마(테이블 구조)를 어떻게 다룰지**를 정할 수 있어요.
- 이 옵션은 `application.properties` 또는 `application.yml` 파일에서 설정가능. 


### 이게 왜필요해?? 

- 개발할 때 엔티티 구조 등을 자주 수정한다.
- 그때마다 SQL DDL(`CREATE TABLE`, `ALTER TABLE` 등)을 직접 작성하면 귀찮음.
- 그래서 [[Hibernate]]가 자동으로 DB 스키마를 생성하고 변경하고 검증해줌. 

> `ddl-auto` = "JPA가 DB 테이블을 어떻게 다룰지 정하는 전략"

값에 따라 행동이 달라짐:

- **none** → 아무것도 안 함
- **validate** → 스키마와 엔티티 맞는지만 확인
- **update** → 필요하면 DB 구조를 자동 업데이트
- **create** → 시작 시 새로 스키마 생성
- **create-drop** → 시작 시 생성하고 종료 시 삭제

![](https://i.imgur.com/STanW5r.png)

