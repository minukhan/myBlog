
## 정리: `WITH`는 일회용 테이블 만들기

```
WITH RANKED AS (
    SELECT ID, SIZE, PERCENT_RANK() OVER (...) AS PR
    FROM ECOLI_DATA
)
```


이건 마치 이렇게 한 것과 같아요:

1. `ECOLI_DATA` 테이블을 기반으로
2. `PERCENT_RANK()`를 계산해서
3. 결과를 **RANKED라는 이름의 임시 테이블처럼 저장**
4. 그걸 나중 쿼리에서 `FROM RANKED`로 불러다 쓰는 것
## 하지만 진짜 테이블은 아님

- `RANKED`는 **디스크에 저장되지 않아요.**
- **결과 쿼리가 실행될 때만 메모리상에 잠깐 존재**하고,
- 쿼리 실행이 끝나면 사라져요.