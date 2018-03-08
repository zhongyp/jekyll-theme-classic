---
layout: post
title: "Java集合框架"
date: 2018-01-06
tag: "Java"
detail: 研读JDK源码，深入了解集合类的实现原理
img: 

---

* content
{:toc}



![集合框架](http://img.blog.csdn.net/20140727005415750)

[点击放大](http://img.blog.csdn.net/20140727005415750)

[图片来自于：https://www.cnblogs.com/mengfanrong/p/5079533.html](https://www.cnblogs.com/mengfanrong/p/5079533.html)


## Collection


* [Set源码解析：http://zhongyp.me/2018/01/10/Set](http://zhongyp.me/2018/01/10/Set)

	* HashSet：底层实现是HashMap，没有特殊的特性。
	
	* LinkedHashSet：底层实现LinkedHashMap,特性为维护了一个单链表，访问顺序为插入顺序。
	
	* TreeSet：底层基于TreeMap, 特性为是一个有序的，它的作用是提供有序的Set集合。同时实现NavigableSet接口，该接口扩展的 SortedSet，具有了为给定搜索目标报告最接近匹配项的导航方法，这就意味着它支持一系列的导航方法。比如查找与指定目标最匹配项，如：lower，floor,ceiling等方法。
	

* List源码解析

	* [ArrayList](http://zhongyp.me/2018/01/10/ArrayList/) ：底层数组，特性为实现RandomAccess接口，可以对元素进行快速访问。
	
	* [LinkedList](http://zhongyp.me/2018/01/12/LinkedList/) ：是一个继承于AbstractSequentialList的双向链表。它也可以被当作堆栈、队列或双端队列进行操作。实现 List 接口，能对它进行队列操作。实现了Cloneable接口，即覆盖了函数clone()，能克隆。 LinkedList 是非同步的。
	
	* [Vector](http://zhongyp.me/2018/01/12/Vector/) ：底层数组，不过是ArrayList的同步版本。不过不能序列化，没有实现Serializable的readObject方法。

* [Queue源码解析：]()

	* PriorityQueue 
	
	* [LinkedList](http://zhongyp.me/2018/01/12/LinkedList/) ：是一个继承于AbstractSequentialList的双向链表。它也可以被当作堆栈、队列或双端队列进行操作。实现 List 接口，能对它进行队列操作。实现了Cloneable接口，即覆盖了函数clone()，能克隆。 LinkedList 是非同步的。
	
	* ArrayQueue
	

## [Map源码解析]()

* EnumMap

* IdentityHashMap

* HashMap 
	
* HashTable

* [ConcurrentHashMap](https://www.cnblogs.com/zaizhoumo/p/7709755.html)
	
* LinkedHashMap

* WeakHashMap

* TreeMap

## [Concurrent源码解析：]()

* 阻塞队列 BlockingQueue

* 数组阻塞队列 ArrayBlockingQueue

* 延迟队列 DelayQueue

* 链阻塞队列 LinkedBlockingQueue

* 具有优先级的阻塞队列 PriorityBlockingQueue

* 同步队列 SynchronousQueue

* 阻塞双端队列 BlockingDeque

* 链阻塞双端队列 LinkedBlockingDeque

* 并发 Map(映射) ConcurrentMap

* 并发导航映射 ConcurrentNavigableMap

* 闭锁 CountDownLatch

* 栅栏 CyclicBarrier

* 交换机 Exchanger

* 信号量 Semaphore

* 执行器服务 ExecutorService

* 线程池执行者 ThreadPoolExecutor

* 定时执行者服务 ScheduledExecutorService

* 使用 ForkJoinPool 进行分叉和合并

* 锁 Lock

* 读写锁 ReadWriteLock

* 原子性布尔 AtomicBoolean

* 原子性整型 AtomicInteger 

* 原子性长整型 AtomicLong

* 原子性引用型 AtomicReference