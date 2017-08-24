---
layout: post
title: "JS模块化之路RequireJS"
date: 2017-2-15
tag: "JavaScript"
detail: RequireJS 是一个JavaScript模块加载器。它非常适合在浏览器中使用，但它也可以用在其他脚本环境，就像 Rhino and Node。使用RequireJS加载模块化脚本将提高代码的加载速度和质量。
img: requirejs
---

* content
{:toc}


## 1.1 RequireJS是什么？

RequireJS的目标是鼓励代码的模块化，它使用了不同于传统`<script>`标签的脚本加载步骤。可以用它来加速、优化代码，但其主要目的还是为了代码的模块化。它鼓励在使用脚本时以module ID替代URL地址。

## 1.2 使用RequireJS
### 1.2.1 加载JavaScript文件
RequireJS以一个相对于baseUrl的地址加载所有的js代码，baseUrl设置有两种方式：
#### 1.2.1.1 data-main属性
一个是用`<scirpt>`标签的data-main属性，例如：
`<script data-main="script/main.js" src="script/require.js"></script>`
页面在加载require.js后会自动加载main.js里的内容。此时的baseUrl的地址为`script/`。注：data-main是异步加载的，所以如果你在其他页面配置了其他的JS加载，则不能保证他们所依赖的JS已经加载成功。
例如：
```
<script data-main="scripts/main" src="scripts/require.js"></script>
<script src="scripts/other.js"></script>  
```
```
// contents of main.js:
require.config({
    paths: {
        foo: 'libs/foo-1.1.3'
    }
});
```
```
// contents of other.js:

// This code might be called before the require.config() in main.js
// has executed. When that happens, require.js will attempt to
// load 'scripts/foo.js' instead of 'scripts/libs/foo-1.1.3.js'
require( ['foo'], function( foo ) {

});
```
#### 1.2.1.2 配置函数
baseUrl亦可通过配置函数手动配置。如果没有显式指定config及data-main，则默认的baseUrl为包含RequireJS的那个HTML页面的所属目录。如果你需要修改RequireJS的默认配置来使用自己的配置，可以使用require.config函数，require.config函数需要传入一个可选的参数对象，如下是可以使用的配置参数选项。

* baseUrl--用于加载模块的根路径
* paths--用于映射不存在于根路径下的模块路径
* shims--配置在脚本/模块外面并没有使用RequireJS的函数依赖并且初始化函数。假设underscore并没有使用  RequireJS定义，但是你还是想通过RequireJS来使用它，那么你就需要在配置中把它定义为一个shim。
* deps--加载依赖关系数组
* exports--exports值（输出的变量名），表明这个模块外部调用时的名称



一般来说，最好还是使用baseUrl及"paths" config去设置module ID。它会给你带来额外的灵活性，如便于脚本的重命名、重定位等。 同时，为了避免凌乱的配置，最好不要使用多级嵌套的目录层次来组织代码，而是要么将所有的脚本都放置到baseUrl中，要么分置为项目库/第三方库的一个扁平结构，如下：
```
- www/
  - index.html
  - js/
    - app/
	  -sub.js 
    - lib/
	  -jquery.js
	  -cancas.js
  -app.js

```
index.html

`<script data-main="js/app.js" src="js/require.js"></script>`

app.js
```
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app'
    }
	shim: {
        'backbone': {
            //The underscore script dependency should be loaded before loading backbone.js
            deps: ['underscore'],
            // use the global 'Backbone' as the module name.
            exports: 'Backbone'
        }
    }
});

// Start the main app logic.
requirejs(['jquery', 'canvas', 'app/sub'],
function   ($, canvas, sub) {
    //jQuery, canvas and the app/sub module are all
    //loaded and can be used here now.
});
```
### 1.2.2 用RequireJS定义模块
模块是进行了内部实现封装、暴露接口和合理限制范围的对象。ReuqireJS提供了define函数用于定义模块。按章惯例每个Javascript文件只应该定义一个模块。define函数接受一个依赖数组和一个包含模块定义的函数。通常模块定义函数会把前面的数组中的依赖模块按顺序做为参数接收。例如，下面是一个简单的模块定义:
```
define(["logger"], function(logger) {        
        return {
             firstName: “John",
             lastName: “Black“,
             sayHello: function () {
                logger.log(‘hello’);
             }
        }
    }
);
```
我们看，一个包含了logger的模块依赖数组被传给了define函数,该模块后面会被调用。同样我们看所定义的模块中有一个名为logger的参数，它会被设置为logger模块。每一个模块都应该返回它的API.这个示例中我们有两个属性(firstName和lastName)和一个函数(sayHello)。然后，只要你后面定义的模块通过ID来引用这个模块，你就可以使用其暴露的API。


### 1.2.3 使用require函数

在RequireJS中另外一个非常有用的函数是require函数。require函数用于加载模块依赖但并不会创建一个模块。例如：下面就是使用require定义了能够使用jQuery的一个函数。
```
require(['jquery'], function ($) {
    //jQuery was loaded and can be used now
});
```
