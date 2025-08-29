```

SELECT
  이름,
  점수,
  CASE
    WHEN 점수 >= 90 THEN 'A'
    WHEN 점수 >= 80 THEN 'B'
    WHEN 점수 >= 70 THEN 'C'
    ELSE 'F'
  END AS 등급
FROM 학생;


```

- `WHEN` → 조건
- `THEN` → 조건이 참일 때 반환할 값
- `ELSE` → 위 조건이 모두 거짓일 때 반환할 값 (선택적)
- `END` → `CASE` 문 종료