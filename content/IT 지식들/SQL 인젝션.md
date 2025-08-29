
### SQL 인젝션

- 사용자가 입력한 값이 잘 처리되지 않고 SQL 쿼리에 삽입될 때 발생하는 보안 취약점. 
- 쿼리를 조작해서 인증 우회, 데이터 조회, 테이블 삭제까지 가능

## 공격자가 자주 사용하는 페이로드 예시

- `' OR '1'='1` : 항상 참인 조건으로 인증 우회
- `' UNION SELECT * FROM accounts --` : 다른 테이블 정보 탈취
- `'; DROP TABLE users; --` : 테이블 삭제 시도
## SQL 인젝션 방지 방법

1. **PreparedStatement 사용**
    
    - SQL 쿼리 내에 파라미터 자리에 `?` 플레이스홀더를 사용하고,
    - 사용자 입력은 `setString()` 같은 메서드로 바인딩하여 내부적으로 안전하게 처리(이스케이프)


```
String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setString(1, username);
pstmt.setString(2, password);
```

2. **ORM 프레임워크 사용**
    
    - JPA, Hibernate 같은 [[ORM(Object-Relational Mapping)]] 도구는 SQL을 직접 작성하지 않고, 객체지향 방식으로 DB 접근을 하므로 SQL 인젝션 위험 감소
        
3. **입력값 검증 및 필터링**
    
    - 사용자가 입력한 값에 악의적인 SQL 구문이 포함되어 있는지 검사
        
4. **최소 권한 원칙 적용**
    
    - 데이터베이스 사용자 계정에 필요한 최소 권한만 부여해, 만약 공격 당해도 피해를 최소화
        
5. **에러 메시지 숨기기**
    
    - SQL 오류나 예외 정보를 사용자에게 직접 노출하지 않아, 공격자가 내부 구조를 파악하지 못하도록 함