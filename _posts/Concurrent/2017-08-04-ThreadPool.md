---
layout: post
title: "线程池底层实现机制及应用"
date: 2017-08-04
tag: "并发"
detail: 线程池是一种多线程处理形式，处理过程中将任务添加到队列，然后在创建线程后自动启动这些任务。线程池线程都是后台线程。每个线程都使用默认的堆栈大小，以默认的优先级运行，并处于多线程单元中。如果某个线程在托管代码中空闲（如正在等待某个事件）,则线程池将插入另一个辅助线程来使所有处理器保持繁忙。如果所有线程池线程都始终保持繁忙，但队列中包含挂起的工作，则线程池将在一段时间后创建另一个辅助线程但线程的数目永远不会超过最大值。超过最大值的线程可以排队，但他们要等到其他线程完成后才启动。
img: 

---

* content
{:toc}


## 创建线程

java.util.concurrent.Executosr是线程池的静态工厂，我们通常使用它方便地生产各种类型的线程池，主要的方法有三种：

* newSingleThreadExecutor()——创建一个单线程的线程池

* newFixedThreadPool(int n)——创建一个固定大小的线程池

* newCachedThreadPool()——创建一个可缓存的线程池

## 线程参数

```aidl

    public ThreadPoolExecutor(int corePoolSize,//corePoolSize线程池中的核心线程数。
                              int maximumPoolSize,//maximumPoolSize线程池中的最大线程数。
                              long keepAliveTime,//keepAliveTime线程池中的线程存活时间，即回收时间
                              TimeUnit unit,//参数keepAliveTime的时间单位
                              BlockingQueue<Runnable> workQueue,//workQueue一个阻塞队列，用来存储等待执行的任务。
                              ThreadFactory threadFactory,//threadFactory线程工厂，主要用来创建线程。
                              RejectedExecutionHandler handler//任务拒绝策略，当运行线程数已达到maximumPoolSize，队列也已经装满时会调用该参数拒绝任务，有默认实现。
                              ) {
        
    }

```

    corePoolSize 核心线程数
    
* 核心线程会一直存活，及时没有任务需要执行
    
* 当线程数小于核心线程数时，即使有线程空闲，线程池也会优先创建新线程处理
    
* 设置allowCoreThreadTimeout=true（默认false）时，核心线程会超时关闭

确定线程数： 线程数=CPU可用核心数/(1-阻塞系数)，通常IO密集型=2Ncpu，计算密集型=Ncpu+1。


    keepAliveTime
    
   当线程空闲时间达到keepAliveTime时，线程会退出，直到线程数量=corePoolSize
    
   如果allowCoreThreadTimeout=true，则会直到线程数量=0


    TimeUnit

* TimeUnit.DAYS;    //天

* TimeUnit.HOURS;    //小时

* TimeUnit.MINUTES;    //分钟

* TimeUnit.SECONDS;    //秒

* TimeUnit.MILLISECONDS;    //毫秒

* TimeUnit.MICROSECONDS;    //微妙

* TimeUnit.NANOSECONDS;    //纳秒

TimeUnit是java.util.concurrent包下面的一个类，TimeUnit提供了可读性更好的线程暂停操作，通常用来替换Thread.sleep()，在很长一段时间里Thread的sleep()方法作为暂停线程的标准方式。

    BlockingQueue用来保存等待被执行的任务的阻塞队列，且任务必须实现Runable接口，在JDK中提供了如下阻塞队列：

* ArrayBlockingQueue 有界队列

    有助于防止资源耗尽，但是可能较难调整和控制。队列大小和最大池大小可能需要相互折衷：使用大型队列和小型池可以最大限度地降低 CPU 使用率、操作系统资源和上下文切换开销，但是可能导致人工降低吞吐量。如果任务频繁阻塞（例如，如果它们是 I/O边界），则系统可能为超过您许可的更多线程安排时间。使用小型队列通常要求较大的池大小，CPU使用率较高，但是可能遇到不可接受的调度开销，这样也会降低吞吐量。
    
* LinkedBlockingQueue 无界队列

    适用于FixedThreadPool与SingleThreadExcutor。基于链表的阻塞队列，创建的线程数不会超过corePoolSizes（maximumPoolSize值与其一致），当线程正忙时，任务进入队列等待。按照FIFO原则对元素进行排序，吞吐量高于ArrayBlockingQueue。

* priorityBlockingQuene 具有优先级的无界阻塞队列

    是一个特殊的无界队列，可以根据自身任务的优先级顺序先后执行，而LinkedBlockingQuene和ArrayBlockingQuene都是按照先进先出的方式处理的。

* SynchronousQueue 直接提交策略

   
   适用于CachedThreadPool。它将任务直接提交给线程而不保持它们。如果不存在可用于立即运行任务的线程，则试图把任务加入队列将失败，因此会构造一个新的线程。此策略可以避免在处理可能具有内部依赖性的请求集时出现锁。直接提交通常要求最大的 maximumPoolSize 以避免拒绝新提交的任务（正如CachedThreadPool这个参数的值为Integer.MAX_VALUE）。当任务以超过队列所能处理的量、连续到达时，此策略允许线程具有增长的可能性。吞吐量较高。

.

    threadFactory

    
 创建线程的工厂，通过自定义的线程工厂可以给每个新建的线程设置一个具有识别度的线程名。


    handler 
    
线程池的饱和策略，当阻塞队列满了，且没有空闲的工作线程，如果继续提交任务，必须采取一种策略处理该任务，线程池提供了4种策略：

* ThreadPoolExecutor.AbortPolicy:丢弃任务并抛出RejectedExecutionException异常。 

* ThreadPoolExecutor.DiscardPolicy：也是丢弃任务，但是不抛出异常。 

* ThreadPoolExecutor.DiscardOldestPolicy：丢弃队列最前面的任务，然后重新尝试执行任务（重复此过程）

* ThreadPoolExecutor.CallerRunsPolicy：由调用线程处理该任务，只要线程池未关闭，该策略直接在调用者线程中运行当前被丢弃的任务。显然这样不会真的丢弃任务，但是，调用者线程性能可能急剧下降。 

当然也可以根据应用场景实现RejectedExecutionHandler接口，自定义饱和策略，如记录日志或持久化存储不能处理的任务。    
  

