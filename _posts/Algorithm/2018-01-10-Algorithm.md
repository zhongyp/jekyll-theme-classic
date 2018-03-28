---
layout: post
title: "算法（Algorithm）"
date: 2018-01-10
tag: "算法"
detail: 算法的分类以及经典算法题的代码实现，修炼内功
img: 
---

* content
{:toc}


[本文的所有算法代码均在github上保存，点击此链接即可访问](https://github.com/zhongyp/Demo/tree/master/src/main/java/com/zhongyp/algorithm)

## 二叉树


```aidl
    /**
     * 先序、中序遍历二叉树
     * 先序：根左右
     * 中序：左根右
     *
     */
    // 标记先序索引位置
    int count = 0;
    public  Tree buildTreeByPreMid(int[] a, int s1, int e1,int[] b, int s2, int e2){

        if(s1>e1||s2>e2){
            return null;
        }
        Tree tree = new Tree();
         tree.value = a[count];
        // index为a[s1]在b中的索引
        int index = getIndex(b, a[count]);
        count++;
        // count标识左子树先序的起点，s1+index为左子树先序的终点，s2,index-1分别为左子树中序的起点和终点
        tree.left = buildTreeByPreMid(a, count, s1+index, b, s2, index-1);
        tree.right = buildTreeByPreMid(a, count, s1+e2-index, b, index+1, e2);

        return tree;
    }
    /**
     *
     * 中序、后序 构建二叉树
     *
     */
    int count1 = 7;
    public Tree buildTreeByMidLast(int[] a, int s1, int e1,int[] b, int s2, int e2){
        if(s1>e1||s2>e2){
            return null;
        }
        Tree tree = new Tree();
        tree.value = a[e1];
        int index = getIndex(b, a[e1]);
        count1--;
        tree.right = buildTreeByMidLast(a, count1+index-e2+1, count1, b, index+1, e2);
        tree.left = buildTreeByMidLast(a, s1, count1, b, s2, index-1);
        return tree;
    }
    private int getIndex(int[] b,int value){
        int count = 0;
        for(int tmp:b){
            if(tmp==value){
                return count;
            }
            count++;
        }
        return 0;
    }
    // 先序
    public void printPre(Tree tree){
        if(tree != null){
            System.out.print(tree.value);
        }
        if(tree.left != null){
            printPre(tree.left);
        }
        if(tree.right != null){
            printPre(tree.right);
        }

    }
    // 中序
    public void printMid(Tree tree){
        if(tree.left != null){
            printMid(tree.left);
        }
        if (tree != null){
            System.out.print(tree.value);
        }
        if(tree.right != null){
            printMid(tree.right);
        }

    }
    // 后序
    public void printLast(Tree tree){
        if(tree.left != null){
            printLast(tree.left);
        }
        if(tree.right != null){
            printLast(tree.right);
        }
        if (tree != null){
            System.out.print(tree.value);
        }

    }
    /**
     * 
     * 1.将节点放入队列
     * 2.取出队列第一个节点
     * 3.将取出的节点的左右节点一次放入队列
     * 递归
     */
    public void printLevel(Tree tree){
        if(tree == null){
            return;
        }
        Tree current;
        LinkedList list = new LinkedList();
        list.offer(tree);
        while(!list.isEmpty()){
            current = (Tree)list.poll();
            System.out.print(current.value);
            if(current.left != null){
                list.offer(current.left);
            }
            if(current.right != null){
                list.offer(current.right);
            }

        }
    }
    // 二叉树叶子节点个数
    int count2 = 0;
    public void sumLeaf(Tree tree){
        if(tree.left == null&&tree.right == null){
            count2++;
        }
        if(tree.left != null){
            sumLeaf(tree.left);
        }
        if(tree.right != null){
            sumLeaf(tree.right);
        }
    }
    // 二叉树的高度
    public int hightTree(Tree tree){
        if(tree == null){
            return 0;
        }
        if(tree.left == null && tree.right == null){
            return 1;
        }
        int l_hight = hightTree(tree.left);
        int r_hight = hightTree(tree.right);
        return l_hight>r_hight?l_hight+1:r_hight+1;
    }
    
    // 求两个节点的最近公共祖先
    public void commonParent(int value1, int value2){
        if(root == null || p == root || q == root) {
            return root;
        }

        Tree l = lowestCommonAncestor(root.left,p,q);
        Tree r = lowestCommonAncestor(root.right,p,q);

        if(l!= null && r!= null) {
            return root;
        }
        return l != null?l:r;
        
    }
    
    // 路径值
    Stack<Integer> stack = new Stack();
    public void FindPath(Tree tree, int sum, int current){
        if(tree==null){
            return ;
        }

        current+=tree.value;
        stack.push(tree.value);
        if(current==sum){
            System.out.println("PATH:");
            for(int val : stack){
                System.out.print(val);
            }
        }
        if(current<sum){
            if(tree.left != null){
                FindPath(tree.left,sum,current);
            }
            if(tree.right != null){
                FindPath(tree.right,sum,current);
            }
        }

        current -= tree.value;
        stack.pop();
    }
    
```





## 链表 

1. 链表逆序（不可使用其他空间）

```aidl

    /**
     * 非递归
     */
    public Node reverse(Node node){
        Node init = null;
        while(node != null){
            Node node1 = init;
            Node node2 = node;
            node = node.next;
            node2.next = node1;
            init = node2;
        }

        return init;
    }
    
    /**
     * 递归方式
     * @param node1
     * @return
     */
    public Node reverse1(Node node1){

        Node init = node1.next;
        if(init != null){
            Node node2= reverse1(init);
            Node tmp = getLastNode(node2);
            node1.next = null;
            tmp.next = node1;
            return node2;
        }else{
            return node1;
        }
    }

```

 
 
## 十大经典排序算法

* 插入排序： 直接插入，希尔排序

```aidl
    
    /**
         * 直接插入排序算法的空间复杂度为O(1)。
         * 最好的情况，要比较的无序序列原本就是顺序有序的，那么要比较的次数是n-1，移动了0次，时间复杂度O(n)。
         * 最坏的情况，要比较的无序序列原本就是逆序有序的，那么要比较的次数是(n+2)(n-1)/2，移动的次数(n+4)(n-1)/2，时间复杂度O(n²)。
         * 直接插入排序的平均复杂度为O(n²)。
         * 直接插入排序是稳定的。
         * @param num
         */
    public void directInsert(int[] num){
        for(int i=1; i<num.length; i++){
            for(int j=0;j<i;j++){
                if(num[i]<num[j]){
                    int a = num[j];
                    num[j] = num[i];
                    num[i] = a;
                }
            }
        }
        for(int val:num){
            System.out.print(val + " ");
        }
    }

     /**
         * 希尔排序在最坏的情况下的运行时间是O(n²)，平均时间复杂度为O(n^1.3)。
         * 希尔排序对于多达几千个数据项的，中等大小规模的数组排序表现良好。
         * 希尔排序不像快速排序和其它时间复杂度为O(nlog2n)的排序算法那么快，因此对非常大的文件排序，它不是最优选择。
         * 但是，希尔排序比选择排序和插入排序这种时间复杂度为O(n²)的排序算法还是要快得多，并且它非常容易实现。
         * 它在最坏情况下的执行效率和在平均情况下的执行效率相比没有差很多。
         * 此外希尔排序是不稳定的(指在多次插入排序中，相同元素可能在插入排序中移动，导致稳定性被破坏)。
         * @param num
         */
    public void hillSort(int[] num){
        int gap = 5;
        while(gap>0){
            for(int i=0; i<num.length-gap; i++){
                if(num[i]>num[i+gap]){
                    int a = num[i];
                    num[i] = num[i+gap];
                    num[i+gap] = a;
                }
            }
            gap = gap/2;
        }
        for(int val:num){
            System.out.print(val + " ");
        }

    }

```

* 选择排序： 简单选择排序，堆排序

```aidl


/**
     * 选择排序
     * @param num
     */
    public void simpleSort(int[] num){
        for(int i=0;i<num.length;i++){
            int index = i;
            for(int j=i;j<num.length-1;j++){
                if(num[index]>num[j+1]){
                    index = j+1;
                }
            }
            int a = num[i];
            num[i] = num[index];
            num[index] = a;
        }
        for(int val:num){
            System.out.print(val + " ");
        }
    }

    /**
     * 堆排序
     *
     * 堆是具有以下性质的完全二叉树：每个结点的值都大于或等于其左右孩子结点的值，称为大顶堆；或者每个结点的值都小于或等于其左右孩子结点的值，称为小顶堆。
     *
     * @param num
     * @param index
     */
    public void heapSort(int[] num, int index){

        for(int i=index/2;i>-1;i--){
            if((2*i)<index&&num[i]<num[2*i]){
                int a = num[i];
                num[i] = num[2*i];
                num[2*i] = a;
            }
            if((2*i+1)<index&&num[i]<num[2*i+1]){
                int a = num[i];
                num[i] = num[2*i+1];
                num[2*i+1] = a;
            }
        }

        int a = num[index];
        num[index] = num[0];
        num[0] = a;
        index = index-1;
        if(index>0){
            heapSort(num,index);
        }

    }
```

* 交换排序： 冒泡排序，快速排序


```aidl

    // 冒泡排序
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


    // 快速排序
    public static void quickSort(int[] num,int start, int end){
            int sys = num[start];
            int left = start;
            int right = end;

            while(start<end){
                if(num[end]<sys){
                    num[start] = num[end];
                    start++;
                }else{
                    end--;
                    continue;
                }
                if(sys<num[start]){
                    num[end] = num[start];
                    end--;
                }else{
                    start++;
                    continue;
                }
            }
            num[start] = sys;
            if(left<start-1){
                quickSort(num,left,start-1);
            }
            if(right>end+1){
                quickSort(num,end+1,right);
            }

    }

```

* 归并排序

```aidl

    
    static int[] sort(int[] a, int start, int end){

        int mid ;
        if(start<end){
            mid = (start + end)/2;
            a = sort(a, start, mid);
            a = sort(a, mid+1, end);
            a = merge(a, start, mid, end);
        }
        return a;
    }

    static int[] merge(int[] a, int start, int mid, int end){
        int i = 0;
        int j = 0;
        int[] c = new int[a.length];
        while((start+i)<=mid&&(mid+1+j)<=end){
            if(a[start+i]>a[mid+1+j]){
                c[i+j] = a[mid+1+j];
                j++;
            }else{
                c[i+j] = a[start+i];
                i++;
            }

        }
        while((start+i)<=mid){
            c[i+j] = a[start+i];
            i++;
        }
        while((mid+1+j)<=end){
            c[i+j] = a[mid+1+j];
            j++;
        }
        for(int k=0;k<=(i+j-1);k++){
            a[start+k] = c[k];
        }
        return a;
    }


```

* 基数排序

```aidl

    public int[] radixSort(int[] A, int n) {
        int length = n;
        int divisor = 1;// 定义每一轮的除数，1,10,100...
        int[][] bucket = new int[10][length];// 定义了10个桶，以防每一位都一样全部放入一个桶中
        int[] count = new int[10];// 统计每个桶中实际存放的元素个数
        int digit;// 获取元素中对应位上的数字，即装入那个桶
        for (int i = 1; i <= 3; i++) {// 经过4次装通操作，排序完成
            for (int temp : A) {// 计算入桶
                digit = (temp / divisor) % 10;
                bucket[digit][count[digit]++] = temp;
            }
            int k = 0;// 被排序数组的下标
            for (int b = 0; b < 10; b++) {// 从0到9号桶按照顺序取出
                if (count[b] == 0)// 如果这个桶中没有元素放入，那么跳过
                continue;
                for (int w = 0; w < count[b]; w++) {
                    A[k++] = bucket[b][w];
                }
                count[b] = 0;// 桶中的元素已经全部取出，计数器归零
            }
            divisor *= 10;
        }
        return A;
    }

```


## 剑指offfer 所有算法

第01-10题


【剑指Offer学习】【面试题02：实现Singleton 模式——七种实现方式】

【剑指Offer学习】【面试题03：二维数组中的查找】

【剑指Offer学习】【面试题04：替换空格】

【剑指Offer学习】【面试题05：从尾到头打印链表】

【剑指Offer学习】【面试题06：重建二叉树】

【剑指Offer学习】【面试题07：用两个栈实现队列】

【剑指Offer学习】【面试题08：旋转数组的最小数字】

【剑指Offer学习】【面试题09：斐波那契数列】

【剑指Offer学习】【面试题10：二进制中1 的个数】

第11-20题

【剑指Offer学习】【面试题11：数值的整数次方】

【剑指Offer学习】【面试题12：打印1 到最大的n 位数】

【剑指Offer学习】【面试题13：在O（1）时间删除链表结点】

【剑指Offer学习】【面试题14：调整数组顺序使奇数位于偶数前面】

【剑指Offer学习】【面试题15：链表中倒数第k个结点】

【剑指Offer学习】【面试题16：反转链表】

【剑指Offer学习】【面试题17：合并两个排序的链表】

【剑指Offer学习】【面试题18：树的子结构】

【剑指Offer学习】【面试题19：二叉树的镜像】

【剑指Offer学习】【面试题20：顺时针打印矩阵】

第21-30题

【剑指Offer学习】【面试题21：包含min函数的钱】

【剑指Offer学习】【面试题22：栈的压入、弹出序列】

【剑指Offer学习】【面试题23：从上往下打印二叉树】

【剑指Offer学习】【面试题24：二叉搜索树的后序遍历序列】

【剑指Offer学习】【面试题25：二叉树中和为某一值的路径】

【剑指Offer学习】【面试题26：复杂链表的复制】

【剑指Offer学习】【面试题27：二叉搜索树与双向链表】

【剑指Offer学习】【面试题28：字符串的排列】

【剑指Offer学习】【面试题29：数组中出现次数超过一半的数字】

【剑指Offer学习】【面试题30：最小的k个数】

第31-40题

【剑指Offer学习】【面试题31：连续子数组的最大和】

【剑指Offer学习】【面试题32：求从1到n的整数中1出现的次数】

【剑指Offer学习】【面试题33：把数组排成最小的数】

【剑指Offer学习】【面试题34：丑数】

【剑指Offer学习】【面试题35：第一个只出现一次的字符】

【剑指Offer学习】【面试题36：数组中的逆序对】

【剑指Offer学习】【面试题37：两个链表的第一个公共结点】

【剑指Offer学习】【面试题38：数字在排序数组中出现的次数】

【剑指Offer学习】【面试题39：二叉树的深度】

【剑指Offer学习】【面试题40：数组中只出现一次的数字】

第41-50题

【剑指Offer学习】【面试题41：和为s 的两个数字vs 和为s 的连续正数序列】

【剑指Offer学习】【面试题42：翻转单词顺序vs左旋转字符串】

【剑指Offer学习】【面试题43 : n 个锻子的点数】

【剑指Offer学习】【面试题44：扑克牌的顺子】

【剑指Offer学习】【面试题45：圆圈中最后剩下的数字(约瑟夫环问题)】


【剑指Offer学习】【面试题47：不用加减乘除做加法】


【剑指Offer学习】【面试题49：把字符串转换成整数】

【剑指Offer学习】【面试题50：树中两个结点的最低公共祖先】

第51-60题

【剑指Offer学习】【面试题51：数组中重复的数字】

【剑指Offer学习】【面试题52：构建乘积数组】

【剑指Offer学习】【面试题53：正则表达式匹配】

【剑指Offer学习】【面试题54：表示数值的字符串】

【剑指Offer学习】【面试题55：字符流中第一个不重复的字符】

【剑指Offer学习】【面试题56：链表中环的入口结点】

【剑指Offer学习】【面试题57：删除链表中重复的结点】

【剑指Offer学习】【面试题58：二叉树的下一个结点】

【剑指Offer学习】【面试题59：对称的二叉树】

【剑指Offer学习】【面试题60：把二叉树打印出多行】

第61-67题

【剑指Offer学习】【面试题61：按之字形顺序打印二叉树】

【剑指Offer学习】【面试题62：序列化二叉树】

【剑指Offer学习】【面试题63：二叉搜索树的第k个结点】

【剑指Offer学习】【面试题64：数据流中的中位数】

【剑指Offer学习】【面试题65：滑动窗口的最大值】

【剑指Offer学习】【面试题66：矩阵中的路径】

【剑指Offer学习】【面试题67：机器人的运动范围】


## 其他

* 并查集

* KMP

  






