
### GC(가비지 컬렉션, Garbage Collection)란?

- Java 는 개발자가 직접 메모리를 해제하지 않아도 되게 설계된 언어.
- 사용이 끝난 객체를 자동으로 메모리에서 제거해주는 기능이 GC

### GC 종류와 특징

- Serial GC
	- 단일 스레드, 단순함. CPU 1개
	- 최초의 가비지 컬렉터
- Parallel GC
	- Java 5 부터 8까지 default 가비지 컬렉터로 사용되었다고 함. 
	- 멀티스레드로 수행한다고 함.
	- 높은 처리량에 초점을 둔다고 함. 
-  Parallel Old GC 
	- 좀더 향상된 버전.
- CMS GC 
	- 자바 8까지 사용하다가 14에 완전히 제거
- G1 GC 
	- 자바 9부터 default 가비지 컬렉터
	- 기존 GC와는 다르게 힘을 어러개의 구역으로 나누어 Young, Old 를 구분했다고 함.
- ZGC 


## GC는 자동으로 선택될까?

Java는 시스템 스펙 보고 적절한 GC를 **자동으로 선택**합니다.  
기준은 다음과 같아요:

> ### ☑️ Server-Class Machine 조건

- CPU: 2개 이상 (vCPU 포함)
- 메모리: 2GB 이상

이 조건을 만족하면 **G1 GC** 사용  
조건을 만족하지 않으면 **Serial GC** 사용