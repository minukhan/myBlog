
- 자바에서 데이터베이스에 접속하고 쿼리를 실행하며 결과를 처리할 수 있도록 도와주는 API 이다. 

> 자바 프로그램과 데이터베이스를 연결해주는 다리 역할. 


### 왜 필요한가?

- 자바로 작성한 프로그램에서 [[MySQL]] , Oracle, [[PostgreSQL]] 같은 데이터베이스에 데이터를 넣거나 가져오고 싶을 때, 직접 연결하고 쿼리를 실행하는 건 복잡하다. 
- JDBC가 이 과정을 표준화해서 쉽게 만들어준다. 

### JDBC 구성 요소

- **DriverManager**: DB 연결을 관리
- **Connection**: 데이터베이스 연결 자체
- **[[Statement vs PreparedStatement]]**: SQL문 실행
- **ResultSet**: 결과 조회

### JDBC 는 특정  DB에서만 쓰이나?

- 아니다. 
- JDBC는 표준 인터페이스임. 
- DBMS마다 다른 JDBC 드라이버가 있다.

| DBMS           | 드라이버 이름                 | 드라이버 클래스                                       | 접속 URL 예시                                           |
| -------------- | ----------------------- | ---------------------------------------------- | --------------------------------------------------- |
| **MySQL**      | MySQL Connector/J       | `com.mysql.cj.jdbc.Driver`                     | `jdbc:mysql://localhost:3306/mydb`                  |
| **PostgreSQL** | PostgreSQL JDBC         | `org.postgresql.Driver`                        | `jdbc:postgresql://localhost:5432/mydb`             |
| **Oracle**     | Oracle JDBC Thin Driver | `oracle.jdbc.OracleDriver`                     | `jdbc:oracle:thin:@localhost:1521:xe`               |
| **SQL Server** | Microsoft JDBC Driver   | `com.microsoft.sqlserver.jdbc.SQLServerDriver` | `jdbc:sqlserver://localhost:1433;databaseName=mydb` |
| **SQLite**     | SQLite JDBC             | `org.sqlite.JDBC`                              | `jdbc:sqlite:mydb.db`                               |
| **MariaDB**    | MariaDB Connector/J     | `org.mariadb.jdbc.Driver`                      | `jdbc:mariadb://localhost:3306/mydb`                |