
- **구조**: 한쪽에만 FK (주인), 다른 쪽은 `mappedBy`로 비주인 표시

특징 
    - 비주인 쪽 Lazy Loading 문제 발생 (프록시 생성 어려움)
    - 비주인에서 연관 엔티티 존재 여부 확인할 때 추가 쿼리 발생
    - 주인 쪽에서 Lazy 로딩은 정상 동작
        
- **주의**: JPA 한계로 비주인 쪽 진짜 Lazy가 어려움
### **Two 단방향 OneToOne 연관관계 (양방향 대신)**

- **구조**: 서로 다른 테이블에 각각 FK 컬럼 존재, `mappedBy` 없음
    
- **예시**:
    
```
	
class User {
    @OneToOne(fetch = LAZY)
    @JoinColumn(name = "account_id")
    private Account account;
}

class Account {
    @OneToOne(fetch = LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
    
```