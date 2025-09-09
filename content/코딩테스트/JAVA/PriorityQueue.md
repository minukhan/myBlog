
관련 개념: [[ArrayList]], [[TreeSet]], [[객체 정렬 방법]], [[다익스트라 시간복잡도]], [[이진트리]]

- 우선순위 큐는 우선순위가 높은걸 빠르게 접근하기 좋음.
- 그러나 그 안에서 모든것들이 정렬되어있는게 아님.

## 우선순위 큐(`PriorityQueue`)는 **전체가 정렬된 자료구조가 아닙니다**

- 내부적으로 **힙(Heap)** 구조로 관리돼요.
- 힙은 **부모 노드가 자식 노드보다 우선순위가 높거나 낮은(최대힙/최소힙 기준)** 완전 이진 트리입니다.
- 그래서 **루트 노드(최상위 원소)만 항상 우선순위가 가장 높거나 낮은 상태**가 보장됩니다.
```
        1
      /   \
     3     5
    / \
   9   7

```
- 루트 `1`이 가장 작은 값(min-heap 기준)이고,
- 자식 노드들은 부모보다 크거나 같지만, 서로 간에는 순서가 보장되지 않습니다.

### PriorityQueue 우선순위큐

### 가장 일반적인 사용

```jsx
PriorityQueue<Integer> pq = new PriorityQueue<>();
```

- **정렬 기준**: 오름차순 (최소 힙)
- 작은 값이 먼저 나옴

```jsx
PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
```

- 정렬 기준: 내림차순 (최대 힙)
- 큰 값이 먼저 나옴

### 사용자 정의 Comparator

```jsx
PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> a - b); // 오름차순 (기본과 동일)
```

```jsx
PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> b - a); // 내림차순
```

### 객체 내부에서 Comparable 사용

```jsx
class Node implements Comparable<Node> {
    int x, y;
    Node(int x, int y) { this.x = x; this.y = y; }

    @Override
    public int compareTo(Node o) {
        return this.x - o.x; // x 기준 오름차순
    }
}

PriorityQueue<Node> pq = new PriorityQueue<>();
```

- 객체 내부에서 Comparable 인터페이스 구현해서 사용하는 방법인데
- 이거 사용해도 나쁘지않아여 근데 코드가 좀 길어지는 느낌이 있음

### 객체 타입에서 Comparator 전달 → 저는 이걸 주로 씁니다!!

```jsx

static Node{
		int y;
		int x;
		public Node(int y, int x){
				this.y = y;
				this.x = x;
		}
}

노드가 이렇게 되어있을때
 
PriorityQueue<Node> pq = new PriorityQueue<>(
    (o1, o2) -> o1.y - o2.y // 오름차순 정렬
);
```

- 위 코드는 y 를 기준으로 오름차순 정렬 하고싶을때.

```jsx
PriorityQueue<Node> pq = new PriorityQueue<>(
    (o1, o2) -> o1.x - o2.x // y 기준 오름차순
);
```

- x 를 기준으로 오름차순 정렬 하고싶을때.

### 만약 정렬 기준이 x로 정렬하고 같으면 y로 정렬하고싶다면?

```jsx
PriorityQueue<Node> pq = new PriorityQueue<>(
    (o1, o2) -> {
				if(o1.x != o2.x) return o1.x - o2.x;
				return o1.y - o2.y;
    }
);
```

### 같은 방법인데 참고할만한 코드.

```jsx
PriorityQueue<Node> pq = new PriorityQueue<>(
    (o1, o2) -> {
				if(o1.x != o2.x) return Integer.compare(o1.x, o2.x);
				return Integer.compare(o1.y, o2.y);
    }
);
```

### comparingInt 를 사용하면 더 간단하게 할 수 있음.

```jsx
PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(o -> o.x));
```

- `o -> o.x`로 비교 기준 지정
- 기본적으로 오름차순 정렬

```jsx
PriorityQueue<Node> pq =
    new PriorityQueue<>(
        Comparator.comparingInt((Node o) -> o.x).reversed()
    );
```

`.reversed()` 붙이면 내림차순