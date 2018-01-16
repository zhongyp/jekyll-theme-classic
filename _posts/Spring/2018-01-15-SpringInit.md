---
layout: post
title: "Spring Bean的初始化源码解析"
date: 2018-01-15
tag: "Spring"
detail: Spring(http://spring.io/)是一个轻量级的Java 开发框架，同时也是轻量级的IoC和AOP的容器框架，主要是针对JavaBean的生命周期进行管理的轻量级容器，可以单独使用，也可以和Struts框架，MyBatis框架等组合使用。 
img: 

---

* content
{:toc}


## Spring初始化

Spring初始化类关系图


![Spring初始化类关系图](http://images2015.cnblogs.com/blog/734623/201603/734623-20160310093624085-1252947693.jpg)

[原文链接](https://www.cnblogs.com/ITtangtang/p/3978349.html)

先说一下这个关系图，ClassPathXmlApplicationContext是我们的入口类，类中通过this.refresh方法进入AbstractApplicationContext类中的refresh方法，其中refresh方法就是构建BeanFactory的入口。

测试程序：

Bean配置文件

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="test" class="com.bodu.spring.demo.Test"></bean>
</beans>

```

```

ApplicationContext ctx = new ClassPathXmlApplicationContext("spring-beans.xml");
Test test = (Test) ctx.getBean("test");
test.getTestName();

```

开始跟源码啦！！！




测试代码通过new ClassPathXmlApplicationContext("spring-beans.xml")，初始化ClassPathXmlApplicationContext实例。

```

public ClassPathXmlApplicationContext(String[] configLocations, boolean refresh, ApplicationContext parent) throws BeansException {
	super(parent);// 初始化父类AbstractApplicationContext
	this.setConfigLocations(configLocations);// 设置配置文件的路径
	if(refresh) {
		this.refresh();// 这个会直接访问至AbstractApplicationContext类的refresh方法
	}

}

```

AbstractRefreshableConfigApplicationContext类 setConfigLocations()

```

public void setConfigLocations(String... locations) {
    if(locations != null) { // 判断locations非null
        Assert.noNullElements(locations, "Config locations must not be null");// 断言locations元素非空
        this.configLocations = new String[locations.length];

        for(int i = 0; i < locations.length; ++i) {
            this.configLocations[i] = this.resolvePath(locations[i]).trim();
        }
    } else {
        this.configLocations = null;
    }

}

```

refresh()

```

public void refresh() throws BeansException, IllegalStateException {
	
	Object var1 = this.startupShutdownMonitor;
	// 同步锁，对一个全局对象或者类加锁时，对该类的所有对象都起作用
	synchronized(this.startupShutdownMonitor) {
		// 刷新前的准备工作
		this.prepareRefresh();
		//首先调用AbstractRefreshableApplicationContext的refreshBeanFactory()
		//然后调用AbstractXmlApplicationContext/XmlWebApplicationContext.loadBeanDefinitions()方法
		// 告诉子类刷新内部bean工厂
		ConfigurableListableBeanFactory beanFactory = this.obtainFreshBeanFactory();
		// 准备Bean工厂
		this.prepareBeanFactory(beanFactory);

		try {
		    // 方法为空
			this.postProcessBeanFactory(beanFactory);
			//在上下文中调用factory工厂的时候注册bean的 实例对象
			this.invokeBeanFactoryPostProcessors(beanFactory);
			// 注册bean的过程当中拦截所有bean的创建
			this.registerBeanPostProcessors(beanFactory);
			// 初始化上下文消息资源
			this.initMessageSource();
			//初始化事物传播属性
			this.initApplicationEventMulticaster();
			// 在特定上下文初始化其他特殊bean子类。
			this.onRefresh();
			// 检查侦听器bean并注册。
			this.registerListeners();
			// 实例化所有剩余(non-lazy-init)单例.
			this.finishBeanFactoryInitialization(beanFactory);
			// 最后一步:发布对应的事件。
			this.finishRefresh();
		} catch (BeansException var9) {
			if(this.logger.isWarnEnabled()) {
				this.logger.warn("Exception encountered during context initialization - cancelling refresh attempt: " + var9);
			}
            // 销毁已经创建的单例对象避免浪费资源
			this.destroyBeans();
			// 重置“活跃”的旗帜。
			this.cancelRefresh(var9);
			// 异常传播到调用者
			throw var9;
		} finally {
		    // 在spring 核心包里重置了内存，因为我们不需要元数据单例bean对象了
			this.resetCommonCaches();
		}

	}
}
```

invokeBeanFactoryPostProcessors方法

```
protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
	PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, this.getBeanFactoryPostProcessors());
	if(beanFactory.getTempClassLoader() == null && beanFactory.containsBean("loadTimeWeaver")) {
		beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
		beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
	}

}

```

PostProcessorRegistrationDelegate类
```
public static void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory, List<BeanFactoryPostProcessor> beanFactoryPostProcessors) {
    Set<String> processedBeans = new HashSet();
    int var9;
    ArrayList currentRegistryProcessors;
    String[] postProcessorNames;
    if(beanFactory instanceof BeanDefinitionRegistry) {
        BeanDefinitionRegistry registry = (BeanDefinitionRegistry)beanFactory;
        List<BeanFactoryPostProcessor> regularPostProcessors = new LinkedList();
        List<BeanDefinitionRegistryPostProcessor> registryProcessors = new LinkedList();
        Iterator var6 = beanFactoryPostProcessors.iterator();

        while(var6.hasNext()) {
            BeanFactoryPostProcessor postProcessor = (BeanFactoryPostProcessor)var6.next();
            if(postProcessor instanceof BeanDefinitionRegistryPostProcessor) {
                BeanDefinitionRegistryPostProcessor registryProcessor = (BeanDefinitionRegistryPostProcessor)postProcessor;
                registryProcessor.postProcessBeanDefinitionRegistry(registry);
                registryProcessors.add(registryProcessor);
            } else {
                regularPostProcessors.add(postProcessor);
            }
        }

        currentRegistryProcessors = new ArrayList();
        
        // 不初始化factoryBeans：我们需要把所以没有初始化的bean让bean工厂处理他们，单例BeanDefinitionRegistryPostProcessors之间实现PriorityOrdered接口、序列化接口
        postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
        String[] var18 = postProcessorNames;
        var9 = postProcessorNames.length;

        int var10;
        String ppName;
        for(var10 = 0; var10 < var9; ++var10) {
            ppName = var18[var10];
            if(beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
                currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                processedBeans.add(ppName);
            }
        }

        sortPostProcessors(currentRegistryProcessors, beanFactory);
        registryProcessors.addAll(currentRegistryProcessors);
        invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
        currentRegistryProcessors.clear();
        postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
        var18 = postProcessorNames;
        var9 = postProcessorNames.length;

        for(var10 = 0; var10 < var9; ++var10) {
            ppName = var18[var10];
            if(!processedBeans.contains(ppName) && beanFactory.isTypeMatch(ppName, Ordered.class)) {
                currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                processedBeans.add(ppName);
            }
        }

        sortPostProcessors(currentRegistryProcessors, beanFactory);
        registryProcessors.addAll(currentRegistryProcessors);
        invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
        currentRegistryProcessors.clear();
        boolean reiterate = true;

        while(reiterate) {
            reiterate = false;
            postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
            String[] var21 = postProcessorNames;
            var10 = postProcessorNames.length;

            for(int var28 = 0; var28 < var10; ++var28) {
                String ppName = var21[var28];
                if(!processedBeans.contains(ppName)) {
                    currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                    processedBeans.add(ppName);
                    reiterate = true;
                }
            }

            sortPostProcessors(currentRegistryProcessors, beanFactory);
            registryProcessors.addAll(currentRegistryProcessors);
            invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
            currentRegistryProcessors.clear();
        }

        invokeBeanFactoryPostProcessors((Collection)registryProcessors, (ConfigurableListableBeanFactory)beanFactory);
        invokeBeanFactoryPostProcessors((Collection)regularPostProcessors, (ConfigurableListableBeanFactory)beanFactory);
    } else {
        invokeBeanFactoryPostProcessors((Collection)beanFactoryPostProcessors, (ConfigurableListableBeanFactory)beanFactory);
    }

    String[] postProcessorNames = beanFactory.getBeanNamesForType(BeanFactoryPostProcessor.class, true, false);
    List<BeanFactoryPostProcessor> priorityOrderedPostProcessors = new ArrayList();
    List<String> orderedPostProcessorNames = new ArrayList();
    currentRegistryProcessors = new ArrayList();
    postProcessorNames = postProcessorNames;
    int var22 = postProcessorNames.length;

    String ppName;
    for(var9 = 0; var9 < var22; ++var9) {
        ppName = postProcessorNames[var9];
        if(!processedBeans.contains(ppName)) {
            if(beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
                priorityOrderedPostProcessors.add(beanFactory.getBean(ppName, BeanFactoryPostProcessor.class));
            } else if(beanFactory.isTypeMatch(ppName, Ordered.class)) {
                orderedPostProcessorNames.add(ppName);
            } else {
                currentRegistryProcessors.add(ppName);
            }
        }
    }

    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
    invokeBeanFactoryPostProcessors((Collection)priorityOrderedPostProcessors, (ConfigurableListableBeanFactory)beanFactory);
    List<BeanFactoryPostProcessor> orderedPostProcessors = new ArrayList();
    Iterator var23 = orderedPostProcessorNames.iterator();

    while(var23.hasNext()) {
        String postProcessorName = (String)var23.next();
        orderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
    }

    sortPostProcessors(orderedPostProcessors, beanFactory);
    invokeBeanFactoryPostProcessors((Collection)orderedPostProcessors, (ConfigurableListableBeanFactory)beanFactory);
    List<BeanFactoryPostProcessor> nonOrderedPostProcessors = new ArrayList();
    Iterator var26 = currentRegistryProcessors.iterator();

    while(var26.hasNext()) {
        ppName = (String)var26.next();
        nonOrderedPostProcessors.add(beanFactory.getBean(ppName, BeanFactoryPostProcessor.class));
    }

    invokeBeanFactoryPostProcessors((Collection)nonOrderedPostProcessors, (ConfigurableListableBeanFactory)beanFactory);
    beanFactory.clearMetadataCache();
}
```




































AbstractApplicationContext类
```
protected void prepareRefresh() {
    this.startupDate = System.currentTimeMillis();//获取时间
    //AtomicBoolean是java.util.concurrent.atomic包下的原子变量，这个包里面提供了一组原子类。其基本的特性就是在多线程环境下，当有多个线程同时执行这些类的实例包含的方法时，具有排他性，即当某个线程进入方法，执行其中的指令时，不会被其他线程打断，而别的线程就像自旋锁一样，一直等到该方法执行完成，才由JVM从等待队列中选择一个另一个线程进入，这只是一种逻辑上的理解。实际上是借助硬件的相关指令来实现的，不会阻塞线程(或者说只是在硬件级别上阻塞了)。
    this.closed.set(false);
    this.active.set(true);
    if(this.logger.isInfoEnabled()) {
        this.logger.info("Refreshing " + this);
    }

    this.initPropertySources();// 空方法
    // 校验所有可解析的根据需要标记的属性
    this.getEnvironment().validateRequiredProperties();// 校验在接口ConfigurablePropertyResolver接口中定义，未找到实现类
    this.earlyApplicationEvents = new LinkedHashSet();
}

