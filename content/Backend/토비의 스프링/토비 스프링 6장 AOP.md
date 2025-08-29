
## 들어가기 전에

AOP : 스프링 기술 중에서 가장 이해하기 힘든 기술 중 하나 (3대 기술 중 하나)
AOP를 바르게 이용하려면 OOP 대체하려고 하는 것처럼 보이는 AOP라는 이름 뒤에 갖춰진, 등장배경과 스프링이 AOP를 도입한 이유, 적용했을 때의 장점이 무엇인지에 대한 충분한 이해 필요하다.

스프링에 적용된 가장 인기 있는 AOP의 적용 대상은 바로 **선언적 트랜잭션 기능**이다.
이런 것들에 대해 이제 차근 차근 알아보자.

## 6.1 트랙잭션 코드의 분리

위에서 트랜잭션 코드를 분리하기 위해 많은 노력을 했지만, 여전히 경계설정에 대한 코드가 찜찜하게 남아있다.
논리적으로도 트랜잭션의 경계는 분명 비즈니스 로직의 전후에 설정돼야 하는 것이 분명하지만, 우리는 깔끔한 코드를 위해 트랜잭션 코드를 분리할 것이다.

### 6.1.1 메소드 분리

메소드로 분리해보자.

위의 코드는 비즈니스 로직 코드를 사이에 두고 트랜잭션 시작과 종료를 담당하는 코드가 앞뒤에 위치하는 것을 볼 수 있다. 이 코드의 특징은 트랜잭션 경계설정의 코드와 비즈니스 로직 코드 간에 서로 주고받는 정보가 없다는 점이다. 이는 완벽히 독립적인 코드인데. 이 성격이 다른 코드를 두 개의 메소드로 분리할 수 있지 않을까?

```java
public void upgradeLevels() throws Exception {
	TransactionStatus status = this.transactionManager
    		.getTransaction(new DefaultTransactionDefinition());
    try{
    	upgradeLevelsInternal();
        this.transactionManager.commit(status);
    } catch (Exception e) {
    	this.transactionManager.rollback(status);
        throw e;
    }
}

// 분리된 비즈니스 로직 코드
private void upgradeLevelsInternal() {
	List<User> users = userDao.getAll();
    for(User user : users) {
    	if(canUpgradeLevel(user)){
        	upgradeLevel(user);
        }
    }
}
```

코드를 분리하니 훨씬 깔끔해졌다.

### 6.1.2 DI를 이용한 클래스의 분리

메소드로 분리하여 한결 깔끔해졌지만 여전히 트랜잭션 담당 기술적인 코드가 UserService 안에 존재한다.
이를 **클래스**로 뽑아내어 분리할 수 있다.

#### DI 적용을 이용한 트랜잭션 분리
트랜잭션 코드를 어떻게든 해서 UserService 밖으로 빼버리면 UserService 클래스를 직접 사용하는 클라이언트는 트랜잭션 기능이 빠진 UserService를 사용하게 된다. 이는 구체적인 구현 클래스를 직접 참조하는 경우의 전형적인 단점이다.
-> 직접 사용하는 것이 문제가 된다면 간접적으로 사용해보자. 실제 사용할 오브젝트의 클래스 전체는 감춘 채 **인터페이스를 통해 간접으로 접근**하는 것이다.

