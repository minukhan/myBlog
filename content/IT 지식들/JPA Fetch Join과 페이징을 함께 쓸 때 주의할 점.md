
### 이 과정을 이해하려면 Fetch Join 의 동작 과정을 알아야함.

- Fetch Join 은 먼저 DB 에서 관련된 행 데이터들을 쭉 가져옴.
- 그러면 여기서 Fetch join 은 엔티티 객체로 파싱을 해주는 역할을 한다.

### Ex) 
- DB 결과 (row 기반):

| Product ID | Product Name | Category ID |
| ---------- | ------------ | ----------- |
| 1          | 상품 A         | 100         |
| 1          | 상품 A         | 101         |
| 1          | 상품 A         | 102         |
### 🟢 JPA에서 변환한 객체:

```
Product {
  id = 1,
  name = "상품 A",
  categories = [
    Category(id=100),
    Category(id=101),
    Category(id=102)
  ]
}

```

- 이런식으로 묶어서 전달해줌. 
### 근데 여기서 문제는 Page는 DB에서 원하는만큼 딱 잘라서 가져오는것.

- 근데 여기서 내가 원하는 갯수는 10개인데 DB에서 10개 가져온다고 하면 
- 정작 fetch join 에서 파싱을 하기때문에 실질적인 객체는 10개보다 적을 수 있음.
### Ex) 

| Product ID | Product Name | Category ID |
| ---------- | ------------ | ----------- |
| 1          | 상품 A         | 100         |
| 1          | 상품 A         | 101         |
| 1          | 상품 A         | 102         |
| 2          | 상품 B         | 103         |
| 2          | 상품 B         | 104         |
| 2          | 상품 B         | 105         |
| 2          | 상품 B         | 106         |
| 3          | 상품 C         | 107         |
- 이런식으로 오면 정작 3개밖에 안생기는거임
- 그래서 spring 에서는 모든 데이터를 가지오와서 딱 10개 객체 짤라서 줘야겠다 라고 생각한다고함.
- 이때 OOM (out of Memory) 가 터지는것. 이걸 조심하라고 말하는것. 
### 문제 요약

- `@OneToMany` 관계(예: Product ↔ ProductCategory)에서 `fetch join` + `페이징(Pageable)`을 같이 쓰면 **OutOfMemoryError(OOM)** 발생 가능
    
- 이유: **JPA가 페이징을 DB에서 수행하지 않고, 메모리에 모든 결과를 올려놓고 잘라냄**

### **Fetch Join + Collection → 결과가 중복된다 (카티션 프로덕트)**
### **JPA는 이 상태에서 DB 페이징 쿼리를 못 쓴다**


## 해결 방법

### 1: **Fetch Join 제거 + BatchSize 사용**
- `fetch join` 없이 Product만 페이징 조회한 뒤, 연관된 Category는 지연 로딩으로 가져오되, **N+1 문제를 피하기 위해** 배치 조회 사용

### 2. **두 단계 조회**
1. **Product만 페이징 쿼리로 먼저 조회**
2. **연관된 Category를 따로 fetch join 또는 배치 로딩으로 조회**