protected ConfigurableListableBeanFactory obtainFreshBeanFactory() {
    this.refreshBeanFactory();// 新实例化一个beanFactory
    ConfigurableListableBeanFactory beanFactory = this.getBeanFactory();// 获取beanFactory
    if(this.logger.isDebugEnabled()) {
        this.logger.debug("Bean factory for " + this.getDisplayName() + ": " + beanFactory);
    }

    return beanFactory;
}

```

AbstractRefreshableApplicationContext类
```
protected final void refreshBeanFactory() throws BeansException {
    if(this.hasBeanFactory()) {
        this.destroyBeans();//先消除所有已经存在的bean
        this.closeBeanFactory();// beanFactory = null;
    }

    try {
        // 实例化一个工厂，这里是DefaultListableBeanFactory
        DefaultListableBeanFactory beanFactory = this.createBeanFactory();
        
        beanFactory.setSerializationId(this.getId());
        this.customizeBeanFactory(beanFactory);
        // XmlWebApplicationContext方法
        // 在本类中是抽象方法，需要子类AbstractXmlApplicationContext中实现
        this.loadBeanDefinitions(beanFactory);
        Object var2 = this.beanFactoryMonitor;
        synchronized(this.beanFactoryMonitor) { // 同步锁，刷新beanFactory实例
            this.beanFactory = beanFactory;
        }
    } catch (IOException var5) {
        throw new ApplicationContextException("I/O error parsing bean definition source for " + this.getDisplayName(), var5);
    }
}


