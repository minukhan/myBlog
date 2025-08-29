
```
```

|메서드 호출 방식|동작|리턴값|주의사항|
|---|---|---|---|
|`list.remove(int index)`|해당 **인덱스 위치**의 요소 제거|제거된 요소|`List<Integer>`에서 헷갈리기 쉬움|
|`list.remove(Object o)`|리스트에서 해당 **값(Object)** 을 찾아 제거|`true` (성공 시) / `false` (실패 시)|첫 번째 일치 항목만 제거|
|`list.removeIf(Predicate)`|조건을 만족하는 모든 요소 제거|`true` (리스트 변경됨) / `false` (변화 없음)|여러 개 조건에 맞으면 전부 제거됨|
## 사용 예시

### 1. 인덱스로 제거

```
List<String> list = new ArrayList<>(List.of("A", "B", "C"));
list.remove(1);  // 인덱스 1 제거 → "B" 제거됨
```
`

### 2. 값(Object)으로 제거

```
List<String> list = new ArrayList<>(List.of("A", "B", "C"));
list.remove("B");  // 값 "B" 제거됨
```

### 3. `List<Integer>`의 혼동 사례

```
List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5));
nums.remove(2);  // 인덱스 2 제거 → 값 3 제거됨 ❗️
```
**✔ 값을 제거하고 싶다면:**
```
nums.remove(Integer.valueOf(2));  // 값 2 제거됨
```

---

### 4. 조건으로 제거 (`removeIf`)

```
List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5));
nums.removeIf(n -> n % 2 == 0);  // 짝수 모두 제거 → [1, 3, 5]
```


### 요약 
|의도|안전한 코드|
|---|---|
|특정 인덱스 제거|`list.remove(index);`|
|특정 값 제거 (Integer 등)|`list.remove(Integer.valueOf(value));`|
|조건에 맞는 값 제거|`list.removeIf(e -> 조건);`|