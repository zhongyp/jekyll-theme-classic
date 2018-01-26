---
layout: post
title: "MySQL存储过程和Function语法示例"
date: 2018-01-25
tag: "MySQL"
detail: 存储过程（Stored Procedure）是一组为了完成特定功能的SQL语句集，经编译后存储在数据库中，用户通过指定存储过程的名字并给定参数（如果该存储过程带有参数）来调用执行它。存储过程是可编程的函数，在数据库中创建并保存，可以由SQL语句和控制结构组成。当想要在不同的应用程序或平台上执行相同的函数，或者封装特定功能时，存储过程是非常有用的。数据库中的存储过程可以看做是对编程中面向对象方法的模拟，它允许控制数据的访问方式。
img: 
---

* content
{:toc}



## MySQL 存储过程语法示例

```
CREATE PROCEDURE pf_changeSetYear(IN set_year decimal(4,0), IN dbname varchar(40))
BEGIN
  DECLARE pre_year decimal(4,0);
  DECLARE v_sql varchar(500);
  DECLARE done INT DEFAULT 0;-- 声明一个标志done， 用来判断游标是否遍历完成
  DECLARE TT_CURSOR varchar(500);-- 接收游标值的变量
  DECLARE T_CURSOR CURSOR FOR SELECT distinct  TABLE_NAME FROM  INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = dbname and column_name = 'SET_YEAR' and table_name in (SELECT table_name FROM INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA =  dbname and table_type = 'BASE TABLE');-- 游标
  DECLARE CONTINUE HANDLER FOR NOT FOUND set done = 1;-- 在游标循环到最后会将 done 设置为 1
  SET pre_year := set_year - 1;
  OPEN T_CURSOR;-- 打开游标
  loop1:LOOP -- 开始循环
  	FETCH T_CURSOR INTO TT_CURSOR; -- 将游标中的值放到TT_CURSOR
     IF not done THEN  -- 判断是否结束
      LEAVE loop1;
    END IF;
    -- 业务逻辑
    IF (
    	TT_CURSOR <> 'SYS_YEAR'
    	AND TT_CURSOR <> 'SYS_WORK_DAY'
    ) THEN
       set v_sql = CONCAT('UPDATE ',TT_CURSOR,CONCAT(' SET SET_YEAR = ', set_year,CONCAT(' WHERE SET_YEAR  =', pre_year,' ')));
      SET @v_sql = v_sql;--必须使用@v_sql代替v_sql否则执行时会报错
    	prepare stmt from @v_sql;  
      EXECUTE stmt;  
      deallocate prepare stmt;  
    END IF;
  END LOOP;
  CLOSE T_CURSOR;
END

```

## MySQL 方法（Function）语法示例

```

CREATE DEFINER=`root`@`localhost` FUNCTION `getChildList`() RETURNS longtext CHARSET utf8
BEGIN
	DECLARE sTemp LongText;
	DECLARE sTempChd VARCHAR(1000);
	
	SET sTemp = '$';
	SET sTempChd = '';
	SELECT GROUP_CONCAT(parent_id) INTO sTempChd FROM MA_ELE_AGENCYMB;
		SELECT GROUP_CONCAT(parent_id) INTO sTemp FROM MA_ELE_AGENCYMB;
		 WHILE sTempChd IS NOT NULL DO
			 SET sTemp = CONCAT(sTemp,',',sTempChd);
			 SELECT GROUP_CONCAT(parent_id) INTO sTempChd FROM ma_ele_agency WHERE FIND_IN_SET(chr_id,sTempChd)>0;
		 END WHILE;
		 RETURN sTemp;
    END

```



## 存储过程优点



* 增强SQL语言的功能和灵活性：存储过程可以用控制语句编写，有很强的灵活性，可以完成复杂的判断和较复杂的运算。

* 标准组件式编程：存储过程被创建后，可以在程序中被多次调用，而不必重新编写该存储过程的SQL语句。而且数据库专业人员可以随时对存储过程进行修改，对应用程序源代码毫无影响。

* 较快的执行速度：如果某一操作包含大量的Transaction-SQL代码或分别被多次执行，那么存储过程要比批处理的执行速度快很多。因为存储过程是预编译的。在首次运行一个存储过程时查询，优化器对其进行分析优化，并且给出最终被存储在系统表中的执行计划。而批处理的Transaction-SQL语句在每次运行时都要进行编译和优化，速度相对要慢一些。

* 减少网络流量：针对同一个数据库对象的操作（如查询、修改），如果这一操作所涉及的Transaction-SQL语句被组织进存储过程，那么当在客户计算机上调用该存储过程时，网络中传送的只是该调用语句，从而大大减少网络流量并降低了网络负载。

* 作为一种安全机制来充分利用：通过对执行某一存储过程的权限进行限制，能够实现对相应的数据的访问权限的限制，避免了非授权用户对数据的访问，保证了数据的安全。