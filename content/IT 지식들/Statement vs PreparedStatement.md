
- 둘다 SQL 실행을 담당한다. 
- 사용 방식과 성능, 보안 측면에서 차이가 존재한다. 

>[!note] 
>실무에서는 거의 항상 `PreparedStatement`를 사용하는 게 정석
#### Statement

- 클래스는 문자열 연결을 이용해서 SQL 을 동적으로 구성해야한다. 
- 이러한 특성으로 인해서 SQL 인젝션 공격에 취약하다는 단점이 있다. 
```
Statement stmt = conn.createStatement(); ResultSet rs = 30")" >stmt.executeQuery("select * from users where age > 30");
```

#### PreparedStatement

- 동적으로 파라미터를 바인딩할 수 있는 기능을 제공한다. 
- 값을 바인딩하면 내부적으로 이스케이프 처리하기 떄문에 SQL 인젝션 공격을 방지 가능. 
- 또한 SQL 구문 분석 결과를 캐싱할 수 있어서 반복 실행할때 Statement 보다 성능이 좋다고 한다. 

### 성능: Statement vs PreparedStatement

- **Statement**: SQL을 **매번 새로 파싱**해야 함.
- **PreparedStatement**: SQL 구조를 DB가 **미리 컴파일하고 캐싱**함.
    - 따라서 **반복 실행할 경우 훨씬 빠름**.
    - 특히 트랜잭션이나 배치 처리에서 효과 큼.


### 보안: SQL 인젝션 예시
- Statement (취약):

```
String userInput = "1 OR 1=1";
String sql = "SELECT * FROM users WHERE id = " + userInput;
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery(sql); // → 모든 사용자 노출 가능
```

- PreparedStatement (안전):
```
String sql = "SELECT * FROM users WHERE id = ?";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setString(1, userInput); // → 내부적으로 이스케이프 처리
ResultSet rs = pstmt.executeQuery(); // 안전하게 실행
```


``
