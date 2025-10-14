
### Hibernate 가 뭐야??

- 자바 객체(Entity)와 관계형 DB 테이블을 매핑해주는 ORM 프레임워크를 말한다. 
- 개발자는 자바 코드로 도메인을 모델링.
- Hibernate가 그에 맞는 SQL 생성, 실행, 트랜잭션 등을 담당.

### 왜 이걸 쓰는거야? (ORM의 이점)

- CRUD, 연관관계 SQL 을 자동으로 생성해줌. 
- 지연로딩, 더티 체킹, 배치 업데이트 등 다양한 기능 제공.

> 그러나 모든 SQL을 해주진 않음. 
> 좀 복잡한건 JPQL 이나 네이티브 SQL 로 직접 설계해야함. 


### JPA vs Hibernate

- 실무에선 “Spring Data JPA ↔ JPA API ↔ Hibernate” 흐름으로 사용하는 경우가 많음.
- **JPA**: 자바 표준 **인터페이스/스펙** (javax.persistence / jakarta.persistence)
- **Hibernate**: JPA **구현체**이자, JPA보다 더 많은 **고유 기능**(HQL, 고급 캐시, 확장 타입 등)을 제공
