
관련 개념: [[5. 제네릭]], [[List.remove]], [[객체 정렬 방법]], [[PriorityQueue]], [[TreeSet]]

- 동적 배열을 지원


#### 알아두어야할 메서드들

- list.add(E e)
- list.add(int index, E e) : 지정된 위치에 값을 넣을 수 있음 원래 있던것들은 뒤로 밀려나가는 구조
- list.get(int index)
- list.set(int index, E e) : 이게 값을 변경시키는 것. 
- list.remove(int index) : 특정 인덱스 제거  : 마찬가지로 뒤에있는 것들이 땡겨짐. 
- list.size()
- list.isEmpty()
- list.contains(Object o)
- list.indexOf(Object o) : 첫번째 일치하는 인덱스를 반환해준다. 인덱스를 반환해주는거임. 
- list.lastIndexOf : 마지막으로 일치하는 인덱스를 반환해준다.
- list.clear() : 리스트 전체 요소 제거

### 동적 배열은 add, remove 하면 계속 실시간으로 size 변하는거 주의