protected DefaultListableBeanFactory createBeanFactory() {
    return new DefaultListableBeanFactory(this.getInternalParentBeanFactory());// 根据beanFactory的父类，
}
```
AbstractXmlApplicationContext类

```

protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory) throws BeansException, IOException {
	// //这和在BeanFactory中的加载过程一样，也是委托给XmlBeanDefinitionReader去读取配置文件，
	XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
	beanDefinitionReader.setEnvironment(this.getEnvironment());
	beanDefinitionReader.setResourceLoader(this);
	beanDefinitionReader.setEntityResolver(new ResourceEntityResolver(this));
	this.initBeanDefinitionReader(beanDefinitionReader);
	// 加载Bean定义
	this.loadBeanDefinitions(beanDefinitionReader);
}

protected void loadBeanDefinitions(XmlBeanDefinitionReader reader) throws BeansException, IOException {
	Resource[] configResources = this.getConfigResources();
	if(configResources != null) {
		// 读取配置文件都是用的这个方法，和BeanFactory是一样的
		reader.loadBeanDefinitions(configResources);
	}

	String[] configLocations = this.getConfigLocations();
	// 照顾的是FileSystemXmlApplicationContext类
	if(configLocations != null) {
		reader.loadBeanDefinitions(configLocations);
	}

}

```

FileSystemXmlApplicationContext

```
public FileSystemXmlApplicationContext(String[] configLocations, boolean refresh, ApplicationContext parent) throws BeansException {
	super(parent);
	this.setConfigLocations(configLocations);
	if(refresh) {
		this.refresh();
	}

}

```


## ClassPathXmlApplicationContext和FileSystemXmlApplicationContext的区别

ClassPathXmlApplicationContext

ClassPathXmlApplicationContext[只能读放在web-info/classes目录下的配置文件]，classpath:前缀是不需要的,默认就是指项目的classpath路径下面;如果要使用绝对路径,需要加上file:前缀表示这是绝对路径; 
对于FileSystemXmlApplicationContext，默认表示的是两种，如果要使用classpath路径,需要前缀classpath: 