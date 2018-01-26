---
layout: post
title: "MySQL存储过程和Function语法示例"
date: 2018-01-25
tag: "MySQL"
detail: 
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



