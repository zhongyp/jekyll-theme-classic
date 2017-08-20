---
layout: post
title: "算法回顾--冒泡排序"
data: 2017-08-04 19:45
categories: "算法"
tag: "冒泡"
---

* content
{:toc}


冒泡排序
---------------------

## 原理

冒泡排序是依次比较数列相邻的两个数字的大小，按照从大到小或者从小到大的规则进行交换，重复遍历数列直至没有可交换的数列，排序完成。

## 举例

数列：[3,5,1,7,4]

规则：从小到大

排序：

* 比较3-5，5大于3，不交换，数列不变[3,5,1,7,4]
* 比较5-1,5大于1，交换，数列变化[3,1,5,7,4]
* 比较5-7,7大于5，不交换，数列不变[3,1,5,7,4]
* 比较7-4,7大约4，交换，数列变化[3,1,5,4,7]
* 然后重复遍历数列,直至最后没有可以交换的数列。

## Java代码实现

```
    public static void bubbleSort(){
//        int[] arr = {3,5,7,1,4};
        int[] arr = {1,2,3,4,5};
        int i,j,temp,len=arr.length;
        //是否已经完成排序的标志
        boolean flag;
        //排序
        for(i=0;i<arr.length-1;i++){
            flag = true;
            for(j=i+1;j<arr.length;j++){
                if(arr[j]<arr[i]){
                    temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                    flag = false;
                }
            }
            if(flag){
                System.out.println("第" + (i+1) + "趟结束了");
                break;
            }
        }
        //遍历输出数组
        for(int o:arr){
            System.out.print(" " + o);
        }
    }
```

## 时间复杂度分析

最坏情况下：第1趟排序需要比较(n-1)次，... 第(n-1)趟比较1次，O(n)=((n-1)+1)*(n-1)/2=n*(n-1)/2=n^2。

最好情况下：比较(n-1)次。





