---
layout: post
title: "Dubbo客户端消费（转载）"
date: 2018-01-14
tag: "Dubbo"
detail: 
img: 

---

* content
{:toc}

[尊重原创：参考文档：https://blog.csdn.net/qiangcai/article/details/77581201](https://blog.csdn.net/qiangcai/article/details/77581201)

开发一个简单的RPC框架，重点需要考虑的是两点，即编解码方式和底层通讯协议的选型，编解码方式指的是需要传输的数据在调用方将以什么组织形式拆解成字节流并在服务提供方以什么形式解析出来。编解码方式的设计需要考虑到后期的版本升级，所以很多RPC协议在设计时都会带上当前协议的版本信息。而底层通讯协议的选型都大同小异，一般都是TCP（当然也可以选择建立于TCP之上更高级的协议，比如Avro、Thrift和HTTP等），在Java语言中就是指套接字Socket，当然，在Netty出现后，很少RPC框架会直接以自己写Socket作为默认实现的通讯方式，但通常也会自己实现一个aio、nio或bio版本给那些“不方便”依赖Netty库的应用系统来使用。

 在Dubbo的源码中，有一个单独模块dubbo-rpc，其中，最重要的应该是Protocol和Invoker两个接口，代表着协议（编解码方式）和调用过程（通讯方式）。Invoker接口继承于Node接口，Node接口规范了Dubbo体系中各组件之间通讯的基本要素： 
 
 ```aidl
public interface Node {  
    // 协议数据载体  
    URL getUrl();  
    // 状态监测，当前是否可用  
    boolean isAvailable();  
    // 销毁方法  
    void destroy();  
} 

public interface Invoker<T> extends Node {  
    // 获取调用的接口  
    Class<T> getInterface();  
    // 调用过程  
    Result invoke(Invocation invocation) throws RpcException;  
} 


```

Spring在初始化IOC容器，通过DubboNamespaceHandler类来解析dubbo相关标签，在解析客户端标签dubbo:reference时，标签解析出来的相关属性都是存储到ReferenceBean类中，因为ReferenceBean类实现了InitializingBean接口，所以在设置标签所有属性后会调用afterPropertiesSet方法，关于标签bean载体类实现spring框架的InitializingBean接口相关知识可以自己百度了解下，有很多写的比较好的文章，这里就不在细说。具体看afterPropertiesSet方法如下：

```aidl

@SuppressWarnings({ "unchecked"})  
    public void afterPropertiesSet() throws Exception {  
  
        //判断当前ConsumerConfig是否存在，如果不存在从spring容器中取相关的ConsumerConfig对象，并设置到当前属性中  
        if (getConsumer() == null) {  
            Map<String, ConsumerConfig> consumerConfigMap = applicationContext == null ? null  : BeanFactoryUtils.beansOfTypeIncludingAncestors(applicationContext, ConsumerConfig.class, false, false);  
            if (consumerConfigMap != null && consumerConfigMap.size() > 0) {  
                ConsumerConfig consumerConfig = null;  
                for (ConsumerConfig config : consumerConfigMap.values()) {  
                    if (config.isDefault() == null || config.isDefault().booleanValue()) {  
                        if (consumerConfig != null) {  
                            throw new IllegalStateException("Duplicate consumer configs: " + consumerConfig + " and " + config);  
                        }  
                        consumerConfig = config;  
                    }  
                }  
                if (consumerConfig != null) {  
                    //设置当前ConsumerConfig对象  
                    setConsumer(consumerConfig);  
                }  
            }  
        }  
        //判断当前ApplicationConfig是否存在，不存在从spring容器中获取，并关联到当前类的属性中  
        if (getApplication() == null  
                && (getConsumer() == null || getConsumer().getApplication() == null)) {  
            Map<String, ApplicationConfig> applicationConfigMap = applicationContext == null ? null : BeanFactoryUtils.beansOfTypeIncludingAncestors(applicationContext, ApplicationConfig.class, false, false);  
            if (applicationConfigMap != null && applicationConfigMap.size() > 0) {  
                ApplicationConfig applicationConfig = null;  
                for (ApplicationConfig config : applicationConfigMap.values()) {  
                    if (config.isDefault() == null || config.isDefault().booleanValue()) {  
                        if (applicationConfig != null) {  
                            throw new IllegalStateException("Duplicate application configs: " + applicationConfig + " and " + config);  
                        }  
                        applicationConfig = config;  
                    }  
                }  
                if (applicationConfig != null) {  
                    //设置当前ApplicationConfig属性  
                    setApplication(applicationConfig);  
                }  
            }  
        }  
        //判断当前ModuleConfig是否存在，不存在从spring容器中获取，并关联到当前类属性中  
        if (getModule() == null  
                && (getConsumer() == null || getConsumer().getModule() == null)) {  
            Map<String, ModuleConfig> moduleConfigMap = applicationContext == null ? null : BeanFactoryUtils.beansOfTypeIncludingAncestors(applicationContext, ModuleConfig.class, false, false);  
            if (moduleConfigMap != null && moduleConfigMap.size() > 0) {  
                ModuleConfig moduleConfig = null;  
                for (ModuleConfig config : moduleConfigMap.values()) {  
                    if (config.isDefault() == null || config.isDefault().booleanValue()) {  
                        if (moduleConfig != null) {  
                            throw new IllegalStateException("Duplicate module configs: " + moduleConfig + " and " + config);  
                        }  
                        moduleConfig = config;  
                    }  
                }  
                if (moduleConfig != null) {  
                    //设置当前ModuleConfig对象  
                    setModule(moduleConfig);  
                }  
            }  
        }  
        //判断当前List<RegistryConfig>注册中心是否存在，如果不存在从spring容器中获取，并关联到当前类属性中  
        if ((getRegistries() == null || getRegistries().size() == 0)  
                && (getConsumer() == null || getConsumer().getRegistries() == null || getConsumer().getRegistries().size() == 0)  
                && (getApplication() == null || getApplication().getRegistries() == null || getApplication().getRegistries().size() == 0)) {  
            Map<String, RegistryConfig> registryConfigMap = applicationContext == null ? null : BeanFactoryUtils.beansOfTypeIncludingAncestors(applicationContext, RegistryConfig.class, false, false);  
            if (registryConfigMap != null && registryConfigMap.size() > 0) {  
                List<RegistryConfig> registryConfigs = new ArrayList<RegistryConfig>();  
                for (RegistryConfig config : registryConfigMap.values()) {  
                    if (config.isDefault() == null || config.isDefault().booleanValue()) {  
                        registryConfigs.add(config);  
                    }  
                }  
  
                if (registryConfigs != null && registryConfigs.size() > 0) {  
                    //设置当前的注册中心  
                    super.setRegistries(registryConfigs);  
                }  
            }  
        }  
  
        //判断当前MonitorConfig监控中心是否存在，如果不存在从spring容器中获取  
        if (getMonitor() == null  
                && (getConsumer() == null || getConsumer().getMonitor() == null)  
                && (getApplication() == null || getApplication().getMonitor() == null)) {  
            Map<String, MonitorConfig> monitorConfigMap = applicationContext == null ? null : BeanFactoryUtils.beansOfTypeIncludingAncestors(applicationContext, MonitorConfig.class, false, false);  
            if (monitorConfigMap != null && monitorConfigMap.size() > 0) {  
                MonitorConfig monitorConfig = null;  
                for (MonitorConfig config : monitorConfigMap.values()) {  
                    if (config.isDefault() == null || config.isDefault().booleanValue()) {  
                        if (monitorConfig != null) {  
                            throw new IllegalStateException("Duplicate monitor configs: " + monitorConfig + " and " + config);  
                        }  
                        monitorConfig = config;  
                    }  
                }  
                if (monitorConfig != null) {  
                    //设置当前的监控中心  
                    setMonitor(monitorConfig);  
                }  
            }  
        }  
        Boolean b = isInit();  
        if (b == null && getConsumer() != null) {  
            b = getConsumer().isInit();  
        }  
  
        //是否容器启动加载时，立即初始化，默认是不立刻初始化处理，可以通过在dubbo:reference标签里面配置init=true来设置  
        if (b != null && b.booleanValue()) {  
            getObject();  
        }  
    }  

```

getObject中调用init(),init总体思路就是再次检测了Consumer，Application，Module，Registries等配置信息，并将配置信息全部存入到Map中。注意最后一段代码 ref = createProxy(map); 看代码应该就能理解它的作用创建代理对象，并传入了前面存进所有参数的map属性。

```aidl

 private T createProxy(Map<String, String> map) {  
        //根据map中的属性值生成URL对象  
        URL tmpUrl = new URL("temp", "localhost", 0, map);  
        final boolean isJvmRefer;  
        if (isInjvm() == null) {  
            if (url != null && url.length() > 0) { //指定URL的情况下，不做本地引用  
                isJvmRefer = false;  
            } else if (InjvmProtocol.getInjvmProtocol().isInjvmRefer(tmpUrl)) {  
                //默认情况下如果本地有服务暴露，则引用本地服务.  
                isJvmRefer = true;  
            } else {  
                isJvmRefer = false;  
            }  
        } else {  
            isJvmRefer = isInjvm().booleanValue();  
        }  
          
        if (isJvmRefer) {  
            URL url = new URL(Constants.LOCAL_PROTOCOL, NetUtils.LOCALHOST, 0, interfaceClass.getName()).addParameters(map);  
            invoker = refprotocol.refer(interfaceClass, url);  
            if (logger.isInfoEnabled()) {  
                logger.info("Using injvm service " + interfaceClass.getName());  
            }  
        } else {  
  
            //判断当前客户端是否是点对点直连，直连会跳过注册中心  
            //直连或者注册连接的url都会存储在urls中  
            if (url != null && url.length() > 0) { // 用户指定URL，指定的URL可能是对点对直连地址，也可能是注册中心URL  
                String[] us = Constants.SEMICOLON_SPLIT_PATTERN.split(url);  
                if (us != null && us.length > 0) {  
                    for (String u : us) {  
                        URL url = URL.valueOf(u);  
                        if (url.getPath() == null || url.getPath().length() == 0) {  
                            url = url.setPath(interfaceName);  
                        }  
                        if (Constants.REGISTRY_PROTOCOL.equals(url.getProtocol())) {  
                            urls.add(url.addParameterAndEncoded(Constants.REFER_KEY, StringUtils.toQueryString(map)));  
                        } else {  
                            urls.add(ClusterUtils.mergeUrl(url, map));  
                        }  
                    }  
                }  
            } else {  
                // 通过注册中心配置拼装URL  
                List<URL> us = loadRegistries(false);  
                if (us != null && us.size() > 0) {  
                    for (URL u : us) {  
                        URL monitorUrl = loadMonitor(u);  
                        if (monitorUrl != null) {  
                            map.put(Constants.MONITOR_KEY, URL.encode(monitorUrl.toFullString()));  
                        }  
                        urls.add(u.addParameterAndEncoded(Constants.REFER_KEY, StringUtils.toQueryString(map)));  
                    }  
                }  
                if (urls == null || urls.size() == 0) {  
                    throw new IllegalStateException("No such any registry to reference " + interfaceName  + " on the consumer " + NetUtils.getLocalHost() + " use dubbo version " + Version.getVersion() + ", please config <dubbo:registry address=\"...\" /> to your spring config.");  
                }  
            }  
  
  
            if (urls.size() == 1) {  
                //只有一个注册服务器时，生成客户端的代理invoker  
                invoker = refprotocol.refer(interfaceClass, urls.get(0));  
            } else {  
  
                //当有多个注册服务器时，生成多个客户端代理  
                List<Invoker<?>> invokers = new ArrayList<Invoker<?>>();  
                URL registryURL = null;  
                for (URL url : urls) {  
                    //多个服务端，生成多个对应的invoker对象  
                    invokers.add(refprotocol.refer(interfaceClass, url));  
                    if (Constants.REGISTRY_PROTOCOL.equals(url.getProtocol())) {  
                        registryURL = url; // 用了最后一个注册服务器作为注册中心 registry url  
                    }  
                }  
                if (registryURL != null) { // 有 注册中心协议的URL  
                    // 对有注册中心的集群 只用 AvailableCluster  
                    URL u = registryURL.addParameter(Constants.CLUSTER_KEY, AvailableCluster.NAME);   
                    invoker = cluster.join(new StaticDirectory(u, invokers));  
                }  else { // 不是 注册中心的URL  
                    invoker = cluster.join(new StaticDirectory(invokers));  
                }  
            }  
        }  
  
        Boolean c = check;  
        if (c == null && consumer != null) {  
            c = consumer.isCheck();  
        }  
        if (c == null) {  
            c = true; // default true  
        }  
        if (c && ! invoker.isAvailable()) {  
            throw new IllegalStateException("Failed to check the status of the service " + interfaceName + ". No provider available for the service " + (group == null ? "" : group + "/") + interfaceName + (version == null ? "" : ":" + version) + " from the url " + invoker.getUrl() + " to the consumer " + NetUtils.getLocalHost() + " use dubbo version " + Version.getVersion());  
        }  
        if (logger.isInfoEnabled()) {  
            logger.info("Refer dubbo service " + interfaceClass.getName() + " from url " + invoker.getUrl());  
        }  
        // 创建服务代理  
        return (T) proxyFactory.getProxy(invoker);  
    }  

```

上面方法中主要做了一件事情就是创建客户端接口的invoker对象，我们重点解析这段代码 invoker = refprotocol.refer(interfaceClass, url);Protocol有很多个实现类，但是ReferenceConfig作为服务提供方的一个接口实例，此时并不知道该调用哪个实现类，当生成一个refprotocol来代表所有的实现类，当调用到该类中的export方法的时候，再根据方法的参数来决定调用到哪个具体的实现类中，相当于一种高级别的代理。



refprotocol对象是什么怎么创建的，创建代码如下 `Protocol refprotocol = ExtensionLoader.getExtensionLoader(Protocol.class).getAdaptiveExtension();`具体如何创建出来的后面专门通过章节来讲解， 这里我就默认refprotocol属性是DubboProtocol类了，查看该类的refer方法如下：


```aidl


public <T> Invoker<T> refer(Class<T> serviceType, URL url) throws RpcException {  
  
        // modified by lishen  
        optimizeSerialization(url);  
  
        // create rpc invoker.  
        DubboInvoker<T> invoker = new DubboInvoker<T>(serviceType, url, getClients(url), invokers);  
        invokers.add(invoker);  
        return invoker;  
}  

```

invoker对象原来就是DubboInvoker类。因为DubboInvoker继承了AbstractInvoker类，它重写了父类的doInvoke方法。在看看AbstractInvoker代码，它的invoke方法中最终还是执行了doInvoke方法，因为当前类的doInvoke是抽象的，所以最终还是执行了DubboInvoker中的doInvoke方法。

```aidl


public class DubboInvoker<T> extends AbstractInvoker<T> {  
  
        private final ExchangeClient[]      clients;  
  
        private final AtomicPositiveInteger index = new AtomicPositiveInteger();  
  
        private final String                version;  
          
        private final ReentrantLock     destroyLock = new ReentrantLock();  
          
        private final Set<Invoker<?>> invokers;  
          
        public DubboInvoker(Class<T> serviceType, URL url, ExchangeClient[] clients){  
            this(serviceType, url, clients, null);  
        }  
          
        public DubboInvoker(Class<T> serviceType, URL url, ExchangeClient[] clients, Set<Invoker<?>> invokers){  
            super(serviceType, url, new String[] {Constants.INTERFACE_KEY, Constants.GROUP_KEY, Constants.TOKEN_KEY, Constants.TIMEOUT_KEY});  
            this.clients = clients;  
            // get version.  
            this.version = url.getParameter(Constants.VERSION_KEY, "0.0.0");  
            this.invokers = invokers;   
        }  
  
        @Override  
        protected Result doInvoke(final Invocation invocation) throws Throwable {  
            RpcInvocation inv = (RpcInvocation) invocation;  
            final String methodName = RpcUtils.getMethodName(invocation);  
            inv.setAttachment(Constants.PATH_KEY, getUrl().getPath());  
            inv.setAttachment(Constants.VERSION_KEY, version);  
              
            ExchangeClient currentClient;  
            if (clients.length == 1) {  
                currentClient = clients[0];  
            } else {  
                currentClient = clients[index.getAndIncrement() % clients.length];  
            }  
            try {  
                boolean isAsync = RpcUtils.isAsync(getUrl(), invocation);  
                boolean isOneway = RpcUtils.isOneway(getUrl(), invocation);  
                int timeout = getUrl().getMethodParameter(methodName, Constants.TIMEOUT_KEY,Constants.DEFAULT_TIMEOUT);  
                if (isOneway) {  
                    //只负责发送消息，不需要等待反馈接口，所以结果始终未NULL  
                    boolean isSent = getUrl().getMethodParameter(methodName, Constants.SENT_KEY, false);  
                    currentClient.send(inv, isSent);  
                    RpcContext.getContext().setFuture(null);  
                    return new RpcResult();  
                } else if (isAsync) {  
                    //异步请求  
                    ResponseFuture future = currentClient.request(inv, timeout) ;  
                    RpcContext.getContext().setFuture(new FutureAdapter<Object>(future));  
                    return new RpcResult();  
                } else {  
                    //默认阻塞请求  
                    RpcContext.getContext().setFuture(null);  
                    return (Result) currentClient.request(inv, timeout).get();  
                }  
            } catch (TimeoutException e) {  
                throw new RpcException(RpcException.TIMEOUT_EXCEPTION, "Invoke remote method timeout. method: " + invocation.getMethodName() + ", provider: " + getUrl() + ", cause: " + e.getMessage(), e);  
            } catch (RemotingException e) {  
                throw new RpcException(RpcException.NETWORK_EXCEPTION, "Failed to invoke remote method: " + invocation.getMethodName() + ", provider: " + getUrl() + ", cause: " + e.getMessage(), e);  
            }  
        }  
          
        @Override  
        public boolean isAvailable() {  
            if (!super.isAvailable())  
                return false;  
            for (ExchangeClient client : clients){  
                if (client.isConnected() && !client.hasAttribute(Constants.CHANNEL_ATTRIBUTE_READONLY_KEY)){  
                    //cannot write == not Available ?  
                    return true ;  
                }  
            }  
            return false;  
        }  
  
        public void destroy() {  
            //防止client被关闭多次.在connect per jvm的情况下，client.close方法会调用计数器-1，当计数器小于等于0的情况下，才真正关闭  
            if (super.isDestroyed()){  
                return ;  
            } else {  
                //dubbo check ,避免多次关闭  
                destroyLock.lock();  
                try{  
                    if (super.isDestroyed()){  
                        return ;  
                    }  
                    super.destroy();  
                    if (invokers != null){  
                        invokers.remove(this);  
                    }  
                    for (ExchangeClient client : clients) {  
                        try {  
                            client.close();  
                        } catch (Throwable t) {  
                            logger.warn(t.getMessage(), t);  
                        }  
                    }  
                      
                }finally {  
                    destroyLock.unlock();  
                }  
            }  
        }  
    }  

```

注意看doInvoke方法中的实现，从ExchangeClient clients[]数组中取出一个对象currentClient将客户端接口请求信息发送给服务端处理。注意了这里的ExchangeClient保存的是客户端与服务器建立的socket链接对象，也就是netty的客户端对象。 在发送请求处理有3个逻辑判断

1.只负责发送请求，不需要等待反馈消息

2.异步请求

3.默认是阻塞的请求


```aidl

public abstract class AbstractProxyFactory implements ProxyFactory {  
  
        public <T> T getProxy(Invoker<T> invoker) throws RpcException {  
            Class<?>[] interfaces = null;  
            String config = invoker.getUrl().getParameter("interfaces");  
            if (config != null && config.length() > 0) {  
                String[] types = Constants.COMMA_SPLIT_PATTERN.split(config);  
                if (types != null && types.length > 0) {  
                    interfaces = new Class<?>[types.length + 2];  
                    interfaces[0] = invoker.getInterface();  
                    interfaces[1] = EchoService.class;  
                    for (int i = 0; i < types.length; i ++) {  
                        interfaces[i + 1] = ReflectUtils.forName(types[i]);  
                    }  
                }  
            }  
            if (interfaces == null) {  
                interfaces = new Class<?>[] {invoker.getInterface(), EchoService.class};  
            }  
            return getProxy(invoker, interfaces);  
        }  
          
        public abstract <T> T getProxy(Invoker<T> invoker, Class<?>[] types);  
  
    }  

```

我们回到代理的创建方法ReferenceConfig.createProxy中最后一行的代码return (T) proxyFactory.getProxy(invoker); 最后还是执行了抽象的getProxy方法。因为JavassistProxyFactory类继承了AbstractProxyFactory，并重写了getProxy方法所以最终还是执行了JavassistProxyFactory类中的getProxy方法。

```aidl

@SuppressWarnings("unchecked")  
    public <T> T getProxy(Invoker<T> invoker, Class<?>[] interfaces) {  
        return (T) Proxy.getProxy(interfaces).newInstance(new InvokerInvocationHandler(invoker));  
    }  

```
