---
layout: post
title: "Hibernate 入门源码实例"
tag: "framework"
date: 2017-9-4
detail: 做学问在于严谨，成功在于细节。
img: 

---

* content
{:toc}



基于 Hibernate 5.2.9.Final 版本

## Hibernate 

Hibernate架构包括许多对象持久对象，会话工厂，事务工厂，连接工厂，会话，事务等。

hibernate架构中有4层Java应用层，hibernate框架层，反手api层和数据库层。请参见hibernate架构图：

![Hibernate架构图](https://github.com/zhongyp/zhongyp.github.io/blob/master/styles/images/article/hibernate1.jpg)

这是Hibernate的高级架构，具有映射文件和配置文件。

![持久层框架](https://github.com/zhongyp/zhongyp.github.io/blob/master/styles/images/article/hibernate2.jpg)

Hibernate框架使用许多对象会话工厂，会话，事务等以及现有的Java API，如JDBC(Java数据库连接)，JTA(Java事务API)和JNDI(Java命名目录接口)。

Hibernate体系结构的要素

要创建第一个hibernate应用程序，我们必须知道Hibernate架构的元素。 它们如下：

会话工厂(SessionFactory)

SessionFactory是ConnectionProvider的会话和客户端工厂。 它拥有数据的二级缓存(可选)。 org.hibernate.SessionFactory接口提供了工厂方法来获取Session的对象。

会话(Session)
Session对象提供应用程序和存储在数据库中的数据之间的接口。 它是一个短生命周期的对象并包装JDBC连接。 它是事务，查询和标准的工厂。 它拥有一级缓存(强制性)数据。 org.hibernate.Session接口提供插入，更新和删除对象的方法。 它还提供了事务，查询和标准的工厂方法。

事务(Transaction)
事务对象指定工作的原子单位,它是一个可选项。 org.hibernate.Transaction接口提供事务管理的方法。

连接提供者(ConnectionProvider)

它是一个JDBC连接工厂。 它从DriverManager或DataSource抽象出来的应用程序。 它是一个可选项。

事务工厂(TransactionFactory)

它是一个事务工厂，是一个可选项。




[入门源码实例](https://github.com/zhongyp/bodu/tree/master/bodu-hibernate)


