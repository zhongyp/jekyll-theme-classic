---
layout: post
title: "数据存储-Spring事务"
date: 2018-03-17
tag: "数据存储"
detail: 了解事务的多种应用场景、配置及代码实现
img: 

---

* content
{:toc}


## 事务传播特性

[源码实例](https://github.com/zhongyp/Demo)

## 分布式事务

## Spring 事务（转载）

[参考博文：https://www.cnblogs.com/qjjazry/p/6366204.html](https://www.cnblogs.com/qjjazry/p/6366204.html)

事务原本是数据库中的概念，在 Dao 层。但一般情况下，需要将事务提升到业务层，即 Service 层。这样做是为了能够使用事务的特性来管理具体的业务。  

在 Spring 中通常可以通过以下三种方式来实现对事务的管理： 

1. 使用 Spring 的事务代理工厂管理事务 

2. 使用 Spring 的事务注解管理事务 

3. 使用 AspectJ 的 AOP 配置管理事务 

Spring 的事务管理，主要用到两个事务相关的接口。

 ![Spring事务接口](https://github.com/zhongyp/zhongyp.github.io/blob/master/styles/images/article/transaction.jpg?raw=true)

## 事务管理器接口
 
事务管理器是 PlatformTransactionManager 接口对象。其主要用于完成事务的提交、回滚，及获取事务的状态信息。

```aidl

    Public interface PlatformTransactionManager()...{  
    // 由TransactionDefinition得到TransactionStatus对象
    TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException; 
    // 提交
    Void commit(TransactionStatus status) throws TransactionException;  
    // 回滚
    Void rollback(TransactionStatus status) throws TransactionException;  
    } 

```
  
A) 常用的两个实现类，PlatformTransactionManager 接口有两个常用的实现类：  
　　　　　　　　　　
* DataSourceTransactionManager：使用 JDBC 或 iBatis  进行持久化数据时使用。  

如果应用程序中直接使用JDBC来进行持久化，DataSourceTransactionManager会为你处理事务边界。为了使用DataSourceTransactionManager，你需要使用如下的XML将其装配到应用程序的上下文定义中：

```aidl
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource" />
    </bean>
    
```
 
实际上，DataSourceTransactionManager是通过调用java.sql.Connection来管理事务，而后者是通过DataSource获取到的。通过调用连接的commit()方法来提交事务，同样，事务失败则通过调用rollback()方法进行回滚。

　　
* HibernateTransactionManager：使用 Hibernate 进行持久化数据时使用。 

如果应用程序的持久化是通过Hibernate实现的，那么你需要使用HibernateTransactionManager。对于Hibernate3，需要在Spring上下文定义中添加如下的<bean>声明：

```aidl
    <bean id="transactionManager" class="org.springframework.orm.hibernate3.HibernateTransactionManager">
        <property name="sessionFactory" ref="sessionFactory" />
    </bean>
    
```
sessionFactory属性需要装配一个Hibernate的session工厂，HibernateTransactionManager的实现细节是它将事务管理的职责委托给org.hibernate.Transaction对象，而后者是从Hibernate Session中获取到的。当事务成功完成时，HibernateTransactionManager将会调用Transaction对象的commit()方法，反之，将会调用rollback()方法。


B) PlatformTransactionManager其他实现类

Spring事务管理的一个优点就是为不同的事务API提供一致的编程模型，如JTA(事务)、JPA(持久化)。下面分别介绍各个平台框架实现事务管理的机制。

* Java持久化API事务（JPA）

Hibernate多年来一直是事实上的Java持久化标准，但是现在Java持久化API作为真正的Java持久化标准进入大家的视野。如果你计划使用JPA的话，那你需要使用Spring的JpaTransactionManager来处理事务。你需要在Spring中这样配置JpaTransactionManager：

```aidl
    <bean id="transactionManager" class="org.springframework.orm.jpa.JpaTransactionManager">
        <property name="sessionFactory" ref="sessionFactory" />
    </bean>
    
```
 
JpaTransactionManager只需要装配一个JPA实体管理工厂（javax.persistence.EntityManagerFactory接口的任意实现）。JpaTransactionManager将与由工厂所产生的JPA EntityManager合作来构建事务。

* Java原生API事务(JTA)

如果你没有使用以上所述的事务管理，或者是跨越了多个事务管理源（比如两个或者是多个不同的数据源），你就需要使用JtaTransactionManager：

```aidl
    <bean id="transactionManager" class="org.springframework.transaction.jta.JtaTransactionManager">
        <property name="transactionManagerName" value="java:/TransactionManager" />
    </bean>
    
```
 
JtaTransactionManager将事务管理的责任委托给javax.transaction.UserTransaction和javax.transaction.TransactionManager对象，其中事务成功完成通过UserTransaction.commit()方法提交，事务失败通过UserTransaction.rollback()方法回滚。


C) Spring 的回滚方式 
　　
* Spring 事务的默认回滚方式是：发生运行时异常时回滚，发生受查异常时提交。不过，对于受查异常，程序员也可以手工设置其回滚方式。

