---
layout: post
title: "ThreadLocal"
date: 2018-03-16
tag: "并发"
detail: 
img: 

---

* content
{:toc}

## ThreadLocal基本原理

### ThreadLocal的作用

ThreadLocal提供本地线程变量。

### ThreadLocal示例

那ThreadLocal是怎样给本地线程提供线程变量的呢？看下面的示例。

```
public static void main(String[] args){
        final ThreadLocal threadLocal = new ThreadLocal();
        Thread thread1 = new Thread(){

            @Override
            public void run(){
                threadLocal.set("a");
                System.out.println(threadLocal.get());
            }
        };

        Thread thread2 = new Thread(){

            @Override
            public void run(){
                threadLocal.set("b");
                System.out.println(threadLocal.get());
            }
        };

        Thread thread3 = new Thread(){

            @Override
            public void run(){
                threadLocal.set("c");
                System.out.println(threadLocal.get());
            }
        };

        thread1.start();
        
        thread2.start();
        thread3.start();

    }

```

结果输出：
a
b
c

代码示例解读：

1.首先声明一个ThreadLocal变量

2.在每个线程内，通过threadLocal.set()的方法为当前线程提供线程变量，set()方法：

```
    public void set(T value) {
        Thread t = Thread.currentThread();// 获取当前线程
        ThreadLocalMap map = getMap(t);// 通过getMap 获取 Thread对象的threadlocal.ThreadLocalMap
        if (map != null)
            map.set(this, value);// 以this(ThreadLocal本身)为Key,参数value为值进行保存
        else
            createMap(t, value);
    }

```
### 总结

ThreadLocal 是一个和Thread无关的对象，可以把它理解成一个工具，如果需要给线程提供线程变量，就用ThreadLocal的set()方法给线程提供变量。

注：ThreadLocal在当前线程内都可用，不局限于当前方法内。



