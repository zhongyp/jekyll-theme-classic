---
layout: post
title: "Dubbo服务端发布（转载）"
date: 2018-01-15
tag: "Dubbo"
detail: 
img: 

---

* content
{:toc}

[尊重原创：参考文档：http://blog.csdn.net/qiangcai/article/details/73992080](http://blog.csdn.net/qiangcai/article/details/73992080)

 dubbo自定义标签 里面说过启动服务时会首先加载XML文件中的标签，解析出来的标签数据会装配到对应的实体类中，dubbo框架里面也是这样的。我们首先看看com.alibaba.dubbo.config.spring.schema.DubboNamespaceHandler类的实现。
 
 
 ```aidl

public class DubboNamespaceHandler extends NamespaceHandlerSupport {  
  
    static {  
        Version.checkDuplicate(DubboNamespaceHandler.class);  
    }  
  
    public void init() {  
        registerBeanDefinitionParser("application", new DubboBeanDefinitionParser(ApplicationConfig.class, true));  
        registerBeanDefinitionParser("module", new DubboBeanDefinitionParser(ModuleConfig.class, true));  
        registerBeanDefinitionParser("registry", new DubboBeanDefinitionParser(RegistryConfig.class, true));  
        registerBeanDefinitionParser("monitor", new DubboBeanDefinitionParser(MonitorConfig.class, true));  
        registerBeanDefinitionParser("provider", new DubboBeanDefinitionParser(ProviderConfig.class, true));  
        registerBeanDefinitionParser("consumer", new DubboBeanDefinitionParser(ConsumerConfig.class, true));  
        registerBeanDefinitionParser("protocol", new DubboBeanDefinitionParser(ProtocolConfig.class, true));  
        registerBeanDefinitionParser("service", new DubboBeanDefinitionParser(ServiceBean.class, true));  // ServiceBean
        registerBeanDefinitionParser("reference", new DubboBeanDefinitionParser(ReferenceBean.class, false));  
        registerBeanDefinitionParser("annotation", new DubboBeanDefinitionParser(AnnotationBean.class, true));  
    }  
  
} 

```

ServiceBean实现了spring的ApplicationListener接口，所以也是一个监听器。在spring容器加载完成后触发contextrefreshedevent事件，这个事件会被实现了ApplicationListener接口的类监听到，执行对应的onApplicationEvent函数。我们看看ServiceBean类的代码:


```aidl

public void onApplicationEvent(ApplicationEvent event) {  
    if (ContextRefreshedEvent.class.getName().equals(event.getClass().getName())) {  
        if (isDelay() && ! isExported() && ! isUnexported()) {  
            if (logger.isInfoEnabled()) {  
                logger.info("The service ready on spring started. service: " + getInterface());  
            }  
            export();  
        }  
    }  
}

```

这个监听方法最终调用了export方法来实现服务的发布处理。因为ServiceBean继承了ServiceConfig类，所以最终还是调用了ServiceConfig中的export方法：

```aidl
public synchronized void export() {  
    if (provider != null) {  
        if (export == null) {  
            export = provider.getExport();//是否暴露  
        }  
        if (delay == null) {  
            delay = provider.getDelay();//是否延迟暴露  
        }  
    }  
    if (export != null && ! export.booleanValue()) {  
        return;  
    }  
    //是否延迟发布服务接口  
    if (delay != null && delay > 0) {  
        Thread thread = new Thread(new Runnable() {  
            public void run() {  
                try {  
                    Thread.sleep(delay);//延迟睡眠后调用doExport发布接口  
                } catch (Throwable e) {  
                }  
                doExport();//直接发布接口  
            }  
        });  
        thread.setDaemon(true);//设置为守护线程  
        thread.setName("DelayExportServiceThread");  
        thread.start();  
    } else {  
        doExport();//直接发布接口  
    }  
}  

```

```aidl

protected synchronized void doExport() {
        if(this.unexported) {//如果是已经解除暴露的接口则抛出异常
            throw new IllegalStateException("Already unexported!");
        } else if(!this.exported) { //如果已经暴露则不需要重复暴露 
            this.exported = true;
            ...
            ...
            ... 省略获取注册中心url、遍历所有protocol、遍历所有注册中心、给注册中心设置监控url、

                this.checkApplication();
                this.checkRegistry();
                this.checkProtocol();
                appendProperties(this);
                this.checkStubAndMock(this.interfaceClass);
                if(this.path == null || this.path.length() == 0) {
                    this.path = this.interfaceName;
                }

                this.doExportUrls();
            } else {
                throw new IllegalStateException("<dubbo:service interface=\"\" /> interface not allow null!");
            }
        }
    }

```
里面做了很多逻辑判断，但最后还是调用了doExport方法，doExport做了很多配置上检查代码比较长也非重点就不贴出来，大家可以去查看相关源码。里面调用doExportUrls方法，代码如下

```aidl

private void doExportUrls() {
        List<URL> registryURLs = this.loadRegistries(true);// 
        Iterator var2 = this.protocols.iterator();

        while(var2.hasNext()) {
            ProtocolConfig protocolConfig = (ProtocolConfig)var2.next();
            this.doExportUrlsFor1Protocol(protocolConfig, registryURLs);
        }

    }

```

loadRegistries方法返回的是两个URL,返回注册中心的url，例如zk的url，`registry://192.168.14.46:2181/com.alibaba.dubbo.registry.RegistryService?application=demo-provider&dubbo=2.0.0&pid=524&registry=zookeeper×tamp=1498806201853`

从URL可以看出，dubbo将我们设置的注册标签数据全部转换URL的形式，所有的配置参数均跟着URL后面。而集合protocols属性里面存储了我们配置的协议数据。协议可以配置多个种类。也就是说这里主要是使用这个循环将当前这个服务以某种协议在多个注册机上进行发布。但是我没看懂集合protocols对象是从哪里注入的数据，细节的我就懒得管啦！继续往doExportUrlsFor1Protocol方法中查看。

```aidl

private void doExportUrlsFor1Protocol(ProtocolConfig protocolConfig, List<URL> registryURLs) {  
        String name = protocolConfig.getName();  
        if (name == null || name.length() == 0) {  
            name = "dubbo";  
        }  
  
        String host = protocolConfig.getHost();  
        if (provider != null && (host == null || host.length() == 0)) {  
            host = provider.getHost();  
        }  
        boolean anyhost = false;  
        if (NetUtils.isInvalidLocalHost(host)) {  
            anyhost = true;  
            try {  
                host = InetAddress.getLocalHost().getHostAddress();  
            } catch (UnknownHostException e) {  
                logger.warn(e.getMessage(), e);  
            }  
            if (NetUtils.isInvalidLocalHost(host)) {  
                if (registryURLs != null && registryURLs.size() > 0) {  
                    for (URL registryURL : registryURLs) {  
                        try {  
                            Socket socket = new Socket();  
                            try {  
                                SocketAddress addr = new InetSocketAddress(registryURL.getHost(), registryURL.getPort());  
                                socket.connect(addr, 1000);  
                                host = socket.getLocalAddress().getHostAddress();  
                                break;  
                            } finally {  
                                try {  
                                    socket.close();  
                                } catch (Throwable e) {}  
                            }  
                        } catch (Exception e) {  
                            logger.warn(e.getMessage(), e);  
                        }  
                    }  
                }  
                if (NetUtils.isInvalidLocalHost(host)) {  
                    host = NetUtils.getLocalHost();  
                }  
            }  
        }  
  
        Integer port = protocolConfig.getPort();  
        if (provider != null && (port == null || port == 0)) {  
            port = provider.getPort();  
        }  
        //获取协议默认的端口号  
        final int defaultPort = ExtensionLoader.getExtensionLoader(Protocol.class).getExtension(name).getDefaultPort();  
        if (port == null || port == 0) {  
            port = defaultPort;  
        }  
        if (port == null || port <= 0) {  
            port = getRandomPort(name);//随机生成端口  
            if (port == null || port < 0) {  
                port = NetUtils.getAvailablePort(defaultPort);  
                putRandomPort(name, port);  
            }  
            logger.warn("Use random available port(" + port + ") for protocol " + name);  
        }  
  
        Map<String, String> map = new HashMap<String, String>();  
        if (anyhost) {  
            map.put(Constants.ANYHOST_KEY, "true");  
        }  
        map.put(Constants.SIDE_KEY, Constants.PROVIDER_SIDE);  
        map.put(Constants.DUBBO_VERSION_KEY, Version.getVersion());  
        map.put(Constants.TIMESTAMP_KEY, String.valueOf(System.currentTimeMillis()));  
        if (ConfigUtils.getPid() > 0) {  
            map.put(Constants.PID_KEY, String.valueOf(ConfigUtils.getPid()));  
        }  
        appendParameters(map, application);  
        appendParameters(map, module);  
        appendParameters(map, provider, Constants.DEFAULT_KEY);  
        appendParameters(map, protocolConfig);  
        appendParameters(map, this);  
        if (methods != null && methods.size() > 0) {  
            for (MethodConfig method : methods) {  
                appendParameters(map, method, method.getName());  
                String retryKey = method.getName() + ".retry";  
                if (map.containsKey(retryKey)) {  
                    String retryValue = map.remove(retryKey);  
                    if ("false".equals(retryValue)) {  
                        map.put(method.getName() + ".retries", "0");  
                    }  
                }  
                List<ArgumentConfig> arguments = method.getArguments();  
                if (arguments != null && arguments.size() > 0) {  
                    for (ArgumentConfig argument : arguments) {  
                        //类型自动转换.  
                        if(argument.getType() != null && argument.getType().length() >0){  
                            Method[] methods = interfaceClass.getMethods();  
                            //遍历所有方法  
                            if(methods != null && methods.length > 0){  
                                for (int i = 0; i < methods.length; i++) {  
                                    String methodName = methods[i].getName();  
                                    //匹配方法名称，获取方法签名.  
                                    if(methodName.equals(method.getName())){  
                                        Class<?>[] argtypes = methods[i].getParameterTypes();  
                                        //一个方法中单个callback  
                                        if (argument.getIndex() != -1 ){  
                                            if (argtypes[argument.getIndex()].getName().equals(argument.getType())){  
                                                appendParameters(map, argument, method.getName() + "." + argument.getIndex());  
                                            }else {  
                                                throw new IllegalArgumentException("argument config error : the index attribute and type attirbute not match :index :"+argument.getIndex() + ", type:" + argument.getType());  
                                            }  
                                        } else {  
                                            //一个方法中多个callback  
                                            for (int j = 0 ;j<argtypes.length ;j++) {  
                                                Class<?> argclazz = argtypes[j];  
                                                if (argclazz.getName().equals(argument.getType())){  
                                                    appendParameters(map, argument, method.getName() + "." + j);  
                                                    if (argument.getIndex() != -1 && argument.getIndex() != j){  
                                                        throw new IllegalArgumentException("argument config error : the index attribute and type attirbute not match :index :"+argument.getIndex() + ", type:" + argument.getType());  
                                                    }  
                                                }  
                                            }  
                                        }  
                                    }  
                                }  
                            }  
                        }else if(argument.getIndex() != -1){  
                            appendParameters(map, argument, method.getName() + "." + argument.getIndex());  
                        }else {  
                            throw new IllegalArgumentException("argument config must set index or type attribute.eg: <dubbo:argument index='0' .../> or <dubbo:argument type=xxx .../>");  
                        }  
  
                    }  
                }  
            } // end of methods for  
        }  
  
        if (ProtocolUtils.isGeneric(generic)) {  
            map.put("generic", generic);  
            map.put("methods", Constants.ANY_VALUE);  
        } else {  
            String revision = Version.getVersion(interfaceClass, version);  
            if (revision != null && revision.length() > 0) {  
                map.put("revision", revision);  
            }  
            //根据服务实现的接口获取相关服务方法  
            String[] methods = Wrapper.getWrapper(interfaceClass).getMethodNames();  
            if(methods.length == 0) {  
                logger.warn("NO method found in service interface " + interfaceClass.getName());  
                map.put("methods", Constants.ANY_VALUE);  
            }  
            else {  
                map.put("methods", StringUtils.join(new HashSet<String>(Arrays.asList(methods)), ","));  
            }  
        }  
        if (! ConfigUtils.isEmpty(token)) {  
            if (ConfigUtils.isDefault(token)) {  
                map.put("token", UUID.randomUUID().toString());  
            } else {  
                map.put("token", token);  
            }  
        }  
        if ("injvm".equals(protocolConfig.getName())) {  
            protocolConfig.setRegister(false);  
            map.put("notify", "false");  
        }  
        // 导出服务  
        String contextPath = protocolConfig.getContextpath();  
        if ((contextPath == null || contextPath.length() == 0) && provider != null) {  
            contextPath = provider.getContextpath();  
        }  
        //根据Map中存储的属性组装URL地址  
        URL url = new URL(name, host, port, (contextPath == null || contextPath.length() == 0 ? "" : contextPath + "/") + path, map);  
  
        if (ExtensionLoader.getExtensionLoader(ConfiguratorFactory.class)  
                .hasExtension(url.getProtocol())) {  
            url = ExtensionLoader.getExtensionLoader(ConfiguratorFactory.class)  
                    .getExtension(url.getProtocol()).getConfigurator(url).configure(url);  
        }  
  
        String scope = url.getParameter(Constants.SCOPE_KEY);  
        //配置为none不暴露  
        if (! Constants.SCOPE_NONE.toString().equalsIgnoreCase(scope)) {  
  
            //配置不是remote的情况下做本地暴露 (配置为remote，则表示只暴露远程服务)  
            if (!Constants.SCOPE_REMOTE.toString().equalsIgnoreCase(scope)) {  
                exportLocal(url);  
            }  
            //如果配置不是local则暴露为远程服务.(配置为local，则表示只暴露远程服务)  
            if (! Constants.SCOPE_LOCAL.toString().equalsIgnoreCase(scope) ){  
                if (logger.isInfoEnabled()) {  
                    logger.info("Export dubbo service " + interfaceClass.getName() + " to url " + url);  
                }  
                if (registryURLs != null && registryURLs.size() > 0  
                        && url.getParameter("register", true)) {  
                    for (URL registryURL : registryURLs) {  
                        url = url.addParameterIfAbsent("dynamic", registryURL.getParameter("dynamic"));  
                        URL monitorUrl = loadMonitor(registryURL);  
                        if (monitorUrl != null) {  
                            url = url.addParameterAndEncoded(Constants.MONITOR_KEY, monitorUrl.toFullString());  
                        }  
                        if (logger.isInfoEnabled()) {  
                            logger.info("Register dubbo service " + interfaceClass.getName() + " url " + url + " to registry " + registryURL);  
                        }  
                        //通过proxyFactory对象生成接口实现类代理对象Invoker  
                        Invoker<?> invoker = proxyFactory.getInvoker(ref, (Class) interfaceClass, registryURL.addParameterAndEncoded(Constants.EXPORT_KEY, url.toFullString()));  
                        //将Invoker对象封装到protocol协议对象中，同时开启socket服务监听端口，这里socket通信是使用netty框架来处理的  
                        Exporter<?> exporter = protocol.export(invoker);  
                        //添加对象到集合  
                        exporters.add(exporter);  
                    }  
                } else {  
                    Invoker<?> invoker = proxyFactory.getInvoker(ref, (Class) interfaceClass, url);  
  
                    Exporter<?> exporter = protocol.export(invoker);  
                    exporters.add(exporter);  
                }  
            }  
        }  
        this.urls.add(url);  
    }  

```

doExportUrlsFor1Protocol方法中主要做了几件事

1.根据xml中dubbo标签配置组装dubbo协议URL，如果没有配置任何协议，默认使用了dubbo协议。比如这里组装后端URL
`dubbo://192.168.14.46:20880/com.service.interfaces.DubboService?anyhost=true&application=demo-provider&dubbo=2.5.3&interface=com.service.interfaces.DubboService&methods=sayName,sayHello&pid=6844&revision=1.0-SNAPSHOT&side=provider&timestamp=1502851260474`
细看这里组装的URL里面携带了发布一个接口服务所有相关的参数，包括接口全限定名，接口相关方法名称，版本号，模块名称

2.通信协议未指明端口时，随机生成端口号

3.通过proxyFactory对象生成接口实现类的代理对象invoker

4.通过protocol对象将invoker封装成Exporter对象，同时开启了socket服务监听端口。这里socket通信使用的是netty框架，