![](https://i.imgur.com/mhb75N6.png)

그림 6-2를 보면 UserService 인터페이스 도입함으로써 클라이언트와 UserService 구현 클래스의 직접 결합을 막아주고, 유연한 확장을 가능하게 해준다.

보통 DI를 통해 하나의 구현 클래스를 선택해서 받는 형태이지만, 꼭 그럴 필요는 없다.
한 번에 *두 개의 구현 클래스를 동시에 사용하는 트랜잭션*을 적용시킬 수 있다.

![](https://i.imgur.com/DAbvN6K.png)

그림 6-3을 보면 UserService 인터페이스에서 클라이언트가 사용할 로직만, UserServiceTx에서는 비즈니스 트랜잭션 처리만 가능하게 할 수 있다.

코드를 보면
```java
//UserService인터페이스 생성
public interface UserService {
	void add(User user);
    void upgradeLevels();
}

// 트랜잭션 코드를 제거한 구현클래스 생성
// 적어도 비즈니스 로직에 대해서는 UserServiceTx가 아무런 관여 하지 않음
public class UserServiceImpl implements UserService {
	UserDao userDao;
    MailSender mailSender;
    
    private void upgradeLevelsInternal() {
	List<User> users = userDao.getAll();
    for(User user : users) {
    	if(canUpgradeLevel(user)){
        	upgradeLevel(user);
        }
    }
}

// 비즈니스 트랜잭션 처리를 담은 UserServiceTx
public class UserServiceTx implements UserService {
	UserService userService;
    PlatformTransactionManager transactionManager;
    
    public void setTransactionManager(
    		PlatformTransactionManager transactionManager) {
    	this.transactionManager = transactionManager;        
    }
    
    public void setUserService(UserService userService) {
    	this.userService = userService;
    }
    
    public void add(User user) {
		userService.add(user);
	}

	public void upgradeLevels() {
    	TransactionStatus status = this.transactionManager
        		.getTransaction(new DefaultTransactionDeifinition());
        try {
			userService.upgradeLevels();
            
            this.transactionManager.commit(status);
       } catch (RuntimeException e) {
       		this.transactionManager.rollback(status);
            throw e;
       }
	}
}
```

#### 트랜잭션 적용을 위한 DI 설정 (p.409)

수정한 거에 맞춰서 설정파일을 수정해주면 되고
이때
1. 클라이언트가 UserServcie라는 인터페이스를 통해 사용자 관리 로직을 이용하려고 할 때 먼저 트랜잭션을 담당하는 오브젝트가 사용돼서 트랜잭션에 관련된 작업을 진행해주고
2. 실제 사용자 관리 로직을 담은 오브젝트가 이후에 호출돼서 비즈니스 로직에 관련된 작업을 수행하도록 만든다.

#### 트랜잭션 분리에 따른 테스트 수정 (p.410)

테스트 코드에서도 이에 맞춰 수정해줘야 한다.

#### 트랜잭션 경계설정 코드 분리의 장점 (p.412)

1. 비즈니스 로직을 담당하고 있는 UserServiceImpl의 코드를 작성할 때는 트랜잭션과 같은 기술적인 내용에는 전혀 신경쓰지 않아도 된다. 트랜잭션의 적용이 필요한지도 신경 쓰지 않아도 된다.
2. 비즈니스 로직에 대한 테스트를 손쉽게 만들어낼 수 있다.

이제 장점 2번에 대한 내용을 좀 더 자세하게 알아볼 건데,

## 6.2 고립된 단위 테스트

가장 편하고 좋은 테스트 방법은 작은 단위로 쪼개서 테스트하는 것이다.
작은 단위의 테스트가 좋은 이유는 테스트가 실패했을 때 그 원인을 찾기 쉽기 때문이다.
하지만 작은 단위로 테스트하고 싶어도 테스트 대상이 다른 오브젝트와 환경에 의존하고 있다면 그럴 수 없다.

### 6.2.1 복잡한 의존관계 속의 테스트

UserService를 테스트 스텁, 목 오브젝트 등을 사용하여 분리하지 않았을 때에는 테스트가 한번 실행될 때마다 아래의 모든 요소들이 동작해야했다.
![](https://i.imgur.com/0dKhREL.png)

 **세 가지의 의존관계를 갖는 오브젝트**들 또한 자신의 코드만 실행하는 것이 아닌, **또 다른 요소들에 의존**하고 있으므로 *테스트 한번에 많은 오브젝트, 서버, 네트워크까지 테스트하고 있는 셈* 이다. 
 이렇게 되면 오류가 발생했을 때, **무엇이 오류를 발생시키는지 발견하는데 불필요한 시간을 낭비**해야할 수도 있다.

따라서, 우리는 이러한 문제들을 해결하기 위해 5장에서 DummyMailSender라는 **테스트 스텁**과 MockMailSender라는 **목 오브젝트**를 사용해보았던 것이다. 이를 UserDao에도 적용해볼 것이다.

### 6.2.2 테스트 대상 오브젝트 고립시키기

이미 트랜잭션 코드를 독립시켰기 때문에 고립된 테스트가 가능하도록 UserService를 재구성해보면 다음과 같은 구조가 될 것이다.

#### 테스트를 위한 UserServiceImpl 고립 (p.415)

![](https://i.imgur.com/UqDMQ7m.png)

이제 UserServiceImpl에 대한 테스트가 진행될 때 사전에 테스트를 위해 준비된 동작만 하도록 만든 두 개의 목 오브젝트에만 의존하는, 완벽하게 고립된 테스트 대상으로 만들 수 있다.
UserDao는 단지 테스트 대상의 코드가 정상적으로 수행되도록 도와주기만 하는 스텁이 아니라, upgradeLevels()의 테스트 결과를 검증하기 위해 목 오브젝트로 만들었다.

#### 고립된 단위 테스트 활용 (p.417)
위의 고립된 단위 테스트 방법을 직접 적용해보자.
밑에 코드와 단계를 정리해놨으니 한 번 읽어보길 바란다.

```java
@Test
public void upgradeLevels() throws Exception {
	userDao.deleteAll();
    for(User user : users) userDao.add(user); //DB데이터 받기
    
    MockMailSender mockMailSender = new MockMailSender();
    userServiceImpl.setMailSender(mockMailSender); // 목 오브젝트 DI
    
    userService.upgradeLevels();
    
    //UserDao를 이용해 DB반영 확인
    checkLevelUpgraded(users.get(0), false);
    checkLevelUpgraded(users.get(1), true);
    checkLevelUpgraded(users.get(2), false);
    checkLevelUpgraded(users.get(3), true);
    checkLevelUpgraded(users.get(4), false);
    
    //목 오브젝트를 통한 메일발송 요청 확인
    List<String> request = mockMailSender.getRequests(); //요청왔는지 확인
    assertThat(request.size(), is(2));
    assertThat(request.get(0), is(users.get(1), getEmail()));
    assertThat(request.get(1), is(users.get(3), getEmail()));
}
```

테스트는 다섯 단계의 작업으로 구성된다.
	1. 테스트 실행 중에 **UserDao**를 통해 가져올 **테스트용 정보를 DB에 넣음**  
	2. 메일 발송 여부를 확인하기 위해 **MailSender 목 오브젝트를 DI**해줌  
	3. **실제 테스트 대상**인 **userService의 메소드를 실행**  
	4. **UserDao**를 이용해 **DB에서 결과를 가져와 확인**  
	5. **목 오브젝트**를 통해 **UserService에 의한 메일 발송이 있었는지 확인**

#### UserDao 목 오브젝트 (p.418)
UserDao를 의존하고 있는 다른 테스트 방식도 목 오브젝트를 만들어 적용해보자.

```java
//업그레이드 후보가 되는 사용자 목록을 가져오는 getAll()은 리턴값이 없으므로 빈 메소드로 만듦
//update()는 업그레이드를 통해 DB에 반영이 되어야 하므로 목 오브젝트로 만듦

// 위 두가지 형태로 동작하는 테스트 대역 MockUserDao를 생성
static class MockUserDao implements UserDao {
	private List<User> user;
    private List<User> updated = new ArrayList();
    
    private MockUserDao(List<User> users) {
    	this.users = users;
    }
    
    public List<User> getUpdated() {
    	return this.updated;
    }
    
    //스텁 기능 제공
    public List<User> getAll() {
    	return this.users;
    }
    
    //목 오브젝트 기능 제공
    public void update(User user) {
    	updated.add(user);
    }
    
    //테스트에 사용하지않지만 구현해야하는 클래스들
    public void add(User user) { throw new UnsupportedOperationException(); }
    public void deleteAll() { throw new UnsupportedOperationException(); }
    public User get(String id) { throw new UnsupportedOperationException(); }
    public int getCount() { throw new UnsupportedOperationException(); }
}
```

userDao.getAll() 메소드 기능을 위해서 UserDao에는 DB에서 읽어온 것처럼 미리 준비된 사용자 목록을 제공해 줘야 한다. 따라서, 스텁으로서 동작하는 UserDao 타입의 테스트 대역이 필요하다.

update() 메소드의 경우에는 upgradesLevels() 핵심 로직인 '전체 사용자 중에서 업글 대상자는 레벨을 변경해준다'에서 변경에 해당하는 부분을 검증하는 중요 기능이므로 목오브젝트로서 동작하는 UserDao 타입의 테스트 대역이 필요하다.

이 클래스의 이름을 이 책에서는 MockUserDao로 하였고 밑에 코드는 읽어보면 좋을 것 같다.

#### 테스트 수행 성능의 향상 (p.422)

고립된 테스트를 하면 테스트가 다른 의존 대상에 영향을 받을 경우를 대비해 복잡하게 준비할 필요도 없고, 테스트 수행 성능도 크게 향상되므로 좋다.

### 6.2.3 단위 테스트와 통합 테스트

단위 테스트의 단위는 사람마다 기준이 달라서 경계가 애매모호하다.
책에서는 다음과 같이 명시되는데,

> [! note] Test
> 단위 테스트 : 테스트 대상 클래스를 목 오브젝트 등의 **테스트 대역을 이용**해 **의존 오브젝트나 외부의 리소스를 사용하지 않도록 고립**시켜서 테스트 하는 것
> 
> 통합 테스트 : 두 개 이상의 **성격이나 계층이 다른 오브젝트가 연동**하도록 만들어 테스트하거나, 또는 **외부의 DB나 파일, 서비스 등의 리소스가 참여**하는 테스트

단위 테스트와 통합 테스트 중에서 어떤 방법 쓸 지에 대한 가이드라인은 한 번 직접 읽어봐라.

근데 여기서 말하는 단위 테스트와 통합 테스트는 모두 개발자가 스스로 자신이 만든 코드를 테스트하기 위해 만드는 개발자 테스트이다.
전문 테스터나 고객에 의해 진행되는 기능 테스트는 다른 관점에서 생각해야한다. 테스트는 코드가 작성되고 빠르게 진행되는 편이 좋으므로 TDD를 사용하는 것이 좋다.

또한, 스프링이 지지하고 권장하는 깔끔하고 유연한 코드를 만들다보면 테스트도 그만큼 만들기 쉬워지고, 테스트는 다시 코드의 품질을 높여주고, 리팩토링과 개선을 쉽게 만들어준다. 항상 이 점을 명시하며 코드를 짜자.

### 6.2.4 목 프레임워크

단위 테스트가 많은 장점이 존재하지만 이를 위해 **번거롭게 목 오브젝트를 작성해주어야 한다.** 
->  이를 편리하게 작성하도록 도와주는 다양한 **목 오브젝트 지원 프레임워크가 있다.**

그 다양한 목 오브젝트 프레임워크 중에서도 가장 유명한
#### Mockito 프레임워크 (p.426)
Mockito 프레임워크는 사용하기도 편리하고, 코드도 직관적이다.

목 오브젝트를 위해 목 클래스를 일일히 준비해둘 필요없이 **간단한 메소드 호출만으로** 특정 인터페이스를 구현한 테스트용 목 오브젝트를 만들 수 있다.

```java
// Mockito 프레임워크는 다음과 같이 스태틱메소드를 한 번 호출해주면 만들어진다.
UserDao mockUserDao = mock(UserDao.class);

// 사용자 목록을 리턴하도록 스텁 기능을 추가하기 위해 다음과 같이 코드를 작성하면 된다
when(mockUserDao.getAll()).thenReturn(this.users);

// 테스트 진행중 메소드가 호출되었는지 확인하고 싶다면 다음과 같은 검증 코드를 넣어주면 된다
verify(mockUserDao, times(2)).update(any(User.class)); //2는 예상 호출 횟수
```

Mockito를 적용한 테스트 코드는 사용해 봤다고 믿고 넘어가자.

```java
@Test
public void mockUpgradeLevels() throws Exception {
	UserServiceImpl userServiceImpl = new UserServiceImpl();
    
    //Mockito 프레임워크를 이용해 오브젝트 생성 후 사용자목록 리턴 테스트 스텁 생성
    UserDao mockUserDao = mock(UserDao.class); //오브젝트 생성
    when(mockUserDao.getAll()).thenReturn(this.users);//테스트 스텁 생성
    userServiceImpl.setUserDao(mockUserDao): //DI해주기
    
    MailSender mockMailSender = mock(MailSender.class);
    userServiceImpl.setMailSender(mockMailSender);
    
    userServiceImpl.upgradeLevels();
    
    //어떤 메소드가 몇번 호출됐는지, 피라미터는 무엇인지 확인 가능
    verify(mockUserDao, times(2)).update(any(User.class));
    verify(mockUserDao, times(2)).update(any(User.class));
    verify(mockUserDao).update(users.get(1));
    assertThat(users.get(1).getLevel(), is(Level.SILVER));
    verify(mockUserDao).update(users.get(3));
    assertThat(users.get(3).getLevel(), is(Level.GOLD));
    
    ArgumentCaptor<SimpleMailMessage> mailMessageArg = 
    	ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mockMailSender, times(2)).send(mailMessageArg.capture()); //캡쳐도 가능
    List<SimpleMailMessage> mailMessages = mailMessageArg.getAllValues();
    assertThat(mailMessages.get(0).getTo()[0], is(users.get(1).getEmail()));
    assertThat(mailMessages.get(1).getTo()[0], is(users.get(3).getEmail()));
}
```


## 6.3 다이내믹 프록시와 팩토리 빈

### 6.3.1 프록시와 프록시 패턴, 데코레이터 패턴

위에서 트랜잭션 경계설정 코드와 비즈니스 로직을 분리했던 기법을 다시 검토해보자.
- 부가기능과 핵심기능을 분리하여 각각 클래스로 생성한다.
- 부가기능 외의 나머지 모든 기능은 핵심기능을 가진 클래스로 위임한다.
이때, **핵심기능은 부가기능을 가진 클래스의 존재를 모른다.** -> 의존하지 않는 상태

![](https://i.imgur.com/npCoZqa.png)

그림 6-7은 전략 패턴 통해서 정말 분리만 했을 뿐이고

![](https://i.imgur.com/YU84BMO.png)

그림 6-8에서는 부가기능 전부를 핵심코드가 담긴 클래스에서 독립시킨 것이다.

문제는 이렇게 구성해도 클라이언트가 핵심기능 가진 클래스를 직접 사용해버리면 부가기능이 적용될 기회가 없다는 것이다.

![](https://i.imgur.com/QXMsyYP.png)

따라서, 그림 6-9처럼 부가기능을 **마치 자신이 핵심기능을 가진 클래스인 것처럼 꾸며서 클라이언트가 자신을 거쳐서 핵심기능을 사용하도록 만들어야 한다.** 이러면 부가기능을 통해 핵심기능 이용이 가능해진다.

이렇게 마치 자신이 클라이언트가 사용하려고 하는 실제 대상인 것 처럼 위장해서 클라이언트 요청을 받아주는 것을 대리자/대리인 같은 역할을 한다고 해서 **프록시** 라 하고
프록시를 통해 최종적으로 요청을 위임받아 처리하는 실제 오브젝트를 **타깃 / 실체**라 부른다.

![](https://i.imgur.com/dut1GYM.png)

##### 프록시의 특징과 사용목적 정리
- 특징
	- 타깃과 같은 인터페이스를 구현한다
	- 프록시가 타깃을 제어할 수 있는 위치에 있다
- 사용목적 (두 가지로 구분 가능)
	- 클라이언트가 타깃에 접근하는 방법을 제어하기 위해서 -> 프록시 패턴
	- 타깃에 부가적인 기능을 부여해주기 위해서 -> 데코레이터 패턴

#### 데코레이터 패턴 (p.431)
**타깃**에 **부가적인 기능**을 **런타임 시 다이나믹하게 부여**해주기 위해 프록시를 사용하는 패턴이다.
여기서 다이나믹 하다는 것은 컴파일 시점, 즉 코드상에서는 어떤 방법과 순서로 프록시와 타깃이 연결되어 사용되는지 정해져 있지 않다는 뜻이다.

- 어떤 방법과 순서로 프록시와 타깃이 연결되어 사용되는지 정해져있지 않음  
- 프록시가 꼭 한 개로 제한되지않고 직접 타깃을 사용하도록 고정시킬 필요도 없음  
  -> 프록시를 단계적으로 위임하는 구조를 만들어 여러 개의 부가기능 사용 가능
  
![](https://i.imgur.com/bCRDYs3.png)

그림 6-11을 보면 소스코드를 출력하는 핵심기능이 있다고 해보자.
이 클래스에 데코레이터 개념을 부여해서 타깃과 같은 인터페이스를 구현하는 프록시를 만들 수 있는데 사진의 라인넘버 데코레이터, 컬러 데코레이터, 페이징 데코레이터 등등 부가적인 기능을 각각 프록시로 만들어두고 런타임 시에 이를 적절한 순서로 조합해서 사용하면 된다.

또한 **타깃의 코드와 클라이언트가 호출하는 방법을 변경하지 않고 새로운 기능 추가가 가능하다.**

코드 예시는 읽어보는 게 좋겠다.

#### 프록시 패턴 (p.433)
프록시와 프록시 패턴은 구분할 필요가 있다!

> [! example] proxy vs proxy pattern
> 프록시 : 클라이언트와 사용 대상 사이 **대리 역할**을 맡은 오브젝트를 두는 방법
> 
> 프록시 패턴 : 타깃에 대한 **접근방법을 제어**하려는 목적을 가진 경우
> 
 
타깃 오브젝트를 생성하기가 복잡하거나 당장 필요하지 않은 경우, 꼭 필요한 시점까지 생성하지 않는 편이 좋은데, 이때 **프록시 패턴을 적용**하여 **실제 타깃 오브젝트 대신 프록시를 넘겨주는 것** 이다.
그 후, 프록시의 메소드를 통해 타깃을 사용하려고 시도하면, 그때 프록시가 타깃 오브젝트를 생성하고 요청을 위임해주는 식으로 진행된다.

즉, 타깃의 *기능 자체에는 관여하지 않으면서 접근 방식을 제어*한다.


### 6.3.2 다이내믹 프록시

프록시의 기능은 좋으나 부가기능을 추가하고 싶을 때 마다 프록시를 만드는건 상당히 번거롭다. (마치 목 오브젝트를 위해 목 클래스를 만들어야 하는 것처럼 매번 새로운 클래스 정의하고 모든 메소드 일일이 구현해서 위임하는 코드 넣어줘야 함)  
- **자바에는 프록시를 손쉽게 만들 수 있도록 지원해주는 클래스가 존재**

#### 프록시의 구성과 프록시 작성의 문제점 (p.435)
프록시 코드를 한 번 살펴보자.

```java
public class UserServiceTx implements UserService {
	UserService userService; // 타깃 오브젝트
    ...
    
    //메소드 구현과 위임
    public void add(User user){
    	this.userService.add(user);
    }
    
    public void upgradeLevels() { //메소드 구현
    	//부가기능 수행
    	TransactionStatus status = this.transactionManager
        		.getTransaction(new DefaultTransactionDefinition());
        try {
        	
            userService.upgradeLevels(); //위임
            
            //부가기능 수행
            this.transactionManager.commit(status);
        } catch (RuntimeException e) {
        	this.transactionManager.rollback(status);
            throw e;
        }
    }
}
```

위 코드에서 우리는 다음과 같은 문제점을 발견할 수 있다.
	1. 타깃의 **인터페이스를 구현하고 위임하는 코드를 작성하기가 번거롭다.**
	     메소드가 많을수록 더욱 번거로운 작업이 될 것이다.
	 2. 부가기능 **코드가 중복될 가능성이 높다.**

- [9] 이러한 문제를 해결하기 위해 JDK의 다이내믹 프록시를 사용하는 것!!

#### 리플렉션 (p.436)
리플렉션은 **자바의 코드 자체를 추상화해서 접근하도록 만든 것**이다.
- 다이내믹 프록시는 **리플렉션 기능**을 이용해서 프록시를 만들어 준다.
- **'클래스이름.class'** 혹은 **getClass()** 를 호출하여 Class타입의 오브젝트를 가져온다.

```java
Method lengthMethod = String.class.getMethod("length");
// String이 가진 메소드중 "length"라는 이름을 가진 파라미터가 없는 메소드의 정보를 가져옴

//invoke()로 메소드를 실행시킬 수 있음
int length = lengthMethod.invoke(name); //int length = name.length();
```

간단한 리플렉션 학습 테스트를 만들어 보자.

```java
package springbook.learningtest.jdk;
...
public class ReflectionTest {
	@Test
    public void invokeMethod() throws Exception {
    	String name = "Spring";
        
        //length()
        assertThat(name.length(), is(6));
        
        //String클래스에서 "length"라는 이름을 가진 파라미터가 없는 메소드의 정보를 가져옴
        Method lengthMethod = String.class.getMethod("length");
        //lengthMethod.invoke(name) == name.length()
        assertThat((Integer)lengthMethod.invoke(name), is(6));
        
        //charAt()
        assertThat(name.charAt(0), is('S'));
        
        //String클래스에서 "charAt"이라는 이름을 가진 int타입 변수를 파라미터로 가지는 메소드를 가져옴
        Method charAtMethod = String.class.getMethod("charAt",int.class);
        //(Character)charAtMethod.invoke(name, 0) == name.charAt(0)
        assertThat((Character)charAtMethod.invoke(name, 0), is('S'));
    }
}
```

이는 String 클래스의 length() 메소드와 charAt() 메소드를 코드에서 직접 호출하는 방법과,  Method를 이용해 리플렉션 방식으로 호출하는 방법을 비교한 것이다.

#### 프록시 클래스 (p.439)
이제 프록시를 만들어보자.
먼저 간단한 타깃 클래스와 인터페이스를 정의해보면

```java
interface Hello {
	String sayHello(String name);
    String sayHi(String name);
    String sayThankYou(String name);
}

public class HelloTarget implements Hello {
	public String sayHello(String name) {
    	return "Hello " + name;
    }
    
    public String sayHi(String name) {
    	return "Hi " + name;
    }
    
    public String sayThankYou(String name) {
    	return "Thank You " + name;
    }
}
```

6-18, 6-19를 통해 확인해볼 수 있고 6-20이 Hello 인터페이스를 통해 HelloTarget 오브젝트를 사용하는 클라이언트 역할 테스트를 만든 것이다.

```java
@Test
public void simpleProxy() {
	Hello hello = new HelloTarget();
    assertThat(hello.sayHello("Toby"), is("Hello Toby"));
    assertThat(hello.sayHi("Toby"), is("Hi Toby"));
    assertThat(hello.sayThankYou("Toby"), is("Thank You Toby"));
}
```
6-20

여기서 이제 인터페이스를 구현한 프록시를 만들면
```java
public class HelloUppercase implements Hello {
	Hello hello; // 위임할 타깃 오브젝트. 인터페이스로 접근한다
    
    public HelloUppercase(Hello hello){
    	this.hello = hello;
    }
    
    public String sayHello(String name) {
    	return hello.sayHello(name).toUpperCase(); //위임과 부가기능 적용
    }
    
    public String sayHi(String name) {
    	return hello.sayHi(name).toUpperCase(); //위임과 부가기능 적용
    }
    
    public String sayThankYou(String name) {
    	return hello.sayThankYou(name).toUpperCase(); //위임과 부가기능 적용
    }
}


//HelloUppercase 프록시 테스트
HelloporxiedHello = new HelloUppercase(new HelloTarget());
assertThat(proxiedHello.sayHello("Toby"), is("HELLO TOBY"));
assertThat(proxiedHello.sayHi("Toby"), is("HI TOBY"));
assertThat(proxiedHello.sayThankYou("Toby") is("THANK YOU TOBY"));
```

6-21처럼 데코레이터 패턴을 적용한 (리턴하는 문자 모두 대문자로 바꿔주는 부가기능) 프록시가 완성된다.
이때 프록시는 아까 말한 두 가지 문제점을 다 포함하고 있다.
인터페이스의 모든 메소드를 구현하여 위임하도록 코드를 만들어야 하고, 부가기능인 리턴 값을 대문자로 바꾸는 기능이 모든 메소드에 중복돼서 나타난다.

따라서, 이를 다이내믹 프록시를 이용하여 만들어보자.

#### 다이내믹 프록시 적용 (p.441)
먼저, 다이내믹 프록시의 구조는 아래와 같다.

![](https://i.imgur.com/qy39G1F.png)

- **다이나믹 프록시 오브젝트는 타깃의 인터페이스와 같은 타입**으로 만들어진다.
- **부가기능 제공 코드**는 **프록시 오브젝트**와 독립적으로 **InvocationHandler를 구현한 오브젝트에 담는다.**  
    - **InvocationHandler**는 우리가 위에서 사용해본 **invoke()만 가진 인터페이스**
- 짧게 과정을 설명하자면 : 프록시 팩토리에 프록시 요청 -> 프록시 생성 -> 프록시 처리요청 -> 타깃에 위임(invoke()로 타깃의 기능 사용) -> 결과 리턴

다이내믹 프록시 생성 코드

```java
//InvocationHandlder 구현 클래스
public class UppercaseHandler implements InvocationHandler {
	Hello target;
    
    public UppercaseHandler(Hello target) {
    	this.target = target;
    }
    
    public Object invoke(Object proxy, Method method, Object[] args)
    		throws Throwable {
    	String ret = (String)method.invoke(target, args); //타깃으로 위임
        return ret.toUpperCase(); //부가기능 제공
    }
}

//프록시 생성
Hello proxiedHello = (Hello)Proxy.newProxyInstance(
		getClass().getClassLoader(), //동적으로 생성되는 다이나믹 프록시 클래스의 로딩에 사용할 클래스 로더
        new Class[] { Hello.class }, //구현할 인터페이스
        new UppercaseHandler(new HelloTarget())); //부가기능과 위임코드를 담은 InvocationHandler
```

6-23 6-24

작성한 코드를 보면 앞에서 만든 프록시 클래스보다 코드의 양도 줄지 않은 것 같고....  
오히려 *더 복잡하게 보인다.* 
**다이나믹 프록시를 굳이 만들어야할 필요가 있을까?**

#### 다이내믹 프록시의 확장 (p.444)

그렇다면
Hello 인터페이스의 **메소드가 3개가 아닌 30개**로 늘어나면 어떻게 될까?
- 기존의 클래스로 직접 구현한 프록시는 **코드를 그만큼 추가**해야한다
- 다이나믹 프록시로 생성하는 코드는 **수정이 필요가 없다!**  
    - invoke()에서 모두 처리를 하기 때문  

지금까지의 메소드와 **다른 리턴타입을 갖는 메소드**가 생성된다면 어떨까?
- 기존의 클래스는 강제로 캐스팅을 하여 메소드를 처리하므로 **런타임 시 캐스팅 오류 발생**
- 다이나믹 프록시는 **리턴타입을 확인해서 받을 수 있음**  
    - InvocationHandler는 타깃의 종류와 상관없이 적용이 가능

결론적으로 타입에 상관 없이 처리하는 다이내믹 프록시로 확장이 가능해진다.
```java
//InvocationHandlder 구현 클래스
public class UppercaseHandler implements InvocationHandler {
	Object target; //모든 타입을 받을 수 있도록 Object로 선언
    
    private UppercaseHandler(Object target) {
    	this.target = target;
    }
    
    public Object invoke(Object proxy, Method method, Object[] args)
    		throws Throwable {
    	Object ret = method.invoke(target, args); //타깃으로 위임
        if(ret instanceof String) { //String인 경우에만 대문자로 변경하도록 수정
        	return ((String)ret).toUpperCase();
        }
        else {
        	return ret;
        }
    }
}
```

### 6.3.3 다이내믹 프록시를 이용한 트랜잭션 부가기능

이제 UserServiceTx를 다이나믹 프록시 방식으로 변경해보자.
아까 위의 UserServiceTx처럼 프록시 클래스를 일일이 구현하는 것은 큰 부담이 된다.
따라서, 트랜잭션 부가기능을 제공하는 다이내믹 프록시를 만들어 적용하는 방법이 효율적이다.

#### 트랜잭션 InvocationHandler (p.446)

```java
public class TransactionHandler implements InvocationHandler {
	private Object target; //
    private PlatformTransactionManager transactionManager; // 트랜잭션 매니저
    private String pattern; // 트랜잭션을 적용할 메소드 이름 패턴
    
    public void setTarget(Object target) {
    	this.target = target;
    }
    
    public void setTransactionManager(PlatformTransactionManager 
    		tranactionManager) {
    	this.transactionManager = transactionManager;        
    }
    
    public void setPattern(String pattern){
    	this.pattern = pattern;
    }
    
    //트랜잭션 경계설정기능 부여
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    	if(method.getName().startWith(pattern)) { //pattern으로 시작하는 모든 메소드
        	return invokeInTransaction(method, args);
        } else {
        	return method.invoke(target, args);
        }
    }
   
    private Object invokeInTransaction(Method method, Object[] args) throws Throwable {
    	TransactionStatus status = 
        	this.transactionManager.getTransaction(new DefaultTransactionDefinition());
        try{ //트랜잭션을 시작하고 타깃 오브젝트의 메소드 호출
        	Object ret = method.invoke(target, args);
            this.transactionManager.commit(status);
            return ret;
        } catch (InvocationTargetException e){ //예외 발생시 트랜잭션 롤백
        	this.transactionManager.rollback(status);
            throw e.getTargetException();
        }
    }
}
```

6-27 코드를 보면 invoke() 메소드는 DI 받은 이름 패턴으로 시작되는 이름을 가진 메소드인지 확인해서 패턴과 일치하는 이름을 가진 메소드라면 트랜잭션을 적용하는 메소드를 호출하고, 아니라면 부가기능 없이 타킷 오브젝트의 메소드를 호출해서 결과를 리턴한다.

#### TransactionalHandler와 다이내믹 프록시를 이용하는 테스트 (p.448)
테스트 코드는 한번 읽어보자.

### 6.3.4 다이내믹 프록시를 위한 팩토리 빈

앞에서
1. 어떤 타깃에도 적용 가능한 트랜잭션 부가기능을 담은 TransactionHandler도 만들었고
2. 이를 이용하는 다이내믹 프록시를 UserService에 적용하는 테스트도 만들어봤다.
이제는 TransactionHandler와 다이내믹 프록시를 스프링의 DI를 통해 사용할 수 있도록 만들어야 하는데

문제는 다**이내믹 프록시는 빈으로 등록할 방법이 없다**는 것이다.
-> 이를 해결하기 위해 팩토리 빈을 통해서 다이내믹 프록시를 스프링 빈으로 등록해보자!

#### 팩토리 빈 (p.449)
사실 스프링은 클래스 정보를 가지고 디폴트 생성자 통해 오브젝트를 만드는 방법 외에도 빈을 만들 수 있는 여러 방법을 제공하는데 그중 대표적으로 팩토리 빈을 이용하는 방법이 있다.

팩토리 빈이란 **스프링을 대신**해서 **오브젝트의 생성로직을 담당**하도록 만들어진 특별한 빈이다.

```java
//팩토리 빈 인터페이스
package org.springframework.beans.factory;

public interface FactoryBean<T> {
	T getObject() throws Exception; // 빈 오브젝트 생성후 반환
    Class<? extends T> getObjectType(); //생성되는 오브젝트 타입을 알려줌
    boolean isSingleton(); //getObject()가 반환하는 오브젝트가 항상 같은 싱글톤인지 확인
}
```

6-29처럼 FactoryBean 인터페이스를 구현한 클래스를 스프링의 빈으로 등록하면 팩토리 빈으로 동작한다.


#### 다이내믹 프록시를 만들어주는 팩토리 빈 (p.453)
팩토리 빈을 이용하여 다이나믹 프록시를 빈으로 등록해 사용해보자.

![](https://i.imgur.com/Mh9Ra76.png)

스프링 빈에는 **팩토리 빈과 UserServiceImpl**만 빈으로 등록한다. 
팩토리 빈은 다이내믹 프록시와 함께 생성할 TransactionHandler에 타깃을 전달해주어야 하기 때문에 다이내믹 프록시가 위임할 타깃인 **UserServiceImpl에 대한 레퍼런스를 프로퍼티를 통해 DI받아두어야 한다.**
-> 다이내믹 프록시와 함께 생성할 TransactionHandler에게 타깃 오브젝트를 전달해줘야 하기 때문이다.

#### 트랜잭션 프록시 팩토리 빈 (p.454)

```java
package springbook.user.service;

public class TxProxyFactoryBean implements FactoryBean<Object> {
	Object target;
    PlatformTransactionManager transactionManager;
    String pattern;
    //다이나믹 프록시를 생성할 때 필요. UserService 외의 인터페이스를 가진 타깃에도 적용가능
    Class<?> serviceInterface; 
    
    public void setTransactionManager(PlatformTransactionManager
    		transactionManager) {
    	this.tranactionManager = transactionManager;        
    }
    
    public void setPattern(String pattern) {
    	this.pattern = pattern;
    }
    
    //Factory Bean
    public Object getObject() throws Exception { //DI받은 정보로 다이나믹 프록시 생성
    	TransactionHandler txHandler = new TransactionHandler();
        txHandler.setTarget(target);
        txHandler.setTransactionManager(transactionManager);
        txHandler.setPattern(pattern);
        return Proxy.newProxyInstance(
        	getClass().getClassLoader(),new Class[] { serviceInterface },
            txHandler);
    }
    
    //팩토리 빈이 생성하는 오브젝트 타입은 DI받는 인터페이스 타입에 따라 변함
    //재사용이 가능
    public Class<?> getObjectType() {
    	return serviceInterface;
    }
    
    
    public boolean isSingleton() {
    	return false; //getObject()가 매번 같은 오브젝트를 리턴하지 않음
    }
}
```
6-35

위의 6-35코드는 위에서 설명한 구조대로 코드를 작성한 것이다.
즉, TrnasactionalHandler 이용하는 다이내믹 프록시를 생성하는 팩토리 빈 클래스


그럼 이거에 대한 test는 어떻게 하는 게 좋을까?
#### 트랜잭션 프록시 팩토리 빈 테스트 (p.456)
간단하게 진행할 수 있다. 단순한 방법.
빈으로 등록된 TxProxyFactoryBean을 직접 가져와서 프록시를 만들면 된다.
이는 6-37 코드를 참고해보자.

	 TxProxyFactoryBean은 계속 재사용이 가능하다.
	 트랜잭션 부가기능이 필요한 빈이 추가될 때마다 그냥 빈 설정만 추가해주면 되므로

### 6.3.5 프록시 팩토리 빈 방식의 장점과 한계

여러 장점과 한계점을 생각해보자.

일단 장점
#### 프록시 팩토리 빈의 재사용 (p.458)
TxProxyFactoryBean은 **코드의 수정없이 다양한 클래스에 적용이 가능**하다.
- 타깃 인터페이스의 타입을 빈이 따라가는 형태로 되어있기 때문

#### 프록시 팩토리 빈 방식의 장점 (p.460)
앞서 살펴본 데코레이터 패턴이 적용된 프록시 생성 시 발생하는 문제점 두가지를 모두 해결해준다.
  
- 타깃 인터페이스를 구현하는 **클래스를 일일이 만드는 번거로움이 사라진다.**
	- 하나의 핸들러 메소드를 구현하는 것으로 수많은 메소드에 부가기능 부여가능  
- 부가기능의 **코드 중복문제가 해소**된다.  
    - DI까지 더한다면, 다이나믹 프록시 생성 코드도 삭제 가능

#### 프록시 팩토리 빈의 한계
- **한 번에 여러 개의 클래스**에 **공통적인 부가기능**을 제공하는 것은 **불가능**
- **하나의 타깃**에 **여러 개의 부가기능**을 적용하려고 할 때도 문제
- **TransactionHandler**가 **프록시 팩토리 빈 개수만큼 만들어짐**


------
쉬는시간

## 6.4 스프링의 프록시 팩토리 빈

지금까지 우리는 코드의 수정 없이 트랜잭션 부가기능을 추가해주는 다양한 방법에 대해 알아보았다.  
이제부터 스프링은 *이러한 문제를 어떻게 해결하였는지*에 대해 알아볼 것이다.

스프링은 매우 세련되고 깔끔한 방식으로 애플리케이션 개발에 자주 등장하는 이러한 문제에 대한 해법을 제공한다. 바로 **ProxyFactoryBean**이다.

### 6.4.1 ProxyFactoryBean

스프링은 트랜잭션, 메일 발송 기술에 적용했던 **서비스 추상화**를 프록시에도 사용한다.
- 따라서, 스프링은 일관된 방법으로 프록시를 만들 수 있게 도와주는 추상 레이어를 제공한다.
- 생성된 프록시는 스프링의 빈으로 등록되어야하고,
- 스프링은 프록시 오브젝트를 생성해주는 기술을 추상화한 팩토리 빈을 제공해준다.

##### ProxyFactoryBean의 기능
스프링의 ProxyFactoryBean은 프록시를 생성해서 빈 오브젝트로 등록하게 해주는 팩토리 빈이다.
위에서 만들었던 TxProxyFactoryBean과 달리 순수하게 **프록시를 생성하는 작업만을 담당**하고 프록시를 통해 제공해줄 **부가기능**은 **별도의 빈**에 둘 수 있다.

부가기능은 **MethodInterceptor 인터페이스를 구현**해서 만든다.
     MethodInterceptor는 **타깃 오브젝트에 대한 정보까지도 함께 제공** 받는다.
    => 그 덕분에 타깃 오브젝트에 상관없이 **독립적으로 생성**이 가능하다. -> **타깃이 다른 여러 프록시에서 함께 사용가능** & 싱글톤 빈으로 등록이 가능하다.

```java
package springbook.learningtest.jdk.proxy;
...
public class DynamicProxyTest{
	@Test
    public void simpleProxy() { //JDK 다이나믹 프록시 생성
    	Hello proxiedHello = (Hello)Proxy.newProxyInstance(
        		getClass().getClassLoader(),
                new Class[] { Hello.class },
                new UppercaseHandler(new HelloTarget()));
       ...
    }
    
    @Test
    public void proxyFactoryBean() {
    	ProxyFactoryBean pfBean = new ProxyFactoryBean();
        pfBean.setTarget(new HelloTarget()); //타깃 설정
        pfBean.addAdvice(new UppercaseAdvice()); // 부가기능을 담은 어드바이스 추가
        
        //getObject()로 생성된 프록시 가져옴
        Hello proxiedHello = (Hello) pfBean.getObject();
        
        assertThat(proxiedHello.sayHello("Toby"), is("HELLO TOBY"));
        assertThat(proxiedHello.sayHello("Toby"), is("HI TOBY"));
        assertThat(proxiedHello.sayHello("Toby"), is("THANK YOU TOBY"));
    }
    
    static class UppercaseAdvice implements MethodInterceptor {
    	public Object invoke(MEthodInvocation invocation) throws Throwable {
        	//리플렉션의 Method와 달리 실행시 타깃 오브젝트를 전달할 필요 X
        	String ret = (String)invocation.proceed(); 
            return ret.toUpperCase(); //부가기능 적용
        }
    }
    
    static interface Hello {
    	String sayHello(String name);
        String sayHi(String name);
        String sayThankYou(String name);
    }
    
    static class HelloTarget implements Hello {
    	public String sayHello(String name) { return "Hello " + name; }
        public String sayHi(String name) { return "Hi " + name; }
        public String sayThankYou(String name) { return "Thank You " + name; }
    }
}
```

6-41은 아까 만든 다이내믹 프록시 학습테스트를 ProxyFactoryBean을 이용하여 수정한 코드다.

여기서 MethodInterceptor는 타깃의 메소드를 내부적으로 실행시켜주는 일종의 템플릿처럼 동작한다.
- 템플릿/콜백 구조의 응용이므로 싱글톤으로 두고 공유 가능!!

#### 어드바이스: 타깃이 없는 순수한 부가기능 (p.464)
 ProxyFactoryBean은 작은 단위의 템플릿 / 콜백 구조를 응용해서 적용했기 때문에 템플릿 역할을 하는 MethodInvocation을 싱글톤으로 두고 공유할 수 있다. 

ProxyFactoryBean에는 여러 개의 MethodInterceptor를 추가할 수 있다. ProxyFactoryBean 하나만으로 여러 개의 부가기능을 제공해주는 프록시를 만들 수 있다는 뜻이다. 
따라서 앞에서 살펴봤던 프록시 팩토리 빈의 단점 중의 하나였던 , 새로운 부가기능을 추가할 때마다 프록시와 프록시 팩토리 빈도 추가해줘야 한다는 문제를 해결할 수 있다. 

아무리 많은 부가기능을 적용 하더라도 ProxyFactoryBean 하나로 충분하다.


MethodInterceptor 처럼 타깃 *오브젝트에 적용하는 부가기능을 담은 오브젝트*를 스프링에서는 **어드바이스**라고 부른다.

- [0] 어쨋든 여기서 기억할 내용 : **어드바이스**는 타깃 오브젝트에 종속되지 않는 순수한 부가기능을 담은 오브젝트

#### 포인트컷: 부가기능 적용 대상 메소드 선정 방법 (p.466)
위에서 InvocatiionHandler는 부가기능 적용외에도 메소드 이름을 가지고 부가기능 적용 대상 메소드를 선정하는 작업이 존재했다.

![](https://i.imgur.com/bxmGbtW.png)

하지만 여기서 문제는 부가기능을 가진 InvocationHandler가 타깃과 메소드 선정 알고리즘 코드에 의존하고 있다는 점이다. 

![](https://i.imgur.com/CLgrPci.png)

반면 6-18에 나타난 스프링의 ProxyFactoryBean 방식은 두 가지 확장 기능인 
부가기능(advice)과 메소드 선정 알고리즘(pointcut)을 활용하는 유연한 구조를 제공한다.

스프링은 부가기능을 제공하는 오브젝트를 어드바이스라고 부르고 , 메소드 선정 알고리즘을 담은 오브젝트를 포인트컷이라고 부른다. 어드바이스와 포인트컷은 모두 프록시에 DI로 주입돼서 사용된다. 두 가지 모두 여러 프록시에서 공유가 가능하도록 만들어지기 때문에 스프링의 싱글톤 빈으로 등록이 가능하다.


프록시는 클라이언트로부터 요청을 받으면 먼저 포인트컷에게 부가기능을 부여할 메소드인지를 확인해달라고 요청한다. 포인트컷은 Pointcut 인터페이스를 구현해서 만들면 된다. 
프록시는 포인트컷으로부터 부가기능을 적용할 대상 메소드인지 확인받으면, MethodInteceptor 타입의 어드바이스를 호출한다. 

```java
//포인트컷까지 적용한 ProxyFactoryBean
@Test
public void pointcutAdvisor() {
	ProxyFactoryBean pfBean = new ProxyFactoryBean();
    pfBean.setTarget(new HelloTarget());
    
    NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut(); // 메소드 이름을 비교해서 대상을 선정하는 알고리즘 제공하는 포인트컷 생성
    pointcut.setMappedName("sayH*"); //sayH로 시작하는 모든 메소드 선택
    
    pfBean.addAdvisor(new DefaultPointcutAdvisor(pointcut, new UppercaseAdvice()));
    
    Hello proxiedHello = (Hello) pfBean.getObject();
    
    assertThat(proxiedHello.sayHello("Toby"), is("HELLO TOBY"));
    assertThat(proxiedHello.sayHello("Toby"), is("HI TOBY"));
    // 메소드 이름이 포인트컷 선정조건과 맞지않음 - 부가기능 적용 X (대문자변환 X)
    assertThat(proxiedHello.sayHello("Toby"), is("Thank you TOBY"));
}
```
6-42 포인트컷까지 적용한 코드이다.

이때 포인트컷과 어드바이스를 묶어서 하나의 *Advisor타입*으로 호출해야 한다.
왜?
- 여러 개의 포인트컷과 어드바이스가 추가될 수 있기 때문에 조합을 만들어 저장해두는 것이다.
- 따로 등록하면 어떤 부가기능에 대해 어떤 메소드 선정 포인트컷을 적용할지 애매해진다.

**결론**
- [8] **어드바이저(Advisor) = 포인트컷(메소드 선정 알고리즘) + 어드바이스(부가기능)**


### 6.4.2 ProxyFactoryBean 적용

기존 다이내믹 프록시 구조를 이용해서 만들었던 TxProxyFactoryBean을 ProxyFactoryBean으로 수정해보자.

```java
package springbook.user.service;
...
public class TransactionAdvice implements MethodInterceptor {
	PlatformTransactionManager transactionManager;
    
    public void setTransactionManager(PlatformTransactionManager
    		transactionManager) {
   		this.transactionManager = transactionManager;         
    }
    
    public Object invoke(MethodInvocation invocation) throws Throwable {
    	TransactionStatus status = 
        		this.transactionManager.getTransaction(new
                	DefaultTransactionDefinition());
        try {
        	Object ret = invocation.proceed(); //콜백을 호출해서 타깃의 메소드 실행
            this.transactionManager.commit(status);
            return ret;
        }
        //MethodInvocation을 통한 타깃호출은 예외가 포장되지 않고 타깃에서 보낸 그대로 전달
        catch (RuntimeException e){ 
        	this.transactionManager.rollback(status);
            throw e;
        }
    }
}
```

#### XML 설정 & 테스트
읽어보자.

#### 어드바이스와 포인트컷의 재사용 (p.474)
스프링의 **ProxyFactoryBean**은 **DI와 템플릿/콜백 패턴, 서비스 추상화 기법이 모두 적용**되어있다.
- 그 덕분에 독립적이며, 여러 프록시가 공유할 수 있는 어드바이스와 포인트컷으로 확장 기능을 분리할 수 있다.
	새로운 서비스 클래스가 만들어져도 **만들어둔 TransactionAdvice를 그대로 재사용 가능하다.**

![](https://i.imgur.com/EA3wslJ.png)


## 6.5 스프링 AOP

지금까지 해왔던 작업의 목표 : 비즈니스 로직에 반복적으로 등장해야만 했던 트랜잭션 코드를 깔끔하고 효과적으로 분리해내는 것이다. 이렇게 분리해낸 트랜잭션 코드는 투명한 부가기능 형태로 제공돼야 한다.

투명하기 때문에 언제든 자유롭게 추가하거나 제거할 수 있고, 기존 코드는 항상 원래의 상태를 유지할 수 있다.

### 6.5.1 자동 프록시 생성

기존의 프록시 팩토리 빈의 한계라고 생각했던 문제점들이 있었다.

1. 부가기능이 타깃 오브젝트마다 새로 만들어지는 문제 
	스프링 ProxyFactoryBean의 **어드바이스를 통해 해결**
2. 부가기능의 적용이 필요한 타깃 오브젝트마다 비슷한 내용의 설정정보를 추가해주어야 하는 문제
	이제부터 이 해결방법에 대해서 공부해보자.

#### 중복 문제의 접근 방법 (p.476)
지금까지 다뤄온 반복적이고 기계적인 코드에 대한 해결책들을 짧게 정리해보자

1. JDBC API 사용하는 DAO 코드가 있었다. 이 코드는 바뀌지 않는 부분과 바뀌는 부분을 구분해서 분리하고, 템플릿과 콜백, 클라이언트로 나누는 방법을 통해 깔끔하게 해결했다.
2. 반복적인 위임 코드가 필요한 프록시 클래스 코드는 더 독특한 방법인 **"다이내믹 프록시" 라는 런타임 코드 자동생성 기법**을 이용해서 해결했다.
	-> 그 덕분에 개발자가 일일이 인터페이스 메소드를 구현하는 프록시 클래스를 만들어서 위임과 부가기능의 코드를 중복해서 넣어주지 않아도 되게 되었다.

2번의 다이내믹 프록시를 활용하여, 이 방법을 ProxyFactoryBean의 설정 자동등록기법으로 해결할수 있지 않을까?

#### 빈 후처리기를 이용한 자동 프록시 생성기 (p.477)
스프링은 OCP의 가장 중요한 요소인 유연한 확장의 개념을 다양한 방법으로 적용하고 있는데,
관심을 가질만한 확장 포인트는 바로 BeanPostProcessor 인터페이스를 구현해서 만드는 **빈 후처리기**다. 

##### 빈 후처리기
스프링 빈 오브젝트로 만들어진 후, 빈 오브젝츠를 다시 가공할 수 있게 해 주는 것이다.
- **빈 오브젝트의 프로퍼티를 강제로 수정**하거나 **별도의 초기화 작업 수행**가능  
- 만들어진 **빈 오브젝트 자체를 바꿔치기할 수도 있음**  
- 따라서, 스프링이 설정을 참고해서 만든 오브젝트가 아닌 다른 오브젝트 자체를 바꿔치기 할 수 있다.
- 구조와 자세한 사용법은 Vol.2에서 다룰 것

그리고 여기서 살펴볼 DefaultAdvisorAutoProxyCreator는
##### 자동프록시 생성기
빈 후처리기 중 한 종류로 어드바이저를 이용한 자동 프록시 생성기이다.
자기 자신을 빈으로 등록하면 사용이 가능하다.

이를 잘 이용하면 스프링이 생성하는 **빈 오브젝트의 일부**를 **프록시로 포장**하고, **프록시를 빈으로 대신 등록** 가능해진다.

##### 빈 후처리기를 이용한 자동 프록시 생성 방법
사용 방법은 잘 정리해뒀으니 읽어보면 좋을 것 같다.

1. **DefaultAdvisorAutoProxyCreator 빈 후처리기가 등록**되어 있으면 스프링은 **빈 오브젝트를 만들 때마다 빈 후처리기에게 빈을 보냄**
2. **DefaultAdvisorAutoProxyCreator**는 **빈으로 등록된 모든 어드바이저 내의 포인트컷을 이용**해 전달받은 빈이 **프록시 적용 대상인지 확인**
3. 적용대상이라면, **내장된 프록시 생성기에게 현재 빈에 대한 프록시를 만들게 함**
4. 만든 **프록시에 어드바이저를 연결**해줌
5. **빈 후처리기**는 원래 컨테이너가 전달해준 빈 대신 **프록시를 컨테이너에게 돌려줌**
6. **컨테이너**는 후처리기가 돌려준 **프록시를 빈으로 등록하고 사용**하게됨

#### 확장된 포인트컷 (p.478)
지금까지는 포인트컷의 하나의 역할만 말했는데, 사실 포인트컷은 두 가지 기능을 가지고 있다.

- 타깃 오브젝트의 메소드중 어떤 메소드에 부가기능을 적용할지 선정하는 역할 (원래 알고있던 역할)
- **등록된 빈 중**에서 **어떤 빈에 프록시를 적용할지 선택** 하는 역할도 한다.
    - 빈 후처리기를 사용하는 경우, 프록시 자동 적용 대상을 선별해야하기 때문에 클래스와 선정 알고리즘을 모두 갖고 있는 포인트컷과 결합된 **어드바이저**가 필요하다.

#### 포인트컷 테스트 (p.479)
간단한 포인트컷 학습 테스트 코드다.

```java
@Test
public void classNamePointcutAdvisor() {
	//포인트컷 준비
    NameMatchMetodPointcut classMethodPointcut = new NameMatchMethodPointcut() {
    	public ClassFilter getClassFilter() {
        	return new ClassFilter() {
            	public boolean matches(Class<?> clazz){
                 	//클래스 이름이 'HelloT'인것만 선정
                	return clazz.getSimpleName().startsWith("HelloT");
                }
            };
        }
    };
    classMethodPointcut.setMappedName("sayH*"); //'sayH'로 시작하는 모든 메소드 선정
    
    //테스트
    checkAdviced(new HelloTarget(), classMethodPointcut, true); //적용 클래스
    
    class HelloWorld extends HelloTarget {};
    checkAdviced(new HelloWorld(), classMethodPointcut, false); //적용 클래스 X
    
    class HelloToby extends HelloTarget {};
    checkAdviced(new HelloToby(), classMethodPointcut, true); //적용 클래스
}

private void checkAdviced(Object target, Pointcut pointcut, boolean adviced) { [3]
	ProxyFactoryBean pfBean = new ProxyFactoryBean();
    pfBean.setTarget(target);
    pfBean.addAdvisor(new DefaultPointcutAdvisor(pointcut, new UppercaseAdvice()));
    Hello proxiedHello = (Hello) pfBean.getObject();
    
    if(adviced) { // 메소드 선정 방식을 통해 어드바이스 적용
    	assertThat(proxiedHello.sayHello("Toby"), is("HELLO TOBY"));
        assertThat(proxiedHello.sayHello("Toby"), is("HI TOBY"));
        assertThat(proxiedHello.sayHello("Toby"), is("Thank You Toby"));
    }
    else{ // 어드바이스 적용 대상 후보에서 아예 탈락
    	assertThat(proxiedHello.sayHello("Toby"), is("Hello Toby"));
        assertThat(proxiedHello.sayHello("Toby"), is("Hi Toby"));
        assertThat(proxiedHello.sayHello("Toby"), is("Thank You Toby"));
    }
}
```

세 개의 클래스에 모두 동일한 포인트컷을 적용했다. 메소드 선정기준으로만 보자면
두 개의 메소드에는 어드바이스를 적용하고 마지막 것은 적용되지 않으면 된다. 
하지만 두 번째 HelloWorld라는 클래스는 클래스 필터에서 **이미 탈락해버리기 때문에 메소드 이름과 무관하게 모든 메소드가 어드바이스 적용 대상에서 제외**된다.


포인트컷이 클래스 필터까지 동작해서 클래스를 걸러버리면 아무리 프록시를 적용했다고 해도 부가기능은 전혀 제공되지 않는다는 점에 주의해야 한다. 


### 6.5.2 DefaultAdvisorAutoProxyCreator의 적용

직접 적용 테스트부터 p.488까지는 읽어보고 테스트에 관해 공부해보자.

### 6.5.3 포인트컷 표현식을 이용한 포인트컷

이제 좀 더 편리한 포인트컷 작성 방법을 알아보자.
지금까지는 단순한 이름을 비교하는 일이 전부였다. 이보다 더 복잡하고 세밀한 기준을 이용해 클래스나 메소드를 선정하게 하려면 어떻게 해야 할까?

물론 리플렉션 API 통해서 클래스와 메소드의 이름, 정의된 패키지, 파라미터, 리턴 값 물론이고 다양한 부여된 애노테이션, 구현한 인터페이스 등등 다양한 정보를 알아낼 수 있지만
리플렉션 API는 **작성이 번거럽고**, API를 이용해 메타 정보를 비교하는 방법은 조건이 달라질 때마다 **포인트컷 구현 코드를 수정해야하는 번거로움**이 존재한다.
- 스프링에서는 정규식,JSP의 EL과 같은 **일종의 표현식 언어를 이용**해 작성하는 방법을 제공한다.
- 이를 *포인트컷 표현식* 이라고 부른다.

#### 포인트컷 표현식 (p.489)
**AspectJExpressionPointcut**를 사용해 포인트컷 표현식을 지원하는 포인트컷을 적용한다.
	- AspectJExpressionPointcut은 클래스와 메소드의 선정 알고리즘을 표현식을 이용해 한 번에 지정 가능하게 해 준다.
	- **AspectJ프레임워크에서 가져와 사용**하여 **AspectJ포인트컷 표현식**이라고도 한다.

#### 포인트컷 표현식 문법 (p.490)
포인트컷 표현식은 포인트컷 지시자를 이용해 작성한다.
대표적으로 사용되는 것은 execution()이다.

```java
execution([접근제한자 패턴] 타입 패턴 [타입 패턴.]이름 패턴 (타입 패턴 | "..", ...)
[throws 예외 패턴]) //[]안 패턴은 생략가능
```

- **접근제한자 패턴** : **public protected, private**등이 올 수 있다.
- **타입 패턴** : **리턴 값의 타입**을 나타내는 패턴이다. **반드시 하나의 타입을 지정**
- **타입 패턴.** : **패키지와 타입 이름을 포함한 클래스의 타입 패턴**. **패키지 이름과 클래스 또는 인터페이스 이름**에 **'*'사용 가능**. **'..'를 사용**하면 **한 번에 여러개의 패키지 선택 가능.**
- **(메소드)이름 패턴** : **메소드 이름 패턴**으로, **모든 메소드를 선택**한다면 *** 사용**
- **(타입 패턴)** : **메소드 파라미터의 타입 패턴**이다. **메소드 파라미터의 타입을 ','로 구분**하면서 순서대로 적으면 된다. **파라미터 타입과 갯수에 상관없이 모두 허용하는 패턴**으로 만드려면 **'..'**을 넣으면 된다. **'...'를 이용해서 뒷부분의 파라미터 조건만 생략 가능**
- **예외 패턴** : **예외 이름에 대한 타입 패턴**이다.

표현식 검증하는 테스트부터 표현식 테스트까지는 코드 나중에 읽어보고 공부해보자.
나중에 저 표의 경우 결과를 가리고 직접 O 표를 쳐보면서 익숙해지면 좋을 것이다.
하지만 지금 당장 급한 건 아니라고 생각한다.

이제 p.500으로 고고

### 6.5.4 AOP란 무엇인가?

비즈니스 로직을 담은 UserService에 트랜잭션을 적용해온 과정을 한번 정리해보자.

1. 트랜잭션 서비스 추상화 
	트랜잭션 적용이라는 추상적인 작업 내용은 유지한 채로 구체적인 구현 방법을 자유롭게 바꿀 수 있도록 서비스 추상화 기법을 적용했다. 이 덕분에 비즈니스 로직코드는 트랜잭션을 어떻게 처리해야 한다는 구체적인 방법과 서버환경에서 종속되지 않는다. 
2. 프록시와 데코레이터 패턴
	추상화 후에도 여전히 비즈니스 로직 코드에는 트랜잭션을 적용하고 있기 때문에
	DI를 이용해 **데코레이터 패턴**을 적용했다.
	결국 비즈니스 로직 코드는 트랜잭션과 같은 성격이 다른 코드로부터 자유로워졌고 , 독립적으로 로직을 검증하는 고립된 단위 테스트를 만들 수도 있게 됐다.
3. 다이내믹 프록시와 프록시 팩토리 빈
	프록시 이용해서 비즈니스 로직 코드에서 트랜잭션 코드 모두 제거할 수 있었지만, 비즈니스 로직 인터페이스의 모든 메소드마다 트랜잭션 기능을 부여하는 코드를 넣어 프록시 클래스를 만드는 작업은 오히려 짐이 됐다.
	JDK 다이내믹 프록시 기술을 적용했고, 프록시 기술을 추상화한 스프링의 프록시 팩토리 빈을 이용해서 다이내믹 프록시 생성 방법에 DI를 도입했다.
4. 자동 프록시 생성 방법과 포인트컷
	일일이 프록시 팩토리 빈을 설정해줘야 한다는 부담감이 남아있었기에
	스프링 컨테이너의 빈 생성 후처리 기법을 활용해 컨테이너 초기화 시점에서 자동으로 프록시를 만들어주는 방법을 도입했다.
	처음에는 클래스와 메소드 선정 로직을 담은 코드를 직접 만들어서 포인트컷으로 사용했지만, 최종적으로는 포인트컷 표현식을 사용하여 좀 더 편리하고 깔끔한 활용이 가능해졌다.

#### 부가기능의 모듈화 (p.503)
관심사가 같은 코드를 분리하여 하나로 모으는 것은 SW 개발의 가장 기본이 되는 원칙이다.
그렇게 관심사가 같은 코드를 객체지향 설계 원칙에 따라 분리하고, 서로 낮은 결합도를 가진 채로 독립적이고 유연하게 확장할 수 있는 모듈로 만드는 것이 초난감 DAO 부터 시작해서 지금까지 해온 작업이다.

그런데 트랜잭션 같은 부가기능은 핵심기능과 같은 방식으로는 모듈화하기가 매우 힘들다. 이름 그대로 부가기능이기 때문에 스스로는 독립적인 방식으로 존재해서는 적용되기 어렵기 때문이다.

그래서 많은 개발자들이 핵심기능을 담당하는 코드 여기저기에 흩어져 나타나는 부가기능을 어떻게 독립적인 모듈로 만들 수 있을지 많은 고민을 해왔다.

결국 지금까지 해온 모든 작업은 핵심기능에 부여되는 부가기능을 효과적으로 모듈화하는 방법을 찾는 것이었고, 어드바이스와 포인트컷을 결합한 어드바이저가 단순하지만 이런 특성을 가진 모듈의 원시적인 형태로 만들어지게 된 것이다.

#### AOP: 애스팩트 지향 프로그래밍 (p.504)
그렇게 계속 부가기능의 독립적인 모듈화를 연구해온 사람들은 부가기능 모듈을 오브젝트와는 다른 특별한 이름으로 부르기 시작했다.
그게 바로 **애스펙트**

> [!note] 애스팩트 (Aspect)
> 핵심기능을 담고 있지는 않지만, 하나의 구성요소이고, 핵심기능에 부가되어 의미를 갖는 특별한 모듈
> - 지금 사용하고 있는 어드바이저는 아주 단순한 형태의 애스펙트라고 볼 수 있다.

애스펙트는 말 그대로 **애플리케이션을 구성하는 한 가지 '측면'** 이라고 볼 수 있다.

![](https://i.imgur.com/9e92MEn.png)

그림 6-21의 오른쪽은 애스팩트로 부가기능을 분리하기 전, 그리고 왼쪽은 핵심기능 코드 사이에 침투한 부가기능을 독립적인 모듈인 애스팩트로 구분한 것이다.

2차원 적인 평면구조에서는 해결할 수 없었떤 것을 3차원 다면체 구조로 가져가면서 각각 성격이 다른 부가기능은 다른 면에 존재하도록 만들었다.

이렇게 애플리케이션의 핵심 기능에서 부가기능을 분리하여 애스펙트라는 독특한 모듈로 만들어 설계하고 개발하는 방법을 **애스펙트 지향 프로그래밍** 또는 약자로 **AOP**라 부른다.

AOP는 애플리케이션을 다양한 측면에서 독립적으로 모델링하고, 설계하고, 개발할 수 있도록 만들어주므로 다양한 관점에서 바라보며 개발할 수 있게 해 준다.
따라서, 특정한 관점을 기준으로 바라볼 수 있게 해준다는 의미에서 AOP를 **관점지향 프로그래밍** 이라고도 한다.

### 6.5.5 AOP 적용기술

#### 프록시를 이용한 AOP (p.506)
> **스프링**은 다양한 기법들을 사용해 AOP를 지원하는데, 그 중 **핵심은 프록시**이다.  
> - 프록시로 만들어 **DI로 연결된 빈 사이에 적용**해 **타깃 메소드 호출 과정에 참여**해 **부가기능을 제공** 해준다.
> - 독립적으로 개발한 부가기능 모듈을 다양한 타깃 오브젝트의 메소드에 다이내믹하게 적용해주기 위해 가장 중요한 역할을 하는 것이 프록시이기 때문에
> => 따라서 스프링 AOP는 프록시 방식의 AOP라 할 수 있다.

#### 바이코드 생성과 조작을 통한 AOP (p.506)
프록시 방식이 아닌 AOP도 있을까?

> **AspectJ**는  **직접적으로 타깃 오브젝트를 뜯어고쳐 부가기능을 직접 넣어주는 방식** 이다.
> - 컴파일된 타깃의 클래스 파일 자체를 수정하거나 클래스가 JVM의 로딩되는 시점을 가로채 바이트코드를 조작한다.

##### 프록시가 있음에도 왜 이 방법을 사용하까?
1. 스프링의 DI 컨테이너의 도움을 받아 자동 프록시 생성 방식을 사용하지 않아도 AOP적용이 가능해진다.
	- 스프링과 같은 컨테이너가 사용되지 않는 환경에서도 손쉽게 AOP의 적용이 가능해진다.
2. 프록시 방식보다 훨씬 강력하고 유연한 AOP가 만들어진다.
    - 프록시와 달리 **오브젝트 생성, 필드 값 조회와 조작, 스태틱 초기화등** 다양한 작업에 **부가기능 부여 가능**하다.

근데 보통 일반적으로는 프록시 방식의 스프링 AOP로도 충분하다.
간혹 특별한 AOP 요구사항이 생겨서 스프링의 프록시 AOP 수준을 넘어서는 기능이 필요하면, 그때 AspectJ를 사용하면 된다.

### 6.5.6 AOP의 용어

AOP에서 많이 사용하는 용어를 살펴보고 넘어가자.
(시간 없으면 생략)

###### 타깃

> **부가기능을 부여할 대상**이다.
> - **핵심기능을 담은 클래스**일 수도 있지만, 경우에 따라 다른 부가기능을 제공하는 프록시 오브젝트일 수도 있다.

###### 어드바이스

> **타깃에게 제공할 부가기능을 담은 모듈**이다.
> - 오브젝트로 정의하기도 하지만, 메소드레벨에서 정의할 수 있다. 
> - 전반적으로 참여하는 것, 예외발생시에만 참여하는 것 등 여러 종류가 존재한다.

###### 조인포인트

> **어드바이스가 적용될 수 있는 위치** 를 말한다.
> - 스프링의 **프록시 AOP에서 조인 포인트는 메소드 실행단계 뿐**이다.

###### 포인트컷

> **어드바이스를 적용할 조인 포인트를 선별하는 작업** 또는 **그 기능을 정의한 모듈**이다. 
> 스프링의 포인트컷은 **메소드를 선정하는 기능**을 가진다.

###### 프록시

> 클라이언트와 타깃 사이에 투명하게 존재하면서 부가기능을 제공하는 오브젝트이다. (대리인 역할)
> - DI를 통해 **타깃 대신 클라이언트에게 주입**된다.
> - 클라이언트의 메소드 호출을 대신 받아서 타깃에 위임해주면서, 그 과정에서 부가기능을 부여한다.

######  어드바이저

> **포인트컷과 어드바이스를 하나씩 갖고있는 오브젝트**이다. 
> - **어떤 부가기능을 어디에 전달할 것인가**를 알고있는 **AOP의 가장 기본적 모듈**이다.
> - 스프링에서만 사용되는 용어

######  애스펙트

> **AOP의 기본 모듈.** **한 개 또는 그 이상의 포인트컷과 어드바이스의 조합**으로 만들어진다.
> - **싱글톤 형태**로 존재한다.


### 6.5.7 AOP 네임스페이스

스프링 AOP 를 적용하기 위해 추가했던 어드바이저 , 포인트컷 , 자동 프록시 생성기 같은 빈들은 애플리케이션의 로직을 담은 UserDao나 UserService 빈과는 성격이 다르다.

이런 빈들은 스프링 컨테이너에 의해 자동으로 인식돼서 특별한 작업을 위해 사용된다.

**스프링의 프록시 방식 AOP을 적용**하려면 **최소 네가지 빈을 등록**해야 한다.

###### 자동 프록시 생성기

> 스프링의 DefaultAdvisorAutoProxyCreator 클래스를 빈으로 등록.  
> - DI를 하지도, 되지도 않으며 독립적으로 존재 (id가 굳이 필요없음) 
> - 빈으로 등록된 어드바이저를 이용해 프록시를 자동으로 생성하는 기능

###### 어드바이스

> 부가기능을 구현한 클래스를 빈으로 등록  
> - TransactionAdvisor는 AOP 관련 빈중 유일하게 직접 구현된 클래스 사용

###### 포인트컷

> 스프링의 AspectJExpressionPointcut을 빈으로 등록하고 expression 프로퍼티에 포인트컷 표현식 삽입
> - 코드 작성이 필요없음

###### 어드바이저

> 스프링의 DefaultPointcutAdvisor 클래스를 빈으로 등록.  
> - 어드바이스와 포인트컷을 프로퍼티로 참조  
> - 자동 프록시 생성기에 의해 자동 검색되어 사용

이 네가지 빈에 대해서는 설명을 자세하게 적어놨으니 읽어보자.

#### AOP 네임스페이스 (p.510)
위 네가지의 빈들을 간편한 방법으로 등록하기 위해 스프링은 **AOP 스키마**를 제공한다.

```java
<aop:config>
	//expression의 표현식을 프로퍼티로 가진 AspectJExpressionPointcut을 빈으로 등록
	<aop:pointcut id="transactionPointcut" 
    				expression="execution(* *..*ServiceImpl.upgrade*(..))" />
    //advice와 pointcut의 ref를 프로퍼티로 갖는 DefaultBeanFactoryPointcutAdvisor를 등록                
    <aop:advisor advice-ref="transactionAdvice" pointcut-ref="transactionPointcut"/>
</aop:config> 
```

**<aop:config>, <aop:pointcut>, <aop:advisor>** 태그를 정의해두면 세 개의 빈이 자동으로 등록된다.
이렇게 스카에 정의된 전용 태그를 사용해 정의해주면 편리하다는 장점이 있다.

## 6.6 트랜잭션 속성

트랜잭션 추상화를 설명하면서 사용한 트랜잭션 경계설정 코드 중 DefaultTransactionDefinition의 용도를 알아보자.

```java
public Object invoke(MethodInvocation invocation) throws Throwable {
    	TransactionStatus status = 
        		this.transactionManager.getTransaction(new 		
                	DefaultTransactionDefinition()); // 트랜잭션 정의
        try {
        	Object ret = invocation.proceed(); 
            this.transactionManager.commit(status);
            return ret;
        } catch (RuntimeException e){ 
        	this.transactionManager.rollback(status);
            throw e;
        }
    }
```

### 6.6.1 트랜잭션 정의

트랜잭션의 원자성은 항상 유효하지만,  **commit(), rollback()** 말고도 **동작을 제어할 수 있는 조건들이 존재**한다.
- **DefaultTransactionDefinition**이 **구현하고 있는 TransactionDefinition 인터페이스**는 동작방식에 영향을 줄 수 있는 **네 가지 속성을 정의**하고 있다.

#### 트랜잭션 전파 (p.513)
트랜잭션의 경계에서 **이미 진행 중인 트랜잭션이 있을 떼 또는 없을 때 어떻게 동작할 것인가를 결정**하는 방식이다.

![](https://i.imgur.com/XyEY315.png)

그림 6-22의 트랜잭션 전파와 같이 각각 독립적인 트랜잭션 경계를 가진 두 개의 코드가 있다고 하자.

1. 트랜잭션 A가 (1) method 수행 후, B.method 실행
2. B.method에서 트랜잭션 B를 실행하고 종료한다.
3. A가 (2) 수행 중 예외가 발생되면 어떻게 될까?

만약 B가 트랜잭션 A에 참여한 경우, A와 B가 모두 롤백된다.
B를 독립적인 트랜잭션으로 만들어 참여한 경우, B는 독립적으로 종료되었으므로 롤백되지 않는다.

이처럼 **이미 진행중인 트랜잭션**이 **독자적인 트랜잭션 경계를 가진 코드**에 대해 **어떻게 영향을 미칠 수 있는가를 정의**한 것이 **트랜잭션 전파 속성**이다.

##### 트랜잭션 전파 속성의 종류

- **PROPAGTION_REQUIRED**  
    **가장 많이 사용하는 트랜잭션 전파 속성**이다.
	 **진행 중인 트랜잭션이 없으면 새로 시작, 있다면 이에 참가**한다.  
    - 두 트랜잭션 코드 모두 PROPAGTION_REQUIRED라면 다양한 방식으로 결합 가능 (A, B, A→B, B→A)  
    - **DefaultTransactionDefinition의 전파 속성**  
      
- **PROPAGTION_REQUIRES_NEW**  
    이미 **진행 중인 트랜잭션에 유무에 상관없이 항상 새로운 트랜잭션을 시작**한다.  
    
- **PROPAGTION_NOT_SUPPORTED**  
    **트랜잭션 없이 동작**하도록 만들 수 있다. 
    **진행 중인 트랜잭션은 무시**한다.  
    - 특별히 트랜잭션 적용에서 제외해야하는 메소드가 존재한다면 사용한다.

(얜 시간 없으면 생략)
> [! test]
> 트랜잭션 매니저를 통해 트랜잭션을 시작하려고 할 때 getTransaction() 이라는 메소드를 사용하는 이유가 바로 전차 속성이 존재하기 때문이다.
> - 항상 트랜잭션을 새로 시작하는 것이 아닌 진행 중인 트랜잭션 존재와 전파 속성에 따라 새로 시작할수도, 참가할 수도 있다.

#### 격리수준 (p.515)
모든 DB트랜잭션은 **격리수준**을 갖고 있어야 한다.  
- **적절하게 격리수준을 조정**하여 **많은 트랜잭션을 동시에 진행**시키면서 **문제가 없도록 제어가 필요**하다.  
- DefaultTransactionDefinition의 격리수준은 ISOLATION_DEFAULT이다.
- ISOLATION_DEFAULT의 경우 실제 격리수준에 대해 말하는게 아니라 DB가 기본적으로 설정한 격리수준을 그대로 사용하겠다는 설정값을 의미한다.

#### 제한시간 (p.516)
**트랜잭션을 수행하는 제한시간 설정 가능**하다.
- DefaultTransactionDefinition의 기본설정은 제한시간이 없는 것

#### 읽기전용 (p.516)
읽기전용으로 설정해두면 트랜잭션 내에서 데이터를 조작하는 시도를 막아줄 수 있다.
또한, 데이터 액세스에 따라 성능이 향상될 수도 있다.

이렇게 네 가지 속성을 이용해 트랜잭션의 동작방식을 제어할 수 있다.

그렇다면 트랜잭션 정의를 수정하려면 어떻게 해야할까?

> 트랜잭션 정의를 수정하기위해 **DefaultTransactionDefinition대신 외부에서 정의된 TransactionDefinition 타입의 빈을 정의해두면 원하는 속성을 지정해줄 수 있다.** 
> 
> 하지만 **이 방법을 사용**하면 *모든 트랜잭션의 속성이 한꺼번에 바뀐다는 문제가 존재*한다. 
> 독자적인 트랜잭션 정의를 적용할 수 있는 방법은 없을까?

### 6.6.2 트랜잭션 인터셉터와 트랜잭션 속성

메소드별로 다른 트랜잭션 정의를 적용하려면 어드바이스의 기능을 확장해야된다.
메소드 이름 패턴에 따라 다른 트랜잭션 정의가 적용되도록 만드는 것이다.

#### TransactionInterceptor (p.517)
스프링은 이미 트랜잭션 경계설정 어드바이스로 사용할 수 있도록 만들어진 **TransactionInterceptor**가 존재한다.
- 기존의 TransactionAdvice와 동작원리가 **동일**하다.
	- 다만 트랜잭션 정의를 메소드 이름 패턴을 이용해 다르게 지정할 수 있는 방법을 추가로 제공할 뿐이다.
- **PlatformTransactionManager와 Properties타입의 두 가지 프로퍼티**를 가진다.
    - Properties 타입인 두번째 프로퍼티는 transactionAttributes로 트랜잭션의 속성을 정의한 프로퍼티다.
- TransactionalInterceptor에는 기본적으로 두 가지 종류의 예외처리 방식이 있다.
	- 런타임 예외가 발생하는 경우에만 트랜잭션 **롤백** & 그외의 경우는 트랜잭션 **커밋**
    - 이러한 예외처리 기본 원칙을 따르지 않는 경우, **rollbackOn()이라는 속성을 두어 기본원칙과 다른 예외처리가 가능**하게 해준다.

#### 메소드 이름 패턴을 이용한 트랜잭션 속성 지정 (p.518)
Properties 타입의 transactionAttributes 프로퍼티는 **메소드 패턴**과 **트랜잭션 속성**을 키와 값으로 갖는 컬렉션이다.

트랜잭션 속성은 다음과 같이 문자열로 정의가 가능하다. 
![](https://velog.velcdn.com/images/kkuldangi3/post/df9d81f5-2b26-41b7-bf54-9bf4d09e9b98/image.PNG)

- 트랜잭션 전파 속성만 필수이고, 나머지는 모두 생략가능  
    - 생략하면 모두 DefaultTransactionDefinition에 설정된 디폴트 속성이 부여된다.
- 순서가 바뀌어도 상관이 없음

```java
...
<props>
	//get으로 시작하는 모든 메소드에 대한 속성
	<prop key="get*">PROPAGATION_REQUIRED,readOnly,timeout_30</prop> 
    //upgrade로 시작하는 모든 메소드에 대한 속성
    <prop key="upgrade*">PROPAGATION_REQUIRES_NEW,ISOLATION_SERIALIZABLE</prop>
    //위 두가지 조건에 포함되지 않은 나머지 메소드들의 속성
    <prop key="*">PROPAGATION_REQUIRED</prop>
...
```
6-71은 세 가지 메소드 이름 패턴에 대한 트랜잭셩 속성이 정의되어있다.
1. get 2. upgrade 3. 두가지 조건에 포함되지 않은 나머지 메소드 속성

#### tx 네임스페이스를 이용한 설정 방법 (p.520)
tx 스키마 사용한 것이고 읽어보자.

### 6.6.3 포인트컷과 트랜잭션 속성의 적용 전략

트랜잭션 부가기능을 적용할 후보 메소드를 선정하는 작업은 포인트컷에 의해 진행되고,
어드바이스의 트랜잭션 전파 속성에 따라서 메소드별로 트랜잭션의 적용방식이 결정된다.

**포인트컷 표현식과 트랜잭션 속성을 정의할 때 따르면 좋은 몇 가지 전략**을 생각해보자.

#### 트랜잭션 포인트컷 표현식은 타입 패턴이나 빈 이름을 이용한다 > 전략1 (p.522)
비즈니스 로직을 담고 있는 클래스라면 메소드 단위까지 세밀하게 적용할 필요가 없다.

- 따라서 **트랜잭션 포인트컷 표현식**에는 **메소드나 파라미터, 예외에 대한 패턴**을 **정의하지 않는게 바람직**하다.
- **클래스 이름에서 일정한 패턴을 찾아 표현식**으로 만드는 것이 좋다.
    - _Service,_ ServiceImpl 끝나는 경우
- 일정한 **패턴을 찾기 어려운 경우, bean()을 이용**해 빈의 아이디를 통해 적용하는 것도 적용할만 하다.

#### 공통된 메소드 이름 규칙을 통해 최소한의 트랜잭션 어드바이스와 속성을 정의한다 > 전략2 (p.523)
실제로 하나의 애플리케이션에서 사용할 트랜잭션 속성의 종류는 그다지 다양하지 않다.
> - 기준이 되는 몇 가지 트랜잭션 속성을 정의하고 그에 따라 적절한 메소드 명명 규칙을 만들어 사용하면 하나의 어드바이스만으로 모든 서비스 빈에 트랜잭션 속성을 지정할 수 있다.
> - 간단한 디폴트 속성으로 시작하여 개발과정에서 필요하다면 하나씩 추가하기 (이게 가장 간단한 부여 방법이다.)

#### 프록시 방식 AOP는 같은 타깃 오브젝트 내의 메소드를 호출할 때는 적용되지 않는다 > 전략보단 주의사항 (p.524)
**프록시 방식의 AOP**에서는 **프록시를 통한 부가기능의 적용**은 **클라이언트로부터 호출이 일어날 때만 가능**하다.

![](https://i.imgur.com/JUNjSXF.png)

- 반대로  **타깃 오브젝트가 자기 자신의 메소드를 호출**할 때는 **부가기능의 적용이 일어나지 않는다.** (타깃의 delete()메소드에서 update()실행시 적용 X)  
- 이를 **해결**하기 위해 **타깃의 바이트코드를 조작하는 방식을 적용**하는 것 -> 많이 사용 안 한다 했지만 이럴 때 사용하는 것이다!!

그림 6-32를 보면 타깃의 delete() 메소드에서 update() 실행시 부가기능의 적용이 일어나지 않는 것을 볼 수 있다.


### 6.6.4 트랜잭션 속성 적용

트랜잭션 속성과 그에 따른 트랜잭션 전략을 UserService에 적용해보자

#### 트랜잭션 경계설정의 일원화 (p.526)
트랜잭션 경계설정의 부가기능을 여러 계층에서 중구난방으로 적용하는 것은 좋지 않다.
특정계층의 경계를 트랜잭션 경계와 일치시키는 것이 바람직하다.

물론 아키텍처를 단순하게 가져가면 서비스 계층과 DAO가 통합될 수도 있지만, 비즈니스 로직을 독자적으로 두고 테스트하려면 서비스 계층을 만들어 사용해야 한다.

```java
public interface UserService {
	void add(User user);
    
    //추가된 메소드
    User get(String id); 
    void deleteAll();
    void update(User user);
    
    void upgradeLevels();
}
```
6-76을 보면 4개의 신규 메소드가 추가되었음을 확인할 수 있다.

```java
//추가된 메소드들의 구현 코드 넣어주기
public class UserServiceImpl implements UserService {
	UserDao userDao;
    ...
    //DAO로 위임하도록 만듦
    public void deleteAll() { userDao.deleteAll(); }
    public User get(String id) { return userDao.get(id); }
    public List<User> getAll() { return UserDao.getAll(); }
    public void update(User user) { userDao.update(user); }
    ...
}
```
그리고 6-77처럼 UserServiceImpl 클래스에 추가된 메소드 구현 코드를 넣어준다.

이제 모든 User 관련 데이터 조작은 UserService라는 트랜잭션 경계를 통해 진행할 경우 모두 트랜잭션을 적용할 수 있게 되었다.

#### 서비스 빈에 적용되는 포인트컷 표현식 등록 (p.528)
upgraderLevels()에만 트랜잭션이 적용되게 했던 기존 포인트컷 표현식을 모든 비즈니스 로직의 서비스 빈에 적용되도록 수정한다.

6-78을 보면 Service 앞에 * 붙은 것을 볼 수 있다. 모든 로직의 서비스 빈에 적용된다.

#### 트랜잭션 속성을 가진 트랜잭션 어드바이스 등록 (p.528)
트랜잭션 관련된 코드로 모두 수정하는 것이므로 p.531까지 읽어보는 게 좋을 것 같다.


## 6.7 애노테이션 트랜잭션 속성과 포인트컷

포인트컷 표현식과 트랜잭션 속성을 이용해 트랜잭션을 일괄적으로 적용하는 방식은 복잡한 트랜잭션 속성이 요구되지 않는 한 대부분의 상황에 잘 들어맞는다. 그런데 가끔은 클래스나 메소드에 따라 제각각 속성이 다른 , 세밀하게 튜닝된 트랜잭션 속성을 적용해야 하는 경우도 있다. 
이런 경우라면 메소드 이름 패턴을 이용해서 일괄적으로 트랜잭션 속성을 부여하는 방식은 적합하지 않다.

- [7] 스프링에는 일괄적으로 속성을 부여하는 방법 대신 **직접 타깃에 트랜잭션 속성정보를 가진 애노테이션을 지정하는 방법**이 존재한다.

### 6.7.1 트랜잭션 애노테이션

트랜잭션 주요 메타 애노테이션에 대해서 알아보자.

#### @Transactional (p.532)
```java
package org.springframework.transaction.annotation;
...

@Target({ElementType.METHOD, ElementType.TYPE}) // 애노테이션을 사용할 대상 지정
@Retention(RetentionPolicy.RUNTIME) // 애노테이션 정보가 언제까지 유지되는지를 지정
@Inherited //상속을 통해서도 애노테이션 정보를 얻을 수 있게 함
@Documented

public @interface Transactional { //트랜잭션 속성의 모든 항목을 엘리먼트로 지정
	String value() default "";
    Propagation isolation() default Isolation.DEFAULT;
    int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;
    boolean readOnlt() default false;
    Class<? extends Trowable>[] noRollbackFor() default {};
    /string[] noRollbackForClassName() default {};
}
```

6-84 코드는 @Transaction 애노테이션을 정의한 코드다.
이는 단순하고 직관적이라 이해하기 쉬우므로 넘어가겠다.

@Transactional은 **메소드, 클래스, 인터페이스**에 사용할 수 있다.  
@Transactional 애노테이션을 속성정보로 사용하도록 지정하면 스프링은 **@Transactional이 부여된 모든 오브젝트를 자동으로 타깃 오브젝트로 인식**한다.

#### 트랜잭션 속성을 이용하는 포인트컷  (p.533)

![](https://i.imgur.com/c0EEi23.png)

그림 6-24는 @Transactional 애노테이션을 사용했을 때 어드바이저의 동장방식을 보여준다.
짧게 설명하자면
- **TxInterceptor**는 **@Transactional 애노테이션의 엘리먼트**에서 트랜잭션 속성을 가져오는 **AnnotationTransactionAttributeSource 사용**한다.
- **포인트컷** 또한 **@Transactional을 통한 트랜잭션 설정정보를 참조하도록** 만든다.

**트랜잭션 부가기능 적용 단위는 메소드**이기 때문에 **메소드마다 @Transactional을 사용**할 수 있다. 
하지만 이렇게 모든 메소드를 제어한다면 코드는 지저분해지고, 동일한 속성정보를 반복적으로 부여해주는 결과가 나타날 것이다.

#### 대체 정책 (p.534)
위의 문제 떄문에 스프링은 @Transactional을 사용할 때 4단계의 대체 정책을 이용하게 해 준다.

이는 **타깃 메소드, 타깃 클래스, 선언 메소드, 선언 타입의 순서**에 따라서 @Transactional이 적용됐는지 차례로 확인하고, 가장 먼저 발견되는 속성정보를 사용하게 하는 방법이다.

```java
//@Transactional이 적용되었는지 첫번째 후보부터 확인 가장먼저 발견되는 정보 사용

[1] // 타깃의 인터페이스 - 네번째 후보
public interface Service {
	[2] // 타깃의 인터페이스의 메소드 - 세번째 후보
    void method1();
    [3] // 타깃의 인터페이스의 메소드 - 세번째 후보
    void method2();
}
[4] // 타깃 클래스 - 두번째 후보
public class ServiceImpl implements Service {
	[5] // 타깃오브젝트의 메소드 - 첫번째 후보
    public void method1() {
    }
    [6] // 타깃오브젝트의 메소드 - 첫번째 후보
    public void method2() {
    }
}
```

타깃 오브젝트의 메소드 부터 시작해서 5&6이 첫번째 후보가 된다.
만약 애노테이션이 발견되면 바로 애노테이션의 속성을 가져다 해당 메소드의 트랜잭션 속성으로 사용한다.

@Transactional이 없다면 다음 타깃 클래스인 4에 존재하는지 확인한다.

타깃 클래스에도 없다면 스프링은 메소드가 선언된 인터페이스로 넘어간다. 따라서 2와 3을 확인해보고, 인터페이스 메소드에도 없다면 마지막 단계인 인터페이스 타입 1의 위치에 애노테이션이 있는지 확인한다.

@Transactional을 사용하면 대체 정책을 잘 활용해서 애노테이션 자체는 최소한으로 상요하면서도 세밀한 제어가 가능하다.

### 6.7.2 트랜잭션 애노테이션 적용

직접 적용해보는 예시는 생략. 직접 읽어보는게 좋을 것이다.
(p.539로 ㄱㄱ)

## 6.8 트랜잭션 지원 테스트

### 6.8.1 선언적 트랜잭션과 트랜잭션 전파 속성

트랜잭션의 적용 덕분에 불필요한 코드 중복을 피할 수 있고, 애플리케이션을 작은 기능 단위로 쪼개서 개발할 수도 있다.

만약 **트랜잭션의 전파 방식**을 이용할 수 없었다면 어떻게 될까?
UserService의 add() 메소드는 매번 트랜잭션을 시작하도록 만들어졌을 것이고...
다른 메소드 안에 코드를 그대로 복사해서 사용하여 중복도 많이 일어났을 것이다.

다행히 스프링은 트랜잭션 전파 속성을 선언적으로 적용할 수 있는 기능을 제공한다.
-> 중복된 코드를 관리할 필요 없이 **선언을 통해 속성을 부여**할 수 있다.


> - **선언적 트랜잭션** : **AOP를 이용**해 **코드 외부에서 트랜잭션의 기능을 부여**해주고 **속성을 지정**할 수 있게 하는 방법
> - **프로그램에 의한 트랜잭션** : **TransactionTemplate**나 **개별 데이터 기술의 트랜잭션 API를 사용**해 **직접 코드 안에서 사용**하는 방법  
>       
>       
>     =>스프링은 두 가지 방법 모두 지원하지만, **특별한 경우가 아니라면 선언적 방식 권장**한다.


### 6.8.2 트랜잭션 동기화와 테스트

이렇게 트랜잭션의 자유로운 전파와 그로 인한 유연한 개발이 가능할 수 있었던 기술적인 배경에는 **AOP**가 있다.
-> AOP 덕분에 프록시를 이용한 트랜잭션 부가기능을 간단하게 애플리케이션 전반에 적용할 수 있게 되었다.
또 한가지 중요한 기술은 바로 **스프링의 트랜잭션 추상화** 이다.

트랜잭션 추상화가 없었다면 AOP를 통한 선언적 트랜잭션이나 트랜잭션 전차 등은 불가능했을 것이다.

#### 트랜잭션 매니저와 트랜잭션 동기화 (p.542)
트랜잭션 추상화 기술의 핵심은 트랜잭션 매니저와 트랜잭션 동기화다.

지금은 모든 트랜잭션을 선언적으로 AOP로 적용하고있지만, **필요하다면 프로그램에 의한 트랜잭션 방식을 함께 사용할 수도 있다.** 스프링의 테스트 컨텍스트를 이용한 테스트에서는 @Autowired를 통해 애플리케이션 컨텍스트에 등록된 빈을 가져와 테스트 목적으로 활용할 수 있었다.  
  즉, **트랜잭션 매니저 빈도 가져올 수 있는 것이다!**

```java
//트랜잭션 매니저를 참조하는 메소드
@RunWith(SpringJUnir4ClassRummer.class)
@ContextConfiguration(location = "/test-applicationContext.xml")
public class UserServiceTest{
	@Autowired
    PlatformTransactionManager transactionManager;
}


//간단한 테스트 메소드
@Test
public void transactionSync() {
	userService.deleteAll(); //트랜잭션 생성
    
    userService.add(users.get(0)); //트랜잭션 생성
    userService.add(users.get(1)); //트랜잭션 생성
}
```

테스트 메소드를 통해 3개의 트랜잭션이 생성된 것을 볼 수 있다.

#### 트랜잭션 매니저를 이용한 테스트용 트랜잭션 제어 (p.543)
3개의 트랜잭션을 **하나로 통합**할 수는 없을까?

**메소드들이 호출되기전에 트랜잭션이 시작되게만 한다면 가능**하다. UserService에 새로운 메소드를 만들어 그안에서 위 메소드들을 실행하면된다.  

 그런데, 메소드를 추가하지 않고도 테스트 코드만으로 세 메소드 트랜잭션을 통합하는 방법이 있다! **UserService 메소드 호출 전**에 **트랜잭션을 미리 시작**해주면 된다.

```java
@Test
public void transactionSync() {
	//트랜잭션 정의는 디폴트 값 사용
	DefaultTransactionDefinition txDefinition = new DefaultTransactionDefinition();
    //트랜잭션 매니저에게 트랜잭션 요청
    TransactionStatus txStatus = transactionManager.getTransaction(txDefinition);
    
    //트랜잭션 생성
    userService.deleteAll();
    
    userService.add(users.get(0)); 
    userService.add(users.get(1)); 
    //트랜잭션 종료
    
    transactionManager.commit(txStatus); //트랜잭션 커밋
}
```

#### 트랜잭션 동기화 검증 (p.544)
위의 코드를 실행하면 테스트는 성공하지만,
실제로 하나의 트랜잭션으로 통합되어 실행되는지는 확인할 수 없다.
이를 트랜잭션 속성을 변경하여 검증해보자.

이거에 대해서는 deleteAll()의 트랜잭션 속성은 쓰기가능인데, 먼저 실행된 트랜잭션이 읽기전용이면 참여시 예외가 터지는 것을 보여준다.
먼저 실행된 트랜잭션의 속성을 따라가기 때문이다.

그러한 내용을 p.547까지 읽어보면 좋을 것 같다.

#### 롤백 테스트 (p.547)
테스트 코드로 트랜잭션을 제어해서 적용할 수 있는 테스트 기법이다.
롤백 테스트는 테스트 내의 모든 DB 작업을 하나의 트랜잭션 안에서 동작하게 하고, 테스트가 끝나면 무조건 롤백해버리는 테스트이다.

> [!note] 롤백 테스트 장점
> - **테스트가 수행되어도 DB에 영향을 주지 않음**  
> 	- DB를 사용하는 테스트는 항상 시작전에 번거로운 초기화 작업이 필요했음  
> 	- 롤백을 이용한다면 테스트를 시작하기위한 초기화 작업이 필요없어짐  
> 	- 파일을 전부 날려버려도, 예외가 발생해도 롤백되기때문에 DB가 꼬이거나 손상되는 문제에 대해 생각하지 않아도됨
> - **여러 개발자가 하나의 공용 테스트용 DB를 사용할 수 있게해줌**  
> 	- 모두가 테스트의 마지막엔 롤백을 시키기때문에 하나의 DB만 존재해도 됨

### 6.8.3 테스트를 위한 트랜잭션 애노테이션 

@Transactional 애노테이션을 타깃 클래스 또는 인터페이스에 부여하는 것만으로 트랜잭션을 적용해주는 것은 매우 편리한 기술이다.
이 편리한 방법을 테스트 클래스와 메소드에도 적용할 수 있다.

#### @Transactional (p.549)
**테스트에도 @Transactional을 적용할 수 있다.** 테스트 클래스 또는 메소드에 @Transactional 애노테이션을 부여해주면 타깃 클래스나 인터페이스에 적용된 것 처럼 테스트 메소드에 트랜잭션 경계가 자동으로 설정된다.  
- **테스트 내에서 진행하는 모든 트랜잭션 관련 작업을 하나로 묶을 수 있다.**

```java
@Test
@transactional //앞서 만들었던 테스트와 같은 결과를 가져옴!
public void transactionSync() {
	userService.deleteAll();
    userService.add(users.get(0));
    userService.add(users.get(1));
}
```
6-97에서 메소드 안에서 실행되는 deleteAll(), add() 등은 테스트 메소드의 트랜잭션에 참여해서 하나의 트랜잭션으로 실행된다.

#### @Rollback (p.551)
**@Transactional은 테스트에 적용하면 강제 롤백이 되도록 설정**되어있다.  
- @Transactional을 쓰는것으로 이미 롤백테스트가 되는 것이다.
그렇다면 **롤백을 원하지 않으면** 직접 트랜잭션을 설정해야할까?  
- **@Rollback 애노테이션을 사용**하면 된다. - 롤백 여부를 지정 -> 원하지 않는다면 @Rollback(false)

#### @TransactionConfiguration (p.552)
**@Transactional**은 테스트 클래스에 넣어 **모든 테스트 메소드에 일괄 적용이 가능**하다.
근데 Rollback은 메소드 레벨에만 적용할 수 있다.
- **모든 메소드에 트랜잭션을 적용하면서 롤백하지 않으려면** 어떻게 해야 할까?  
- **클래스 레벨에 부여할 수 있는 @TransactionConfiguration을 이용**하면 편하다.

#### NotTransactional과 Propagation.NEVER@Not
@Transactional을 적용할 때, **트랜잭션이 적용되면 안되는 메소드가 있다면** 어떻게 해야 할까?  
- **@NotTransactional을 테스트 메소드에 부여**하면 Transactional의 기본 설정 무시 가능.  
**❗ @NotTransactional이 스프링 3.0에서 제거대상**이 되었기에 **트랜잭션 테스트와 비 트랜잭션 테스트를 따로 만들도록 권장**함  
- **@Transactional의 속성**을 **NEVER**로 하면 트랜잭션이 **시작되지않음**

## 6.9 정리
