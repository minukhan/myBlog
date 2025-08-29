
## PERCENT_RANK 함수란?

`PERCENT_RANK`는 데이터 집합 내에서 특정 값의 상대적인 위치(백분위수 순위)를 계산하는 윈도우 함수(Window function)입니다.

## 기본 개념

- 값이 데이터 집합에서 가장 작으면 `PERCENT_RANK`는 0에 가깝습니다.
    
- 값이 데이터 집합에서 가장 크면 `PERCENT_RANK`는 1에 가깝습니다.
    
- 중간값은 0과 1 사이의 값으로 표시됩니다.

## 사용법

```
SELECT
  value,
  PERCENT_RANK() OVER (ORDER BY value) AS percent_rank
FROM
  your_table;
  
```