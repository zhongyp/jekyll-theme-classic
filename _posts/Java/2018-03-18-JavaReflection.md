---
layout: post
title: "Java反射和动态代理"
date: 2018-03-18
tag: "Java"
detail: JAVA反射机制是在运行状态中，对于任意一个类，都能够知道这个类的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称为java语言的反射机制。
img: 

---

* content
{:toc}

要想理解反射的原理，首先要了解什么是类型信息。Java让我们在运行时识别对象和类的信息，主要有2种方式：一种是传统的RTTI，它假定我们在编译时已经知道了所有的类型信息；另一种是反射机制，它允许我们在运行时发现和使用类的信息。

## CLASS 对象

每个类都会产生一个对应的Class对象，也就是保存在.class文件。所有类都是在对其第一次使用时，动态加载到JVM的，当程序创建一个对类的静态成员的引用时，就会加载这个类。Class对象仅在需要的时候才会加载，static初始化是在类加载时进行的。

类加载器首先会检查这个类的Class对象是否已被加载过，如果尚未加载，默认的类加载器就会根据类名查找对应的.class文件。

想在运行时使用类型信息，必须获取对象(比如类Base对象)的Class对象的引用，使用功能Class.forName(“Base”)可以实现该目的，或者使用base.class。注意，有一点很有趣，使用功能”.class”来创建Class对象的引用时，不会自动初始化该Class对象，使用forName()会自动初始化该Class对象。为了使用类而做的准备工作一般有以下3个步骤：

* 加载：由类加载器完成，找到对应的字节码，创建一个Class对象

* 链接：验证类中的字节码，为静态域分配空间

* 初始化：如果该类有超类，则对其初始化，执行静态初始化器和静态初始化块

```aidl

public class Base {
    static int num = 1;
    
    static {
        System.out.println("Base " + num);
    }
}
public class Main {
    public static void main(String[] args) {
        // 不会初始化静态块
        Class clazz1 = Base.class;
        System.out.println("------");
        // 会初始化
        Class clazz2 = Class.forName("zzz.Base");
    }
}

```

## 反射

如果不知道某个对象的确切类型，RTTI可以告诉你，但是有一个前提：这个类型在编译时必须已知，这样才能使用RTTI来识别它。Class类与java.lang.reflect类库一起对反射进行了支持，该类库包含Field、Method和Constructor类，这些类的对象由JVM在启动时创建，用以表示未知类里对应的成员。这样的话就可以使用Contructor创建新的对象，用get()和set()方法获取和修改类中与Field对象关联的字段，用invoke()方法调用与Method对象关联的方法。另外，还可以调用getFields()、getMethods()和getConstructors()等许多便利的方法，以返回表示字段、方法、以及构造器对象的数组，这样，对象信息可以在运行时被完全确定下来，而在编译时不需要知道关于类的任何事情。

反射机制并没有什么神奇之处，当通过反射与一个未知类型的对象打交道时，JVM只是简单地检查这个对象，看它属于哪个特定的类。因此，那个类的.class对于JVM来说必须是可获取的，要么在本地机器上，要么从网络获取。所以对于RTTI和反射之间的真正区别只在于：

* RTTI，编译器在编译时打开和检查.class文件

* 反射，运行时打开和检查.class文件

```aidl


public class Main {
    public static void main(String args[]) throws ClassNotFoundException, InvocationTargetException, IllegalAccessException, NoSuchMethodException {

        Test test =  new Test();
    
        Class clazz = Class.forName("com.zhongyp.advanced.proxy.Test");
        Constructor[] constructors = clazz.getConstructors();
        for(Constructor str:constructors){
            System.out.println(str);
        }

        Method[] method = clazz.getDeclaredMethods();
        for(Method method1:method){
            System.out.println(method1);
        }
        Method method1 = clazz.getMethod("go", null);
        method1.invoke(test,null);
    }
}
    
    
class Test{


    public Test(){}

    private void test(){}
    public void go(){
        System.out.println("go");

    }

    public void gogogo(){
        System.out.println("gogogo");

    }

}
```

## 动态代理

代理模式是为了提供额外或不同的操作，而插入的用来替代”实际”对象的对象，这些操作涉及到与”实际”对象的通信，因此代理通常充当中间人角色。Java的动态代理比代理的思想更前进了一步，它可以动态地创建并代理并动态地处理对所代理方法的调用。在动态代理上所做的所有调用都会被重定向到单一的调用处理器上，它的工作是揭示调用的类型并确定相应的策略。以下是一个动态代理示例：

```aidl

interface TestService{

    void test();
}

class TestServiceImpl implements TestService{
    @Override
    public void test(){
        System.out.println("我要开始测试啦");
    }
}

class MyInvokeHandler implements InvocationHandler{

    Object obj;
    public MyInvokeHandler(Object obj){
        this.obj = obj;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        return method.invoke(obj,args);
    }
}


public class Main {
    public static void main(String args[]) {

        TestServiceImpl testService = new TestServiceImpl();

        MyInvokeHandler myInvokeHandler = new MyInvokeHandler(testService);

        TestService proxy = (TestService) Proxy.newProxyInstance(TestService.class.getClassLoader(),new Class[]{TestService.class},myInvokeHandler);

        proxy.test();
    }
}

```



