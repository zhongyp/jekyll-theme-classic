---
layout: post
title: "Dubbo工作原理"
date: 2018-01-15
tag: "Dubbo"
detail: 
img: 

---

* content
{:toc}

[尊重原创：参考文档：http://blog.csdn.net/nethackatschool/article/details/78560574](http://blog.csdn.net/nethackatschool/article/details/78560574)

## Dubbo启动初始化

我们大都可能都是用过Dubbo分布式服务架构，但是大部分使用的人可能只是使用并不了解Dubbo是怎样初始化加载的，本篇博文将使用最简单的dubbo-demo例子来描述Dubbo的启动初始化。

## 服务暴露

dubbo框架设计总共分了10层： 

* 服务接口层（Service）：该层是与实际业务逻辑相关，就如下面面demo配置的`<dubbo:service interface="com.xxx.xxx.xxxService" ref="xxxService" timeout="5000"/>`,这个service就是业务方自己定义的接口与其实现。

* 配置层（Config）：该层是将业务方的service信息，配置文件的信息收集起来，主要是以ServiceConfig和ReferenceConfig为中心，ServiceConfig是服务提供方的配置，当Spring启动的时候会相应的启动provider服务发布和注册的过程，当service在spring容器加载完成后，ServiceBean通过监听器监听spring容器是否加载完毕，然后出发监听方法，onApplicationEvent->export->doExport->doExportUrls->doExportUrlsFor1Protocol,最后得到provider的代理对象invoker，Procotol将invoker封装为Exporter。

* 服务代理层（Proxy）：对服务接口进行透明代理，生成服务的客户端和服务器端，使服务的远程调用就像在本地调用一样。默认使用JavassistProxyFactory，返回一个Invoker，Invoker则是个可执行核心实体，Invoker的invoke方法通过反射执行service方法。

* 服务注册层（Registry）：封装服务地址的注册和发现，以服务URL为中心，基于zk。

* 集群层（Cluster）:提供多个节点并桥接注册中心，主要负责负载均衡（loadBanlance）、容错。

* 监控层（Monitor）：RPC调用次数和调用时间监控，以Statistics为中心，扩展接口为MonitorFactory、Monitor和MonitorService。

* 远程调用层（Protocol）：封装RPC调用，provider通过export方法进行暴露服务/consumer通过refer方法调用服务。而Protocol依赖的是Invoker。通过上面说的Proxy获得的Invoker，包装成Exporter。

* 信息交换层（Exchange）：该层封装了请求响应模型，将同步转为异步，信息交换层依赖Exporter，最终将通过网络传输层接收调用请求RequestFuture和ResponseFuture。

* 网络传输层（Transport）：抽象mina和netty为统一接口，以Message为中心，扩展接口为Channel、Transporter、Client、Server和Codec。

* 数据序列化层：该层无需多言，将数据序列化反序列化。

先看到demo中的spring-dubbo配置文件。这些配置文件全都会被装配成RegistryConfig，其属性如下：

```aidl

public class RegistryConfig extends AbstractConfig {

    private static final long serialVersionUID = 5508512956753757169L;

    public static final String NO_AVAILABLE = "N/A";

    // 注册中心地址
    private String            address;

    // 注册中心登录用户名
    private String            username;

    // 注册中心登录密码
    private String            password;

    // 注册中心缺省端口
    private Integer           port;

    // 注册中心协议
    private String            protocol;

    // 客户端实现
    private String            transporter;

    private String            server;

    private String            client;

    private String            cluster;

    private String            group;

    private String            version;

    // 注册中心请求超时时间(毫秒)
    private Integer           timeout;

    // 注册中心会话超时时间(毫秒)
    private Integer           session;

    // 动态注册中心列表存储文件
    private String            file;

    // 停止时等候完成通知时间
    private Integer           wait;

    // 启动时检查注册中心是否存在
    private Boolean           check;

    // 在该注册中心上注册是动态的还是静态的服务
    private Boolean           dynamic;

    // 在该注册中心上服务是否暴露
    private Boolean           register;

    // 在该注册中心上服务是否引用
    private Boolean           subscribe;

    // 自定义参数
    private Map<String, String> parameters;

    // 是否为缺省
    private Boolean             isDefault;

```
这些配置文件根据注册中心的个数会被装配拼接成Dubbo的URL（该url是dubbo中自定义的），该URL长这个样子
```aidl

registry://sit-zk.host:2181/com.alibaba.dubbo.registry.RegistryService?application=ifenqu-web&dubbo=2.5.3&pid=13168&registry=zookeeper&timestamp=1510828420296 

```

看完配置信息，接下来让我们看下Service发布的核心方法：ServiceConfig类中的doExportUrls
```aidl

private void doExportUrls() {
    //该方法根据配置文件装配成一个URL的list
    List<URL> registryURLs = loadRegistries(true);
    //根据每一个协议配置来分别暴露服务
    for (ProtocolConfig protocolConfig : protocols) {
        doExportUrlsFor1Protocol(protocolConfig, registryURLs);
    }
}


```

这个protocols长这个样子`<dubbo:protocol name="dubbo" port="20888" id="dubbo" /> `protocols也是根据配置装配出来的。接下来让我们进入doExportUrlsFor1Protocol方法看看dubbo具体是怎么样将服务暴露出去的。这个方法特别大，有将近300多行代码，但是其中大部分都是获取类似protocols的name、port、host和一些必要的上下文，代码太长就不全都贴出来了，只贴关键部分。

```aidl

private void doExportUrlsFor1Protocol(ProtocolConfig protocolConfig, List<URL> registryURLs) { 
//........省略获取上下文代码
//通过interfaceClass获取要暴露服务的所有要暴露的方法
String[] methods = Wrapper.getWrapper(interfaceClass).getMethodNames();
//.......省略非核心代码
//根据上下文创建URL对象
 URL url = new URL(name, host, port, (contextPath == null || contextPath.length() == 0 ? "" : contextPath + "/") + path, map);

//通过proxyFactory来获取Invoker对象
 Invoker<?> invoker = proxyFactory.getInvoker(ref, (Class) interfaceClass, registryURL.addParameterAndEncoded(Constants.EXPORT_KEY, url.toFullString()));
//将invoker对象在protocol中封装成Exporter方便提供给信息交换层进行网络传输
 Exporter<?> exporter = protocol.export(invoker);
 //将exporter添加到list中
 exporters.add(exporter);

```
看到这里就比较明白dubbo的工作原理了doExportUrlsFor1Protocol方法，先创建URL，URL创建出来长这样`dubbo://192.168.xx.63:20888/com.xxx.xxx.VehicleInfoService?anyhost=true&application=test-web&default.retries=0&dubbo=2.5.3&interface=com.xxx.xxx.VehicleInfoService&methods=get,save,update,del,list&pid=13168&revision=1.2.38&side=provider&timeout=5000&timestamp=1510829644847`，是不是觉得这个URL很眼熟，没错在注册中心看到的services的providers信息就是这个，再传入url通过proxyFactory获取Invoker，再将Invoker封装成Exporter的数组，只需要将这个list提供给网络传输层组件，然后consumer执行Invoker的invoke方法就行了。让我们再看看这个proxyFactory的getInvoker方法。proxyFactory下有JDKProxyFactory和JavassistProxyFactory。官方推荐也是默认使用的是JavassistProxyFactory。因为javassist动态代理性能比JDK的高。

```aidl

public class JavassistProxyFactory extends AbstractProxyFactory {

    @SuppressWarnings("unchecked")
    public <T> T getProxy(Invoker<T> invoker, Class<?>[] interfaces) {
        return (T) Proxy.getProxy(interfaces).newInstance(new InvokerInvocationHandler(invoker));
    }

    public <T> Invoker<T> getInvoker(T proxy, Class<T> type, URL url) {
        // TODO Wrapper类不能正确处理带$的类名
        final Wrapper wrapper = Wrapper.getWrapper(proxy.getClass().getName().indexOf('$') < 0 ? proxy.getClass() : type);
        return new AbstractProxyInvoker<T>(proxy, type, url) {
            @Override
            protected Object doInvoke(T proxy, String methodName, 
                                      Class<?>[] parameterTypes, 
                                      Object[] arguments) throws Throwable {
                return wrapper.invokeMethod(proxy, methodName, parameterTypes, arguments);
            }
        };
    }

}

```
可以看到使用了动态代理的方式调用了要暴露的service的方法。并且返回了Invoker对象。在dubbo的服务发布中我们可以看到，这个Invoker贯穿始终，都可以看成是一个context的作用了，让我们进Invoker里面去看看这个Invoker到底是何方神圣。

```aidl

public interface Invoker<T> extends Node {

    /**
     * get service interface.
     * 
     * @return service interface.
     */
    Class<T> getInterface();

    /**
     * invoke.
     * 
     * @param invocation
     * @return result
     * @throws RpcException
     */
    Result invoke(Invocation invocation) throws RpcException;
}

```
这个Invoker就两个方法，一个getInterface，也就是要暴露的服务接口，一个就是invoke方法，这个invoke方法在AbstractProxyInvoker中是这样的：

```aidl

public Result invoke(Invocation invocation) throws RpcException {
    try {
    //调用doInvoke方法，返回一个Result
        return new RpcResult(doInvoke(proxy, invocation.getMethodName(), invocation.getParameterTypes(), invocation.getArguments()));
    } catch (InvocationTargetException e) {
        return new RpcResult(e.getTargetException());
    } catch (Throwable e) {
        throw new RpcException("Failed to invoke remote proxy method " + invocation.getMethodName() + " to " + getUrl() + ", cause: " + e.getMessage(), e);
    }
}

```
其实看到JavassistProxyFactory大家就应该大概明白了这个Invoker的作用，同时这个类的名字就叫Invoker也可以猜个大概，Invoker就是调用service的方法的实体类。其中doInvoke方法已经在JavassistProxyFactory中定义了，通过反射调用要暴露的service的方法。


业务方将服务接口和实现编写定义好，添加dubbo相关配置文件。

* Config层加载配置文件形成上下文，Config层包括：ServiceConfig、ProviderConfig、RegistryConfig等。

* ServiceConfig根据Protocol类型，根据ProtocolConfig、ProviderConfig加载registry，根据加载的registry创建dubbo的URL。

* 准备工作做完后ProxyFactory上场，dubbo中有两种代理方式，JDK代理和Javassist代理，默认使用Javassist代理，Proxy代理类根据dubbo配置信息获取到接口信息、通过动态代理方式将接口的所有方法交给Proxy代理类进行代理，并封装进Invoker里面。

* 将所有需要暴露的service封装的Invoker组成一个list传给信息交换层提供给消费方进行调用。

有需要的同学可以去下载源码这样可能更方便了解

Demo代码[下载地址](https://github.com/zhongyp/bodu/bodu-dubbo)

代码结构：

src

+ main

	+ java
		+ com.bodu.dubbo
			+ api
				+ DemoService.java
			+ consumer
				+ Consumer.java
			+ producer
				+ DemoServiceImpl.java
				+ Producer
	+ resources
		+ dubbo-demo-producer.xml
		+ dubbo-demo-consumer.xml

+ pom.xml


pom.xml

```

  <properties>
    <dubbo.version>2.5.4</dubbo.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>3.8.1</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>com.alibaba</groupId>
      <artifactId>dubbo</artifactId>
      <version>${dubbo.version}</version>
    </dependency>
  </dependencies>

```

DemoService.java

```

public interface DemoService {

    String sayHello(String name);

}

```


Producer.java

```

public class Producer {

    public static void main(String[] args) throws Exception {
        
		System.setProperty("java.net.preferIPv4Stack", "true");
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"dubbo-demo-producer.xml"});
        context.start();
		// 添加监听，点击任何键，退出服务
        System.in.read(); // press any key to exit
    }

}

```

DemoServiceImpl.java
```

public class DemoServiceImpl implements DemoService {

    @Override
    public String sayHello(String name) {
        System.out.println("[" + new SimpleDateFormat("HH:mm:ss").format(new Date()) + "] Hello " + name + ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return "Hello " + name + ", response form provider: " + RpcContext.getContext().getLocalAddress();
    }

}

```


dubbo-demo-producer.xml

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
       http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

    <!-- 生产者的名称，用于跟踪依赖关系 -->
    <dubbo:application name="demo-provider"/>

    <!-- 使用组播注册中心来暴露服务 -->
    <dubbo:registry address="multicast://224.5.6.7:1234"/>

    <!-- 使用dubbo协议暴露服务 -->
    <dubbo:protocol name="dubbo" port="20880"/>

    <!-- 接口的实现类 -->
    <bean id="demoService" class="com.bodu.dubbo.producer.DemoServiceImpl"/>

    <!-- 定义用于暴露的服务接口 -->
    <dubbo:service interface="com.bodu.dubbo.api.DemoService" ref="demoService"/>

</beans>

```


```
public class Main{

    public static void main(String[] arsgs){
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"dubbo-demo-producer.xml"});// 获取dubbo-demo-producer.xml配置文件
        context.start();// 初始化配置文件
    }

}