## 事务定义接口

事务定义接口 TransactionDefinition 中定义了事务描述相关的三类常量：事务隔离级别、事务传播行为、事务默认超时时限，及对它们的操作。

A) 定义了五个事务隔离级别常量,这些常量均是以 ISOLATION_开头。即形如 ISOLATION_XXX： 
　　　　　　　　 
* DEFAULT：采用DB默认的事务隔离级别。MySql的默认为REPEATABLE_READ；  Oracle默认为 READ_COMMITTED。 
　　
* READ_UNCOMMITTED：读未提交。未解决任何并发问题。 
　　
* READ_COMMITTED：读已提交。解决脏读，存在不可重复读与幻读。  
　　
* REPEATABLE_READ：可重复读。解决脏读、不可重复读，存在幻读  
　　
* SERIALIZABLE：串行化。不存在并发问题。

B) 定义了七个事务传播行为常量，所谓事务传播行为是指，处于不同事务中的方法在相互调用时，执行期间事务的维护情况。如，A 事务中的方法 doSome()调用 B 事务中的方法 doOther()，在调用执行期间事务的维护情况，就称为事务传播行为。事务传播行为是加在方法上的。事务传播行为常量都是以 PROPAGATION_  开头，形如 PROPAGATION_XXX。  
　　
* REQUIRED：指定的方法必须在事务内执行。若当前存在事务，就加入到当前事务中；若当前没有事务，则创建一个新事务。这种传播行为是最常见的选择，也是Spring 默认的事务传播行为。如该传播行为加在 doOther()方法上。若 doSome()方法在执行时就是在事务内的，则 doOther()方法的执行也加入到该事务内执行。若 doSome()方法没有在事务内执行，则 doOther()方法会创建一个事务，并在其中执行。
　　
* SUPPORTS：指定的方法支持当前事务，但若当前没有事务，也可以以非事务方式执行。 

* MANDATORY：指定的方法必须在当前事务内执行，若当前没有事务，则直接抛出异常。

* REQUIRES_NEW：总是新建一个事务，若当前存在事务，就将当前事务挂起，直到新事务执行完毕。

* NOT_SUPPORTED：指定的方法不能在事务环境中执行，若当前存在事务，就将当前事务挂起。

* NEVER：指定的方法不能在事务环境下执行，若当前存在事务，就直接抛出异常。

* NESTED：指定的方法必须在事务内执行。若当前存在事务，则在嵌套事务内执行；若当前没有事务，则创建一个新事务。嵌套事务在外部事务提交后，才真正的提交。

C) 定义了默认事务超时时限 

* 常量 TIMEOUT_DEFAULT 定义了事务底层默认的超时时限，及不支持事务超时时限设置的 none 值。 

* 注意，事务的超时时限起作用的条件比较多，且超时的时间计算点较复杂。所以，该值一般就使用默认值即可。

## Spring 的事务代理工厂管理事务

