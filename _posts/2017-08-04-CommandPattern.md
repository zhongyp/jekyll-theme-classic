---
layout: post
tile: "模式回顾之命令模式"
data: 2017-08-13 19:45
categories: "设计模式"
tag: "命令模式"
---

* content
{:toc}

永远年轻，永远热泪盈眶

命令模式
---------------------

## 定义

命令模式：将“请求”封装成对象，以便使用不同的请求，队列或者日志来参数化其他对象。命令模式也支持可撤销操作。

## 命令模式类图

![类图]({{ '/styles/images/article/CommandPattern.png' | prepend: site.baseurl  }})

## Java代码实现

现在我们模拟一个真实的场景，然后用代码实现这个场景。

假如说我们手里有一个灯泡，这个灯泡可以被遥控器控制开关。

那么我们来实现一下这个场景。

首先，我们要有一个灯,并且可以开灯。

```
public class Light {

	//开灯
    public void on(){
        System.out.print("开灯");
    }
}
```

然后，我们要有一个遥控器，这个遥控器可以开很多灯，所以首先我们要知道要开哪一个灯；然后针对这个灯，我们要有开这个灯命令；这个命令可以被灯接收到；

```
public class Client {
    public static void main(String[] args){
        //需要开的灯
        Light light = new Light();
        //开灯命令
        LightOnCommand lightOnCommand = new LightOnCommand(light);
        //远程接收者
        RemoteReceiver remoteReceiver = new RemoteReceiver();

        remoteReceiver.setCommand(lightOnCommand);
        remoteReceiver.pressLightButton();

    }
}
```

接着，我们的灯要有一个接收器，可以接受遥控器发出的命令，去控制开灯。

```
public class RemoteReceiver {

    Command command;
	//接收命令
    public void setCommand(Command command){
        this.command = command;
    }
	//开灯
    public void pressLightButton(){
        command.execute();
    }
}
```

因为命令有很多种，开灯、关灯等等，不同的命令有不同的操作方式。

因此为了封装命令的具体操作。我们需要定义一个接口。


```
public interface Command {
	//执行操作
    void execute();
    void undo();
}
```

我们做的这个场景就是一个开灯的操作，因此，我们需要定义一个开灯的命令。

```
public class LightOnCommand implements Command {

    Light light;
    public LightOnCommand(Light light){
        this.light = light;
    }
    @Override
    public void execute() {
        light.on();
    }

    @Override
    public void undo() {

    }
}
```

## 应用场景

* 队列请求
* 日志请求


