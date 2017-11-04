---
layout: post
title: "Knockout.js教程"
date: 2017-2-16
tag: "JavaScript"
detail: Knockout是一款很优秀的JavaScript库，它可以帮助你仅使用一个清晰整洁的底层数据模型（data model）即可创建一个富文本且具有良好的显示和编辑功能的用户界面。任何时候你的局部UI内容需要自动更新（比如：依赖于用户行为的改变或者外部的数据源发生变化），KO都可以很简单的帮你实现，并且非常易于维护。
img: 
topic: Knockout
bio: 
---

* content
{:toc}



# 1.Knockout.js简介

Knockout是一个轻量级的UI类库，通过应用MVVM模式使JavaScript前端UI简单化。

Knockout有如下4大重要概念：

* 声明式绑定 (Declarative Bindings)：使用简明易读的语法很容易地将模型(model)数据关联到DOM元素上。
* UI界面自动刷新 (Automatic UI Refresh)：当您的模型状态(model state)改变时，您的UI界面将自动更新。
* 依赖跟踪 (Dependency Tracking)：为转变和联合数据，在你的模型数据之间隐式建立关系。
* 模板 (Templating)：为您的模型数据快速编写复杂的可嵌套的UI。

重要特性:

* 优雅的依赖追踪- 不管任何时候你的数据模型更新，都会自动更新相应的内容。
* 声明式绑定- 浅显易懂的方式将你的用户界面指定部分关联到你的数据模型上。
* 灵活全面的模板- 使用嵌套模板可以构建复杂的动态界面。
* 轻易可扩展- 几行代码就可以实现自定义行为作为新的声明式绑定。

额外的好处：

* 纯JavaScript类库 – 兼容任何服务器端和客户端技术
* 可添加到Web程序最上部 – 不需要大的架构改变
* 简洁的 – Gzip之前大约25kb
* 兼容任何主流浏览器 (IE 6+、Firefox 2+、Chrome、Safari、其它)
* Comprehensive suite of specifications （采用行为驱动开发） - 意味着在新的浏览器和平台上可以很容易通过验证。

注：MVVM模式和MVC模式一样，主要目的是分离视图（View）和模型（Model），有几大优点
1. 低耦合。视图（View）可以独立于Model变化和修改，一个ViewModel可以绑定到不同的"View"上，当View变化的时候Model可以不变，当Model变化的时候View也可以不变。
2. 可重用性。你可以把一些视图逻辑放在一个ViewModel里面，让很多view重用这段视图逻辑。
3. 独立开发。开发人员可以专注于业务逻辑和数据的开发（ViewModel），设计人员可以专注于页面设计，使用Expression Blend可以很容易设计界面并生成xml代码。
4. 可测试。界面素来是比较难于测试的，而现在测试可以针对ViewModel来写。

Knockout是一个以数据模型（data model）为基础的能够帮助你创建富文本，响应显示和编辑用户界面的JavaScript类库。任何时候如果你的UI需要自动更新（比如：更新依赖于用户的行为或者外部数据源的改变），KO能够很简单的帮你实现并且很容易维护。


