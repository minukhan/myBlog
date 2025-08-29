
### **컬럼 별칭(Alias)**

- `SELECT` 절에서 만든 별칭도 `GROUP BY`에서 쓸 수 있는 DBMS가 있음 (MySQL 등)
- 다만 모든 DBMS에서 지원하지는 않으니 주의

```
SELECT category AS cat
FROM product
GROUP BY cat;
```

### **표현식 (Expression)**

- 컬럼에 대한 계산식, 함수, CASE문 등 복잡한 식도 가능
- `GROUP BY` 대상에 표현식이 올 수 있음
```
GROUP BY YEAR(order_date)
GROUP BY (price / 10000) * 10000
GROUP BY CASE WHEN status = 'Y' THEN 'Yes' ELSE 'No' END
```

### 다중 조건 그룹화 

SQL에서는 `GROUP BY` 절에서 여러 컬럼이나 표현식을 묶을 때 **`AND`가 아니라 쉼표(`,`)**로 구분합니다.

```
GROUP BY category, YEAR(order_date), (price / 10000) * 10000
```