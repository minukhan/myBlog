## 🛠️ 언제 JOIN을 쓰고, 언제 서브쿼리를 쓰나?

| 상황                             | JOIN 사용        | 서브쿼리 사용        |
| ------------------------------ | -------------- | -------------- |
| 여러 테이블의 값을 **같이 보여줘야** 할 때     | ✅              | ❌              |
| 조건이나 필터링을 **단계적으로** 적용할 때      | ❌              | ✅              |
| 성능을 위해 실행 계획을 최적화하고 싶을 때       | ✅ (특히 큰 테이블 간) | ❌ (비효율적일 수 있음) |
| 코드를 **더 직관적이고 깔끔하게** 작성하고 싶을 때 | ❌ (복잡해짐)       | ✅ (간단할 때만)     |

---

## 🧠 정리 요약

| JOIN                    | 서브쿼리                   |
| ----------------------- | ---------------------- |
| 테이블 간 관계를 표현할 때 탁월      | 조건 필터나 단순 중첩 논리에 탁월    |
| 여러 테이블의 컬럼을 함께 보여줄 수 있음 | 단일 컬럼 또는 값 필터링에 주로 사용됨 |
| 복잡할 수 있지만 성능 최적화에 유리함   | 가독성 좋지만 비효율적일 수 있음     |

### Join

```
SELECT C.ITEM_ID, C.ITEM_NAME
FROM ITEM_INFO C
JOIN ITEM_TREE T ON C.ITEM_ID = T.ITEM_ID
JOIN ITEM_INFO P ON T.PARENT_ITEM_ID = P.ITEM_ID
WHERE P.RARITY = 'RARE';
```

### 서브쿼리 

```
SELECT ITEM_ID, ITEM_NAME
FROM ITEM_INFO
WHERE ITEM_ID IN (
    SELECT ITEM_ID
    FROM ITEM_TREE
    WHERE PARENT_ITEM_ID IN (
        SELECT ITEM_ID FROM ITEM_INFO WHERE RARITY = 'RARE'
    )
);

```