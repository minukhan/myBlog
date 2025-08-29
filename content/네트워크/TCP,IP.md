> [!danger] TCP/IP(Transmission Control Protocol/Internet Protocol)이란?
> 서로 다른 기종의 컴퓨터들이 데이터를 주고받을 수 있도록 하는 표준 프로토콜

# 1. TCP/IP

IP(Internet Protocol)는 데이터 패킷의 주소 지정과 라우팅을 담당.
- 비연결성 프로토콜
	- **Best Effort** : 최선을 다해 데이터를 전송하겠지만, 목적지에 도달할 것이라는 보장은 없다.
	- 패킷이 손실되거나 순서가 바뀔 수도 있다

[[TCP|TCP(Transmission Control Protocol)]]는 IP 위에서 동작하며, 신뢰성 있는 데이터 전송을 보장
1. 연결 지향적
2. 오류 검출 및 복구가 가능
3. 흐름 제어
4. 혼잡 제어
5. 순서 보장

반면, UDP는 IP의 비연결성(Best Effort)을 그대로 따라간다.

> [!todo] TCP/IP는...
> 이 두 프로토콜이 함께 작동하여 인터넷의 기반을 형성하며, 다양한 기기와 네트워크 간에 안정적인 데이터 교환을 가능하게 해준다.

# 2. TCP/IP 4 Layer
## 링크 계층(Link Layer)
- **물리적 연결**과 **직접적인 데이터 전송**을 담당
- [f] 이더넷(IEEE 802.3), Wi-Fi(IEEE 802.11)
## 인터넷 계층(Internet Layer)
- **데이터 패킷**의 주소 지정, **라우팅** 담당
- [f] IP
## 전송 계층(Transport Layer)
- **종단간 통신**과 **데이터 전송의 신뢰성**을 보장
- [f] [[TCP]], UDP
## 응용 계층(Application Layer)
- **사용자와 가장 가까운 계층**으로, 실제 애플리케이션이 네트워크 서비스를 이용함
- [f] [[HTTP]], FTP, SMTP