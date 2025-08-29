
### 🔹 1. `LEFT(str, length)`

- 문자열의 **왼쪽에서 N글자** 추출

`SELECT LEFT('ABC12345', 3);  -- 결과: 'ABC'`

---

### 🔹 2. `RIGHT(str, length)`

- 문자열의 **오른쪽에서 N글자** 추출
    

`SELECT RIGHT('ABC12345', 4);  -- 결과: '2345'`

---

### 🔹 3. `SUBSTRING(str, start, length)`

- 특정 위치에서 시작해서 N글자 추출  
    (1부터 시작)
    

`SELECT SUBSTRING('ABC12345', 4, 3);  -- 결과: '123'`

---

### 🔹 4. `MID(str, start, length)`

- `SUBSTRING`과 동일
    

`SELECT MID('ABC12345', 4, 3);  -- 결과: '123'`

---

### 🔹 5. `INSTR(str, substr)`

- 부분 문자열이 처음 나타나는 **위치 반환** (못 찾으면 0)
    

`SELECT INSTR('hello world', 'o');  -- 결과: 5`

---

### 🔹 6. `REPLACE(str, from_str, to_str)`

- 문자열 치환
    
`SELECT REPLACE('a-b-c', '-', '/');  -- 결과: 'a/b/c'`

---

### 🔹 7. `CONCAT(str1, str2, ...)`

- 문자열을 합침
    
`SELECT CONCAT('cat', 'fish');  -- 결과: 'catfish'`

---

### 🔹 8. `TRIM(str)` / `LTRIM(str)` / `RTRIM(str)`

- 공백 제거

`
```
SELECT TRIM('   abc   ');    -- 결과: 'abc' 
SELECT LTRIM('   abc   ');   -- 결과: 'abc   ' 
SELECT RTRIM('   abc   ');   -- 결과: '   abc'
```