
### 일반 트리 자료구조 중 하나.

- 텍스트 자동 완성 기능처럼 문자열을 저장하고 탐색하는데 유용한 자료구조다. 

- 각 노드는 <Key, Value> 맵을 가지고 있다. 
- 여기서 Key 는 하나의 알파벳이 되고, value 는 그 Key 에 해당하는 자식노드들이 다 들어가있음. 
- 루트 노드는 특정 문자를 의미하지 않고 자식 노드만 가지고 있다. 

```
class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEnd;
}

class Trie {
    TrieNode root = new TrieNode();

    void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode()); // 메서드가 있음.
            node = node.children.get(c); // 현재 노드를 자식 노드로 바꿔줌. 
        }
        node.isEnd = true;
    }

    boolean search(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node = node.children.get(c);
            if (node == null) return false;
        }
        return node.isEnd;
    }
}
```