```aidl

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="
        http://www.springframework.org/schema/beans 
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context 
        http://www.springframework.org/schema/context/spring-context.xsd">
    
    <!-- 注册数据源：C3P0数据源 -->
    <bean id="myDataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
        <property name="driverClass" value="${jdbc.driverClass}" />
        <property name="jdbcUrl" value="${jdbc.url}" />
        <property name="user" value="${jdbc.user}" />
        <property name="password" value="${jdbc.password}" />
    </bean>
    
    <!-- 注册JDBC属性文件 -->
    <context:property-placeholder location="classpath:jdbc.properties"/>
    
    <!-- 注册Dao -->
    <bean id="accountDao" class="com.tongji.dao.AccountDaoImpl">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <bean id="stockDao" class="com.tongji.dao.StockDaoImpl">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <!-- 注册Service -->
    <bean id="stockService" class="com.tongji.service.StockProcessServiceImpl">
        <property name="accountDao" ref="accountDao"/>
        <property name="stockDao" ref="stockDao"/>
    </bean>    
    
    <!-- 事务 -->
    <!-- 注册事务管理器 -->
    <bean id="myTxManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <!-- 生成事务代理 -->
    <bean id="stockServiceProxy" class="org.springframework.transaction.interceptor.TransactionProxyFactoryBean">
        <property name="transactionManager" ref="myTxManager"/>
        <property name="target" ref="stockService"/>
        <property name="transactionAttributes">
            <props>
                <prop key="open*">ISOLATION_DEFAULT,PROPAGATION_REQUIRED</prop>
                <prop key="buyStock">ISOLATION_DEFAULT,PROPAGATION_REQUIRED,-StockException</prop>
            </props>
        </property>
    </bean>
</beans>

```

## Spring 的事务注解管理事务

注：需要注意的是，@Transactional 若用在方法上，只能用于 public 方法上。对于其他非public 方法，如果加上了注解@Transactional，虽然 Spring 不会报错，但不会将指定事务织入到该方法中。因为 Spring 会忽略掉所有非 public 方法上的@Transaction 注解。

```aidl

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:context="http://www.springframework.org/schema/context"
        xmlns:aop="http://www.springframework.org/schema/aop"
        xmlns:tx="http://www.springframework.org/schema/tx" 
        xsi:schemaLocation="
        http://www.springframework.org/schema/beans 
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context 
        http://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/tx 
        http://www.springframework.org/schema/tx/spring-tx.xsd
        http://www.springframework.org/schema/aop 
        http://www.springframework.org/schema/aop/spring-aop.xsd">
    
    <!-- 注册数据源：C3P0数据源 -->
    <bean id="myDataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
        <property name="driverClass" value="${jdbc.driverClass}" />
        <property name="jdbcUrl" value="${jdbc.url}" />
        <property name="user" value="${jdbc.user}" />
        <property name="password" value="${jdbc.password}" />
    </bean>
    
    <!-- 注册JDBC属性文件 -->
    <context:property-placeholder location="classpath:jdbc.properties"/>
    
    <!-- 注册Dao -->
    <bean id="accountDao" class="com.tongji.dao.AccountDaoImpl">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <bean id="stockDao" class="com.tongji.dao.StockDaoImpl">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <!-- 注册Service -->
    <bean id="stockService" class="com.tongji.service.StockProcessServiceImpl">
        <property name="accountDao" ref="accountDao"/>
        <property name="stockDao" ref="stockDao"/>
    </bean>    
    
    <!-- 事务 -->
    <!-- 注册事务管理器 -->
    <bean id="myTxManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <!-- 开启注解驱动 -->
    <tx:annotation-driven transaction-manager="myTxManager"/>
</beans>

```

```aidl

    @Override
    @Transactional(isolation=Isolation.DEFAULT, propagation=Propagation.REQUIRED)
    public void openAccount(String aname, double money) {
        accountDao.insertAccount(aname, money);
    }

    @Override
    @Transactional(isolation=Isolation.DEFAULT, propagation=Propagation.REQUIRED)
    public void openStock(String sname, int amount) {
        stockDao.insertStock(sname, amount);
    }

    @Override
    @Transactional(isolation=Isolation.DEFAULT, propagation=Propagation.REQUIRED, rollbackFor=StockException.class)
    public void buyStock(String aname, double money, String sname, int amount) throws StockException {
        boolean isBuy = true;
        accountDao.updateAccount(aname, money, isBuy);
        if (true) {
            throw new StockException("购买股票异常");
        }
        stockDao.updateStock(sname, amount, isBuy);
    }

```


