---
layout: post
title: "Java集合框架"
date: 2018-01-06
tag: "Java"
detail: 
img: 

---

* content
{:toc}



![集合框架](http://img.blog.csdn.net/20140727005415750)

[点击放大](http://img.blog.csdn.net/20140727005415750)

[图片来自于：https://www.cnblogs.com/mengfanrong/p/5079533.html](https://www.cnblogs.com/mengfanrong/p/5079533.html)


## Collection


* Set:Set不可以有重复元素，元素是无序的

	* HashSet
	
	[HashSet源码解读](http://blog.csdn.net/chenssy/article/details/21988605)
	
	* LinkedHashSet
	
	[LinkedHashSet源码解读](http://zhangshixi.iteye.com/blog/673319)
	
	* TreeSet :以二叉树的结构对元素进行存储，可以对元素进行排序。元素自身具备比较功能，元素实现Comparable接口。
	
	[TreeSet源码解读](https://www.cnblogs.com/skywang12345/p/3311268.html)
	

* List: 其中List可以存储重复元素，元素是有序的（存取顺序一致），可以通过List脚标来获取指定元素

	* ArrayList: 线程不安全的，对元素的查询速度快。
	
	[ArrayList源码解读](http://zhangshixi.iteye.com/blog/674856)
	
	* LinkedList
	
	[LinkedList源码解读](https://www.cnblogs.com/skywang12345/p/3308807.html)
	
	* Vector
	
	

* Queue
	* PriorityQueue
	
	[PriorityQueue源码解读](http://blog.csdn.net/qunxingvip/article/details/51924642)
	
	* LinkedList
	
	[LinkedList源码解读](https://www.cnblogs.com/skywang12345/p/3308807.html)
	
	* ArrayQueue
	
	[ArrayQueue源码解读](https://www.cnblogs.com/CarpenterLee/p/5468803.html)
	

## Map

* EnumMap
* IdentityHashMap
* HashMap: 线程不安全等的，允许存放null键null值。


	HashMap继承自AbstractMap，AbstractMap是Map接口的骨干实现，AbstractMap中实现了Map中最重要最常用和方法，这样HashMap继承AbstractMap就不需要实现Map的所有方法，让HashMap减少了大量的工作。 
	
	[HashMap源码解读](http://blog.csdn.net/jeffleo/article/details/54946424)
	
* HashTable: 线程安全的，不允许存放null键null值。
	
* LinkedHashMap
* WeakHashMap
* TreeMap：可以对键进行排序（要实现排序方法同TreeSet）。

