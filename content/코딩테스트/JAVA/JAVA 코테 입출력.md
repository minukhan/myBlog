
## **기본 입력**

Java에서 입력을 받는 방법은 3가지.

1. `Scanner` (간단하지만 느림)

```jsx
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // 한 줄에 하나씩 입력
        int n = sc.nextInt(); // 정수
        String s = sc.next(); // 단어
        double d = sc.nextDouble(); // 실수

        // 한 줄 전체 읽기
        sc.nextLine(); // 버퍼 비우기
        String line = sc.nextLine();

        System.out.println(n + " " + s + " " + d);
        System.out.println(line);

        sc.close();
    }
}
```

2. `BufferedReader` + `StringTokenizer` (빠름)

→ 저는 이거씁니다!! 대부분 이걸 사용하는게 좋을꺼에요.

```jsx
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        // 한 줄 읽기
        String str = br.readLine();
        System.out.println(str);

        // 공백 단위로 나누기
        StringTokenizer st = new StringTokenizer(br.readLine());
        int a = Integer.parseInt(st.nextToken());
        int b = Integer.parseInt(st.nextToken());
        System.out.println(a + b);
    }
}

```

```jsx
// 예: "1,2,3,4"
StringTokenizer st = new StringTokenizer(br.readLine(), ",");
```

→ 그리고 가끔 문제에서 공백으로 나눠져있는게 아니라 다른문자로 구분되어있을 때 있는데

→ 이런식으로 구분자를 바꿔서 사용하면 아주 좋습니다!

3. `BufferedReader` + `split` (빠름, 깔끔)

→ 근데 StringTokenizer 보다 느려요

```jsx
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        String[] input = br.readLine().split(" ");
        int a = Integer.parseInt(input[0]);
        int b = Integer.parseInt(input[1]);

        System.out.println(a + b);
    }
}
```