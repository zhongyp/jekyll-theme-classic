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

## Dubbo启动初始化

我们大都可能都是用过Dubbo分布式服务架构，但是大部分使用的人可能只是使用并不了解Dubbo是怎样初始化加载的，本篇博文将使用最简单的dubbo-demo例子来描述Dubbo的启动初始化。

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

我们以上面这个生产者服务的例子去了解Dubbo的初始化。

当前Dubbo服务由下面两行代码实现，这个是一个很正常的一个初始化Bean的操作。

```
ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"dubbo-demo-producer.xml"});// 获取dubbo-demo-producer.xml配置文件
context.start();// 初始化配置文件

```

那么，我们就先了解一下Bean的初始化。












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