```

Consumer.java
```
public class Consumer {

    public static void main(String[] args) {
        //Prevent to get IPV6 address,this way only work in debug mode
        //But you can pass use -Djava.net.preferIPv4Stack=true,then it work well whether in debug mode or not
        // 防止取到IPV6的地址，这种方式仅适用于debug模式，但是你可以直接使用-Djava.net.preferIPv4Stack=true，这样不管是否是debug模式，运行都不会有问题
        System.setProperty("java.net.preferIPv4Stack", "true");
        // 获取配置文件初始化xml
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"dubbo-demo-consuner.xml"});
        context.start();
        // 获取远程服务代理
        DemoService demoService = (DemoService) context.getBean("demoService"); // get remote service proxy
        // 循环访问远程代理服务
        while (true) {
            try {
                Thread.sleep(1000);
                String hello = demoService.sayHello("world"); // call remote method
                System.out.println(hello); // get result

            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }

    }

```

dubbo-demo-consumer.xml

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
       http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

    <!-- 消费者的名称，用于跟踪依赖关系，不要和生产者名称相同  -->
    <dubbo:application name="demo-consumer"/>

    <!-- 使用广播发现服务 -->
    <dubbo:registry address="multicast://224.5.6.7:1234"/>

    <!-- 生成远程服务代理，远程服务代理可以向使用本地的接口一样使用 -->
    <dubbo:reference id="demoService" check="false" interface="com.bodu.dubbo.api.DemoService"/>

</beans>

```
