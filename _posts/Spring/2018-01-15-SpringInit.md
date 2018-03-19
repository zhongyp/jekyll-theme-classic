---
layout: post
title: "Spring Bean容器加载Bean源码解析（转载）"
date: 2018-01-15
tag: "Spring"
detail: Spring(http://spring.io/)是一个轻量级的Java 开发框架，同时也是轻量级的IoC和AOP的容器框架，主要是针对JavaBean的生命周期进行管理的轻量级容器，可以单独使用，也可以和Struts框架，MyBatis框架等组合使用。 
img: 

---

* content
{:toc}



[原文链接](http://www.cnblogs.com/dennyzhangdd/p/7652075.html)

## Spring初始化

Spring初始化类关系图


![Spring初始化类关系图](https://github.com/zhongyp/zhongyp.github.io/blob/master/styles/images/article/springinit.png?raw=true)



![Spring初始化类关系图](https://github.com/zhongyp/zhongyp.github.io/blob/master/styles/images/article/springinit1.png?raw=true)



DefaultResourceLoader，该类设置classLoader，并且将配置文件 封装为Resource文件。

AbstractApplicationContext，该类完成了大部分的IOC容器初始化工作，同时也提供了扩展接口留给子类去重载。该类的refresh()函数是核心初始化操作。

AbstractRefreshableApplicationContext，该类支持刷新BeanFactory。

AbstractRefreshableConfigApplicationContext，该类保存了配置文件路径

AbstractXmlApplicationContext：该类支持解析bean定义文件

最后ClassPathXmlApplicationContext:只提供了一个简单的构造函数

Spring 将类职责分开，形成职责链，每一层次的扩展 都只是添加了某个功能

然后父类定义大量的模板，让子类实现，父类层层传递到子类 直到某个子类重载了抽象方法。这里应用到了职责链设计模式和模板设计模式，IOC是个容器工厂设计模式。

































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

Spring初始化时，先初始化Bean容器

测试代码通过new ClassPathXmlApplicationContext("spring-beans.xml")，初始化ClassPathXmlApplicationContext实例。

```

public ClassPathXmlApplicationContext(String[] configLocations, boolean refresh, ApplicationContext parent) throws BeansException {
	super(parent);// 把ApplicationContext作为父容器，上述测试类中由于直接载入的xml,没有父容器所以实际传了null
	this.setConfigLocations(configLocations);// 替换${}后设置配置路径
	if(refresh) {
		this.refresh();// 这个会直接访问至AbstractApplicationContext类的refresh方法,这个是容器创建的核心方法
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
		// 刷新前的准备工作，准备刷新的上下文环境，例如对系统属性或者环境变量进行准备及验证。
		this.prepareRefresh();
		//首先调用AbstractRefreshableApplicationContext的refreshBeanFactory()解析xml
		//然后调用AbstractXmlApplicationContext/XmlWebApplicationContext.loadBeanDefinitions()方法，加载bean信息
		// 告诉子类刷新内部bean工厂
		ConfigurableListableBeanFactory beanFactory = this.obtainFreshBeanFactory();
		//为BeanFactory配置容器特性，例如类加载器、事件处理器等.
		this.prepareBeanFactory(beanFactory);

		try {
		    //设置BeanFactory的后置处理. 空方法，留给子类拓展用。
			this.postProcessBeanFactory(beanFactory);
			//在上下文中调用factory工厂的时候注册bean的 实例对象，//调用BeanFactory的后处理器, 这些后处理器是在Bean定义中向容器注册的. 
			this.invokeBeanFactoryPostProcessors(beanFactory);
			// 注册bean的过程当中拦截所有bean的创建，//注册Bean的后处理器, 在Bean创建过程中调用.
			this.registerBeanPostProcessors(beanFactory);
			//初始化上下文中的消息源，即不同语言的消息体进行国际化处理
			this.initMessageSource();
			//初始化事物传播属性，//初始化ApplicationEventMulticaster bean,应用事件广播器
			this.initApplicationEventMulticaster();
			// 在特定上下文初始化其他特殊bean子类。//初始化其它特殊的Bean， 空方法，留给子类拓展用。
			this.onRefresh();
			// 检查侦听器bean并注册。//检查并向容器注册监听器Bean
			this.registerListeners();
			// 实例化所有剩余(non-lazy-init)单例.//实例化所有剩余的(non-lazy-init) 单例Bean.
			this.finishBeanFactoryInitialization(beanFactory);
			// 最后一步:发布对应的事件。//发布容器事件, 结束refresh过程. 
			this.finishRefresh();
		} catch (BeansException var9) {
			if(this.logger.isWarnEnabled()) {
				this.logger.warn("Exception encountered during context initialization - cancelling refresh attempt: " + var9);
			}
            // 销毁已经创建的单例对象避免浪费资源
			this.destroyBeans();
			//取消refresh操作, 重置active标志. 
			this.cancelRefresh(var9);
			// 异常传播到调用者
			throw var9;
		} finally {
		    // 在spring 核心包里重置了内存（缓存），因为我们不需要元数据单例bean对象了
			this.resetCommonCaches();
		}

	}
}
```


AbstractRefreshableApplicationContext类

<p style="color:red">refresh方法中obtainFreshBeanFactory方法调用了refreshBeanFactory，该方法使用DefaultListableBeanFactory去定位resources资源</p>

```
protected final void refreshBeanFactory() throws BeansException {
    if(this.hasBeanFactory()) {
        this.destroyBeans();//先消除所有已经存在的bean
        this.closeBeanFactory();// beanFactory = null;
    }

    try {//创建并设置DefaultListableBeanFactory同时调用loadBeanDefinitions载入loadBeanDefinition
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

<p style="color:red">loadBeanDefinitions其具体实现在AbstractXmlApplicationContext中，定义了一个Reader作为入参执行载入过程</p>

```

protected void loadBeanDefinitions(DefaultListableBeanFactory beanFactory) throws BeansException, IOException {
	// //这和在BeanFactory中的加载过程一样，也是委托给XmlBeanDefinitionReader去读取配置文件，
	XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(beanFactory);
	beanDefinitionReader.setEnvironment(this.getEnvironment());
	beanDefinitionReader.setResourceLoader(this);
	beanDefinitionReader.setEntityResolver(new ResourceEntityResolver(this));
	this.initBeanDefinitionReader(beanDefinitionReader);
	// 加载Bean定义
	this.loadBeanDefinitions(beanDefinitionReader);// 核心方法
}
// getConfigResources采用模板方法设计模式，具体的实现由子类完成，实际上这里getConfigResources调用的就是子类ClassPathXmlApplicationContext的getConfigResources方法。ClassPathXmlApplicationContext继承了DefaultResourceLoader，具备了Resource加载资源的功能。至此完成了Resource定位！
protected void loadBeanDefinitions(XmlBeanDefinitionReader reader) throws BeansException, IOException {
	Resource[] configResources = this.getConfigResources();
	if(configResources != null) {
		// 读取配置文件都是用的这个方法，和BeanFactory是一样的，
		reader.loadBeanDefinitions(configResources);
	}

	String[] configLocations = this.getConfigLocations();
	// FileSystemXmlApplicationContext类
	if(configLocations != null) {
		reader.loadBeanDefinitions(configLocations);
	}

}

```

<p style="color:red">这里支持2种模式：1.模板匹配多资源，生成Resource[]。2.载入单个资源url绝对地址，生成一个Resource</p>

```aidl

    public int loadBeanDefinitions(String location, Set<Resource> actualResources) throws BeanDefinitionStoreException {
        ResourceLoader resourceLoader = getResourceLoader();//获取ResourceLoader资源加载器
        if (resourceLoader == null) {
            throw new BeanDefinitionStoreException(
                    "Cannot import bean definitions from location [" + location + "]: no ResourceLoader available");
        }
        // 1.匹配模板解析 ClassPathXmlApplicationContext是ResourcePatternResolver接口的实例
        if (resourceLoader instanceof ResourcePatternResolver) {
           
            try {//接口ResourcePatternResolver
                Resource[] resources = ((ResourcePatternResolver) resourceLoader).getResources(location);
                int loadCount = loadBeanDefinitions(resources);
                if (actualResources != null) {
                    for (Resource resource : resources) {
                        actualResources.add(resource);
                    }
                }
                if (logger.isDebugEnabled()) {
                    logger.debug("Loaded " + loadCount + " bean definitions from location pattern [" + location + "]");
                }
                return loadCount;
            }
            catch (IOException ex) {
                throw new BeanDefinitionStoreException(
                        "Could not resolve bean definition resource pattern [" + location + "]", ex);
            }
        }
        else {
            // 2.载入单个资源url绝对地址
            Resource resource = resourceLoader.getResource(location);
            int loadCount = loadBeanDefinitions(resource);
            if (actualResources != null) {
                actualResources.add(resource);
            }
            if (logger.isDebugEnabled()) {
                logger.debug("Loaded " + loadCount + " bean definitions from location [" + location + "]");
            }
            return loadCount;
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