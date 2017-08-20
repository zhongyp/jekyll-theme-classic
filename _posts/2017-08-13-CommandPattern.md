---
layout: post
title: '设计模式回顾——命令模式'
data: 2017-08-13 19:45
categories: "设计模式"
tag: "命令模式"
---

* content
{:toc}

命令模式
---------------------


在进入命令模式之前，我们先来看一个生活中的案例。

![案例]({{ '/styles/images/article/command-scene.png' | prepend: site.baseurl  }})

从图中，我们看到小明拿着遥控器开了吊灯。这是生活中常见的场景。下面我们对这一场景进行抽象。然后用代码去实现这个场景。

图解：

* 小明要开吊灯。小明是一个对象，开吊灯这是一个请求，请求中包含了吊灯对象和开启吊灯这个操作。

* 遥控器绿色按钮可以开吊灯，当按下绿色按钮的时候，遥控器可以执行请求里面开吊灯的具体操作。遥控器是一个对象，有点击绿色按钮的操作，方法中含有请求开启吊灯的操作。

* 吊灯可以接收到遥控器的信息，开灯。吊灯是一个对象，对象中有个开灯的操作。

下面我们用代码来实现这个场景。

首先我们要有小明。

```
public class XiaoMing{

	public static void main(String[] args){
	
		
		//小明要开灯首先要有个吊灯
		Light light = new Light();
		//小明有一个开吊灯请求,请求里面有个吊灯
		Command command =  new Command(light);
		//还有一个遥控器控制开灯
		Control control = new Control();
		//小明要把我要开灯这个请求赋予给遥控器的绿色按钮（这个在现实生活中是厂家写进遥控器里面的，而不是在这里赋予进去的）
		control.setCommand(command);
		//当按下绿色按钮的时候，遥控器要执行请求里面的开灯操作。
		control.pressGreenButton();
			
	}
}
```

吊灯。

```
public class Light{

	public void on(){
		System.out.println("我被打开了");
	}
}

```

请求。

```
public class Command{

	Light light;
	public Command(Light light){
		this.light = light;
	}
	//请求里面有开灯的具体操作
	public void execute(){
	
		light.on();
	}

}

```

遥控器。

```
public class Control{

	Command command;
	public void setCommand(Command command){
		this.command = command;
	}
	//遥控器执行请求里面的开灯操作
	public void pressGreenButton(){
		command.execute();
	}
}

```

是不是很简单，就用代码实现了一个使用遥控器开启吊灯的一个生活场景。等等，我们不是要说命令模式么，这个和命令模式有什么关系呢？其实上面的案例是一个简单的命令模式实现，理解了上面的代码，命令模式你就基本差不多已经学会了。下面则是对命令模式的标准解读。

## 定义

命令模式：将“请求”封装成对象，以便使用不同的请求、队列或者日志来参数化其他对象。命令模式也支持可撤销操作。

## 命令模式类图

![类图]({{ '/styles/images/article/CommandPattern.png' | prepend: site.baseurl  }})

## Java代码实现

```

public class Client {
    public static void main(String[] args){
        //接收者
        Receiver receiver = new Receiver();
        //请求
        CustomCommand customCommand = new CustomCommand(receiver);
        //调用者
        Invoker invoker = new Invoker();
        //请求者发出请求
        invoker.setCommand(customCommand);
        invoker.pressButton();

    }
}


public interface Command {
    void execute();
    void undo();
}


public class CustomCommand implements Command {

    //客户将接收者放入请求
    Receiver receiver;
    public CustomCommand(Receiver receiver){
        this.receiver = receiver;
    }

    //请求执行
    @Override
    public void execute() {
        receiver.on();
    }

    @Override
    public void undo() {

    }
}


public class Invoker {

    //这是调用者拥有的请求对象
    Command command;
    public void setCommand(Command command){
        this.command = command;
    }

    //某一时刻这个请求被执行
    public void pressButton(){
        command.execute();
    }
}

public class Receiver {

    public void on(){
        System.out.print("我被执行了");
    }
}

```

## 应用场景

* 队列请求
* 日志请求


