> [!tldr] TCP란?
> 신뢰성 있는 연결 지향적 통신을 제공해주는 프로토콜, [[전송 계층(Transport Layer)]]에 위치하며 IP 위에서 동작한다.

관련 개념: [[UDP]], [[네트워크 계층(Network Layer)]], [[네트워크 CH2 애플리케이션 계층]], [[HTTP]]
## TCP 세그먼트 구조

다음과 같은 헤더 구조를 가짐
- **Source Port** : 16bit, 데이터를 보내는 애플리케이션의 포트 번호
- **Destination Port** : 16bit, 데이터를 받는 애플리케이션의 포트 번호
- **Sequence Number** : 32bit, 데이터 바이트의 순서 식별
- **Acknowledgment Number** : 32bit, 다음에 받길 기대하는 바이트의 시퀀스 번호
- **Data Offset** : 4bit, TCP 헤더 크기
- **Reserved** : 3bit, 나중을 위해 예약됨
- **Control Bits** : 각각 1bit
	- ==URG== : 긴급 데이터가 포함되어 있음을 표시 (Telnet 연결 등에서 Ctrl+C를 눌러 작업 중단 시)
	- ==ACK== : 확인 응답 번호 필드가 유효함을 표시
	- ==PSH== : 수신 측이 데이터를 즉시 상위 계층으로 전달해야 함을 표시 (SSH 등에서 키 입력을 즉시 전달하거나, HTTP 요청의 마지막 부분에서 사용)
	- ==RST== : 연결을 즉시 초기화(강제 종료)함을 표시 (정상적인 [[#4-way Handshake]] 없이 강제 연결 종료)
	- ==SYN== : 연결 설정 요청 및 초기 시퀀스 번호 동기화를 표시
	- ==FIN== : 정상 연결 종료 요청 ([[#4-way Handshake]]의 첫 번째와 세 번째 패킷에 사용)
- **Window Size** : 16bit, 수신 윈도우 크기를 지정
- **Checksum** : 16bit, 오류 검출용
- **Urgent Pointer** : 16bit, URG 플래그가 설정된 경우 사용
- **Options** : 가변 길이, 추가 기능들을 위한 옵션
- **Data** : 실제 전송하는 애플리케이션 데이터

![](https://i.imgur.com/fHfd87j.png)
#### 최대 세그먼트 크기(MSS : Maximum Segment Size)
> [!todo] 세그먼트로 모아 담을 수 있는 최대 데이터의 양은 MSS로 제한된다
- MSS를 결정하는 요소
	- 로컬 송신 호스트에 의해 전송될 수 있는 가장 큰 링크 계층 프레임의 길이
	  (최대 전송 단위(MTU: Maximum Transmission Unit))
	- TCP 세그먼트와 TCP/IP 헤더 길이(통상 40바이트)가 단일 링크 계층 프레임에 딱 맞도록 한다

## TCP 연결/종료
#### 3-way Handshake

> [!cite] TCP 연결을 **시작**하기 위해 사용하는 절차

1. **SYN** : 클라이언트가 서버에 연결 요청
	- [>] SYN flag = 1, initial sequence number : x
2. **SYN-ACK** : 서버가 클라이언트의 요청을 수락하고 응답
	- [>] SYN flag = 1, ACK flag = 1, initial sequence number : y, acknowledgment number : x+1
3. **ACK** : 클라이언트가 서버의 응답을 확인
	- [>] ACK flag = 1, acknowledgment number : y+1
#### 4-way Handshake

> [!cite] TCP 연결을 **종료**하기 위해 사용하는 절차

1. **FIN** : 클라이언트가 연결 종료를 요청
	- [>] FIN flag = 1
2. **ACK** : 서버가 클라이언트 종료 요청을 확인
3. **FIN** : 서버도 연결 종료 준비가 완료되면 종료 요청
	- [>] FIN flag = 1
4. **ACK** : 클라이언트가 서버의 종료 요청을 확인

이후 클라이언트는 일정 시간(TIME WAIT) 동안 상태를 유지한 후, 완전히 연결을 종료함

## 흐름 제어 (Flow Control)

> [!important] 흐름제어란?
> 송신자가 수신자가 처리할 수 있는 속도보다 빠르게 데이터를 전송하지 않도록 하는 메커니즘
#### 슬라이딩 윈도우(Sliding Window)
- 수신 윈도우(Receive Window) : 수신자가 처리할 수 있는 데이터의 양
- 송신 윈도우(Send Window) : 확인 응답 없이 보낼 수 있는 데이터의 양

### 오류 제어 방식(ARQ)
#### 정지-대기(Stop-and-Wait)
- 매번 **하나의 프레임**만 전송하고 ACK를 기다림
- ACK를 받은 후에 **다음 프레임**을 전송
- 간단하지만 네트워크 효율이 매우 낮음
#### Go-Back-N ARQ
- 송신자는 윈도우 크기(N) 내에서 여러 프레임을 연속적으로 전송 가능
- 수신자는 프레임을 **순서대로만** 받아들임
- 만약 프레임 i에 오류가 발생하면, 수신자는 프레임 **i-1까지 확인**했다는 ACK 전송
- 송신자는 ACK를 받지 못한 프레임 **i부터** 윈도우 안의 **모든 프레임을 재전송**
- TCP의 **기본 동작 방식**과 유사 (누적 ACK 사용)
#### 선택적 재전송(Selective Repeat ARQ)
- 오류가 발생한 프레임만 **선택적으로 재전송**
- 수신자는 순서에 상관없이 프레임을 받아서 **버퍼에 저장**
- 네트워크 대역폭을 효율적으로 사용하지만 복잡한 버퍼링 필요
- TCP의 **SACK(Selective Acknowledgment) 옵션**으로 구현

## 오류 제어(Error Control)
#### 체크섬(Checksum)
- 16비트 체크섬이 헤더에 포함되어있음
- 수신자는 체크섬을 계산해서 데이터가 손상되지 않았는지 확인
#### 확인 응답(Acknowledgment)
- 수신자는 성공적으로 받은 데이터에 대해 ACK를 보냄
- ACK 번호는 **"다음에 받길 기대하는 시퀀스 번호"**
- 무언가 잘못되었다면? 오류 검출이 됨
#### 타임아웃 (Timeout)
- 송신자는 데이터를 보낸 후 일정 시간 내에 ACK가 오지 않으면 패킷이 손실됐다고 가정하고 재전송
#### 중복 ACK & 빠른 재전송 (Duplicate ACK and Fast Retransmit)
- 수신자가 같은 **ACK를 3번** 보낼 경우, 송신자는 패킷 손실로 판단하고 타임아웃을 기다리지 않고 즉시 재전송

## 혼잡 제어(Congestion Control)

![](https://user-images.githubusercontent.com/86337233/211625829-2117ddf7-f325-4168-86cb-39d6bac3e2bd.png)

- TCP 패킷은 전송 중에 세그먼트로 분할 됨
- TCP는 패킷의 순서를 보장하기 때문에, 서버는 일정 개수의 세그먼트를 전송한 후 클라이언트로부터 ACK를 받아야 함
	- 서버가 각 세그먼트마다 ACK를 기다린다면, 클라이언트로부터 빈번한 ACK가 발생
	  -> 전송 시간 증가
	- 한 번에 너무 많은 세그먼트를 보내면 사용량이 많은 네트워크는 클라이언트가 세그먼트를 받을 수 없어 계속 ACK만 응답
	  -> 서버는 세그먼트를 계속 재전송 해야하는 문제 발생
- 즉.. **적절한 세그먼트 수를** 보내야 한다.
#### TCP Slow Start
> [!info] 개요
> 네트워크 성능에 대한 전송 속도를 높이는데 도움이 되는 알고리즘. 사용 가능한 대역폭을 감지하고 네트워크 연결 속도의 균형을 맞추는데 사용된다.

![](https://user-images.githubusercontent.com/86337233/211625835-f36ebe84-04de-4091-86a2-fcedfb50fe4f.png)

- 혼잡 창(cwnd)은 ACK를 수신하기 전에 소스가 네트워크를 통해 전송할 수 있는 데이터 양에 대한 상한을 결정
- Slow Start Threshold(ssthresh)는 Slow Start의 (비)활성화를 결정 함
- 새로운 연결이 이루어지면, cwnd는 하나의 TCP 데이터 또는 ACK 패킷으로 초기화되고, ACK를 기다림
- 해당 ACK가 수신되면, cwnd가 ssthresh보다 커질 때까지 cwnd가 증가
	- 증가 시, cwnd의 값이 2배씩 증가함
- 혼잡이 발생하면, Slow Start 종료