
## 행 기반 DB 

- 행에 속하는 모든 데이터를 한 덩어리(레코드)로 저장한다. 
- 주로 트랜잭션 처리같은 읽기/쓰기 작업이 행 단위로 많이 발생.

> 대표 DB : PostgreSQL, MySQL, Oracle DB 

```
[Name: Atom, CreatedAt: 2024-01-23]  
[Name: Prin, CreatedAt: 2024-02-01]  
[Name: Gosmdochee, CreatedAt: 2024-02-03]
```
## 열 기반 DB

```
[Name: Atom, Prin, Gosmdochee]  
[CreatedAt: 2024-01-23, 2024-02-01, 2024-02-03]
```
- 컬럼별로 데이터를 따로 모아서 저장한다. 
- 특정 컬럼 데이터만 빠르게 조회해야 할 때 사용한다. 
- 많은 데이터에서 일부 컬럼만 읽는 경우.
- 필요한 컬럼만 읽기때문에 I/O가 줄어들어서 빠르다. 

> **대표 DB:** BigQuery, Amazon Redshift, Snowflake, Apache Cassandra (Column-family DB)

|구분|행 기반 DB (Row-oriented)|열 기반 DB (Column-oriented)|
|---|---|---|
|**데이터 저장 단위**|행 단위 (한 레코드 전체 저장)|열 단위 (각 컬럼별로 데이터 저장)|
|**주 사용 용도**|트랜잭션 처리 (OLTP)|대용량 데이터 분석 (OLAP)|
|**데이터 읽기 방식**|한 행에 있는 모든 컬럼을 함께 읽음|필요한 컬럼 데이터만 골라서 읽음|
|**쓰기 성능**|행 전체를 한번에 쓰기에 유리|컬럼별로 분리되어 있어 행 전체 쓰기엔 비효율적|
|**압축 효율**|상대적으로 낮음|같은 컬럼 데이터 연속 저장으로 압축 효율 높음|
|**예시**|PostgreSQL, MySQL|BigQuery, Redshift, Snowflake|
### 결론

- **실시간 사용자 데이터 처리, 트랜잭션 많으면 → 행 기반 DB**
- **대규모 데이터 분석, 통계, 리포트, 일부 컬럼만 자주 조회하면 → 열 기반 DB**