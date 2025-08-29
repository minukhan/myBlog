### **Custom Hook이란?**

Custom Hook은 말 그대로:

> **내가 직접 만드는 나만의 Hook**입니다.

React가 기본으로 제공하는 Hook (`useState`, `useEffect`, `useRef` 등)만으로는 특정 앱의 로직을 모두 커버하기 어렵거나, 중복되는 코드를 계속 써야 할 때가 있어요.

이럴 때!  
**공통 로직을 하나의 함수(Custom Hook)로 묶어서 재사용**하면 됩니다.

### 🔷 **정리**

```
import { useState, useEffect } from 'react';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

```

|Custom Hook이란?|
|---|
|✔️ 여러 컴포넌트에서 공통으로 쓰이는 로직을 재사용 가능하게 만드는 **나만의 Hook**|
|✔️ 이름은 꼭 `use`로 시작해야 함|
|✔️ 기본 Hook (`useState`, `useEffect` 등)을 조합해서 만듦|