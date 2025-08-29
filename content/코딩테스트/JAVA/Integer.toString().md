
```
public static String toString(int i, int radix)
```

### 매개변수

- `i`: 변환할 정수 값 (10진수 정수)
- `radix`: 변환할 진법 (2 ~ 36 사이의 값)
    

---

### 📌 반환값

- 정수 `i`를 `radix` 진수로 표현한 문자열을 반환
- 만약 `radix`가 10이면 그냥 `i`의 10진수 문자열을 반환
- `radix` 범위를 벗어나면 자동으로 `10`진수로 처리됨

```
public class Main {
    public static void main(String[] args) {
        int num = 255;

        System.out.println(Integer.toString(num, 2));   // "11111111"  (2진수)
        System.out.println(Integer.toString(num, 8));   // "377"       (8진수)
        System.out.println(Integer.toString(num, 10));  // "255"       (10진수)
        System.out.println(Integer.toString(num, 16));  // "ff"        (16진수)
    }
}
```