## Spring 使用AspectJ的AOP配置管理事务

![aop3](https://github.com/zhongyp/zhongyp.github.io/blob/master/styles/images/article/aop-3.jpg?raw=true)

AOP术语：

* 连接点（joinpoint）你可以切入的方法（注意是可以）。

* 切点（pointcut）是你切入的方法。

* 增强（advice）往切点里面增加其他特殊的东西，比如事务传播。

* 目标对象（target）引入中所提到的目标类，也就是要被通知的对象，也就是真正的业务逻辑，他可以在毫不知情的情况下，被咱们织入切面。而自己专注于业务本身的逻辑。

* 引介（introduction）允许我们向现有的类添加新方法属性。

* 织入（weaving） 把切面应用到目标对象来创建新的代理对象的过程。有3种方式，spring采用的是运行时，为什么是运行时，后面解释。

* 代理（proxy）实现整套aop机制的，都是通过代理。

* 切面（aspect）切面是通知和切入点的结合,就是定义了通知的类。现在发现了吧，没连接点什么事情，连接点就是为了让你好理解切点，搞出来的，明白这个概念就行了。通知说明了干什么和什么时候干（什么时候通过方法名中的before,after，around等就能知道），而切入点说明了在哪干（指定到底是哪个方法），这就是一个完整的切面定义。

```aidl

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:context="http://www.springframework.org/schema/context"
        xmlns:aop="http://www.springframework.org/schema/aop"
        xmlns:tx="http://www.springframework.org/schema/tx" 
        xsi:schemaLocation="
        http://www.springframework.org/schema/beans 
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context 
        http://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/tx 
        http://www.springframework.org/schema/tx/spring-tx.xsd
        http://www.springframework.org/schema/aop 
        http://www.springframework.org/schema/aop/spring-aop.xsd">
    
    <!-- 注册数据源：C3P0数据源 -->
    <bean id="myDataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
        <property name="driverClass" value="${jdbc.driverClass}" />
        <property name="jdbcUrl" value="${jdbc.url}" />
        <property name="user" value="${jdbc.user}" />
        <property name="password" value="${jdbc.password}" />
    </bean>
    
    <!-- 注册JDBC属性文件 -->
    <context:property-placeholder location="classpath:jdbc.properties"/>
    
    <!-- 注册Dao -->
    <bean id="accountDao" class="com.tongji.dao.AccountDaoImpl">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <bean id="stockDao" class="com.tongji.dao.StockDaoImpl">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <!-- 注册Service -->
    <bean id="stockService" class="com.tongji.service.StockProcessServiceImpl">
        <property name="accountDao" ref="accountDao"/>
        <property name="stockDao" ref="stockDao"/>
    </bean>    
    
    <!-- 事务 -->
    <!-- 注册事务管理器 -->
    <bean id="myTxManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="myDataSource"/>
    </bean>
    <!-- 注册事务通知 -->
    <tx:advice id="txAdvice" transaction-manager="myTxManager">
        <tx:attributes>
            <!-- 指定在切入点方法上应用的事务属性 -->
            <tx:method name="open*" isolation="DEFAULT" propagation="REQUIRED"/>
            <tx:method name="buyStock" isolation="DEFAULT" propagation="REQUIRED" rollback-for="StockException"/>
        </tx:attributes>
    </tx:advice>
    
    <!-- AOP配置 -->
    <aop:config proxy-target-class="true">//表示使用CGLib动态代理技术织入增强。设置为false时，表示使用jdk动态代理织入增强，如果目标类没有声明接口，则spring将自动使用CGLib动态代理。
        <!-- 指定切入点 -->
        <aop:pointcut expression="execution(* *..service.*.*(..))" id="stockPointCut"/>//这里设置切入点，expression设置切面植入的切入点的方法地址
        <aop:advisor advice-ref="txAdvice" pointcut-ref="stockPointCut"/>// 加入事务传播特性
        <aop:aspect ref="stockService">//定义一个切面
         
        
        -->
    </aop:config>
</beans>

```






    




