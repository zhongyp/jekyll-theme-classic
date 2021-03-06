---
layout: post
title: "ArrayList源码解析"
date: 2018-01-10
tag: "Java"
detail: ArrayList继承AbstractList类，实现List，RandomAccess，Cloneable，Serializable接口。AbstractList提供 List 接口的骨干实现，从而最大限度地减少了实现由“随机访问”数据存储（如数组）支持的接口所需的工作。对于连续的访问数据（如链表），应优先使用AbstractSequentialList，而非此类。
img: 

---

* content
{:toc}


## ArrayList

ArrayList源码中多次用到Arrays.copyOf()和System.arraycopy(),本文不对这两个方法进行解读，详细了解可以访问[Arrays.copyof(···)与System.arraycopy(···)区别](http://blog.csdn.net/shijinupc/article/details/7827507)

ArrayList继承AbstractList类，实现List，RandomAccess，Cloneable，Serializable接口。AbstractList提供 List 接口的骨干实现，从而最大限度地减少了实现由“随机访问”数据存储（如数组）支持的接口所需的工作。对于连续的访问数据（如链表），应优先使用AbstractSequentialList，而非此类。

```

/**
 * 概述：
 *  List接口可调整大小的数组实现。实现所有可选的List操作，并允许所有元素，包括null，元素可重复。
 *  除了列表接口外，该类提供了一种方法来操作该数组的大小来存储该列表中的数组的大小。
 * 
 * 时间复杂度：
 *  方法size、isEmpty、get、set、iterator和listIterator的调用是常数时间的。
 *  添加删除的时间复杂度为O(N)。其他所有操作也都是线性时间复杂度。
 *
 * 容量：
 *  每个ArrayList都有容量，容量大小至少为List元素的长度，默认初始化为10。
 *  容量可以自动增长。
 *  如果提前知道数组元素较多，可以在添加元素前通过调用ensureCapacity()方法提前增加容量以减小后期容量自动增长的开销。
 *  也可以通过带初始容量的构造器初始化这个容量。
 *
 * 线程不安全：
 *  ArrayList不是线程安全的。
 *  如果需要应用到多线程中，需要在外部做同步
 *
 * modCount：
 *  定义在AbstractList中：protected transient int modCount = 0;
 *  已从结构上修改此列表的次数。从结构上修改是指更改列表的大小，或者打乱列表，从而使正在进行的迭代产生错误的结果。
 *  此字段由iterator和listiterator方法返回的迭代器和列表迭代器实现使用。
 *  如果意外更改了此字段中的值，则迭代器（或列表迭代器）将抛出concurrentmodificationexception来响应next、remove、previous、set或add操作。
 *  在迭代期间面临并发修改时，它提供了快速失败 行为，而不是非确定性行为。
 *  fail-fast 机制是java集合(Collection)中的一种错误机制。当多个线程对同一个集合的内容进行操作时，就可能会产生fail-fast事件。例如：当某一个线程A通过iterator去遍历某集合的过程中，若该集合的内容被其他线程所改变了；那么线程A访问集合时，就会抛出ConcurrentModificationException异常，产生fail-fast事件。
 *  子类是否使用此字段是可选的。
 *  如果子类希望提供快速失败迭代器（和列表迭代器），则它只需在其 add(int,e)和remove(int)方法（以及它所重写的、导致列表结构上修改的任何其他方法）中增加此字段。
 *  对add(int, e)或remove(int)的单个调用向此字段添加的数量不得超过 1，否则迭代器（和列表迭代器）将抛出虚假的 concurrentmodificationexceptions。
 *  如果某个实现不希望提供快速失败迭代器，则可以忽略此字段。
 *
 * transient：
 *  默认情况下,对象的所有成员变量都将被持久化.在某些情况下,如果你想避免持久化对象的一些成员变量,你可以使用transient关键字来标记他们,transient也是java中的保留字(JDK 1.8)
 */

public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
{
	//
    private static final long serialVersionUID = 8683452581122892189L;

    // 默认初始化长度
    private static final int DEFAULT_CAPACITY = 10;

    // 当使用new ArrayList()创建对象时，返回EMPTY_ELEMENTDATA这个数组对象。
    private static final Object[] EMPTY_ELEMENTDATA = {};

    // 不可序列化的数组声明
    private transient Object[] elementData;

    
    private int size;

    
    public ArrayList(int initialCapacity) {
        super();
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        this.elementData = new Object[initialCapacity];
    }

    
    public ArrayList() {
        super();
        this.elementData = EMPTY_ELEMENTDATA;
    }

    
     public ArrayList(Collection<? extends E> c) {
        elementData = c.toArray();
        size = elementData.length;
        // c.toArray might (incorrectly) not return Object[] (see 6260652)
        if (elementData.getClass() != Object[].class)
            elementData = Arrays.copyOf(elementData, size, Object[].class);//此处使用Arrays工具类的copyOf复制数组
    }

    //调整ArrayList实例为当前容量大小。
    public void trimToSize() {
        modCount++;
        if (size < elementData.length) {
            elementData = Arrays.copyOf(elementData, size);
        }
    }

    //使用指定参数设置数组容量
    public void ensureCapacity(int minCapacity) {
        int minExpand = (elementData != EMPTY_ELEMENTDATA)
            // any size if real element table
            ? 0
            // larger than default for empty table. It's already supposed to be
            // at default size.
            : DEFAULT_CAPACITY;

        if (minCapacity > minExpand) {
            ensureExplicitCapacity(minCapacity);
        }
    }
	//用于添加元素时，确保数组容量
    private void ensureCapacityInternal(int minCapacity) {
        if (elementData == EMPTY_ELEMENTDATA) {
            minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
        }

        ensureExplicitCapacity(minCapacity);
    }
	//如果参数大于数组容量，就增加数组容量
    private void ensureExplicitCapacity(int minCapacity) {
        modCount++;

        // overflow-conscious code
        if (minCapacity - elementData.length > 0)
            grow(minCapacity);
    }

    //数组的最大容量，可能会导致内存溢出(VM内存限制)
    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

    //增加容量，以确保它可以至少持有由参数指定的元素的数目
    private void grow(int minCapacity) {
        // overflow-conscious code
        int oldCapacity = elementData.length;
        int newCapacity = oldCapacity + (oldCapacity >> 1);// 新的空间大小为老空间+ 老空间大小二进制左移一位，举例比如老空间为15,15>>1，结果为7，大致是1/2
            newCapacity = minCapacity;
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        // minCapacity is usually close to size, so this is a win:
        elementData = Arrays.copyOf(elementData, newCapacity);
    }

	//检查是否溢出，若没有溢出，返回最大整数值(java中的int为4字节，所以最大为0x7fffffff)或默认最大值
    private static int hugeCapacity(int minCapacity) {
        if (minCapacity < 0) // overflow
            throw new OutOfMemoryError();
        return (minCapacity > MAX_ARRAY_SIZE) ?
            Integer.MAX_VALUE :
            MAX_ARRAY_SIZE;
    }

    
    public int size() {
        return size;
    }

    
    public boolean isEmpty() {
        return size == 0;
    }

    
    public boolean contains(Object o) {
        return indexOf(o) >= 0;
    }

    
    public int indexOf(Object o) {
        if (o == null) {
            for (int i = 0; i < size; i++)
                if (elementData[i]==null)
                    return i;
        } else {
            for (int i = 0; i < size; i++)
                if (o.equals(elementData[i]))
                    return i;
        }
        return -1;
    }

    
    public int lastIndexOf(Object o) {
        if (o == null) {
            for (int i = size-1; i >= 0; i--)
                if (elementData[i]==null)
                    return i;
        } else {
            for (int i = size-1; i >= 0; i--)
                if (o.equals(elementData[i]))
                    return i;
        }
        return -1;
    }

    
    public Object clone() {
        try {
            @SuppressWarnings("unchecked")
                ArrayList<E> v = (ArrayList<E>) super.clone();
            v.elementData = Arrays.copyOf(elementData, size);
            v.modCount = 0;
            return v;
        } catch (CloneNotSupportedException e) {
            // this shouldn't happen, since we are Cloneable
            throw new InternalError();
        }
    }

    // 返回Object[]
    public Object[] toArray() {
        return Arrays.copyOf(elementData, size);
    }

    //返回一个数组，使用运行时确定类型，该数组包含在这个列表中的所有元素（从第一到最后一个元素）
    //返回的数组容量由参数和本数组中较大值确定
    @SuppressWarnings("unchecked")
    public <T> T[] toArray(T[] a) {
        if (a.length < size)
            // Make a new array of a's runtime type, but my contents:
            return (T[]) Arrays.copyOf(elementData, size, a.getClass());
        System.arraycopy(elementData, 0, a, 0, size);
        if (a.length > size)
            a[size] = null;
        return a;
    }

    // Positional Access Operations

	// 返回指定位置的值，因为是数组，所以速度特别快
    @SuppressWarnings("unchecked")
    E elementData(int index) {
        return (E) elementData[index];
    }

    // 返回指定位置的值，因为是数组，所以速度特别快
    public E get(int index) {
        rangeCheck(index);

        return elementData(index);
    }

    // 设置制定未知的值
    public E set(int index, E element) {
        rangeCheck(index);

        E oldValue = elementData(index);
        elementData[index] = element;
        return oldValue;
    }

    // 新添加值
    public boolean add(E e) {
        ensureCapacityInternal(size + 1);  // Increments modCount!!
        elementData[size++] = e;
        return true;
    }

    // 新增加指定未知的值
    public void add(int index, E element) {
        rangeCheckForAdd(index);

        ensureCapacityInternal(size + 1);  // Increments modCount!!
        System.arraycopy(elementData, index, elementData, index + 1,
                         size - index);
        elementData[index] = element;
        size++;
    }

    // 删除指定位置的值
    public E remove(int index) {
        rangeCheck(index);// 检查index范围

        modCount++;
        E oldValue = elementData(index);// 查找index位置上的值

        int numMoved = size - index - 1;
        // 如果index不是最后位置的索引，则从原列表index+1位置复制numMoved个数值到新列表从index开始
        if (numMoved > 0)
            System.arraycopy(elementData, index+1, elementData, index,
                             numMoved);
        elementData[--size] = null; // clear to let GC do its work

        return oldValue;
    }

    // 删除list中第一个值为o的对象
    public boolean remove(Object o) {
        if (o == null) {
            for (int index = 0; index < size; index++)
                if (elementData[index] == null) {
                    fastRemove(index);
                    return true;
                }
        } else {
            for (int index = 0; index < size; index++)
                if (o.equals(elementData[index])) {
                    fastRemove(index);
                    return true;
                }
        }
        return false;
    }

    // 不需要判断index是否存在且不用返回旧值
    private void fastRemove(int index) {
        modCount++;
        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index+1, elementData, index,
                             numMoved);
        elementData[--size] = null; // clear to let GC do its work
    }

    // 清空数组，赋值为null，方便垃圾回收，size归0
    public void clear() {
        modCount++;

        // clear to let GC do its work
        for (int i = 0; i < size; i++)
            elementData[i] = null;

        size = 0;
    }

    // 添加集合到末端，当集合为空时返回false
    public boolean addAll(Collection<? extends E> c) {
        Object[] a = c.toArray();
        int numNew = a.length;
        ensureCapacityInternal(size + numNew);  // Increments modCount
        System.arraycopy(a, 0, elementData, size, numNew);
        size += numNew;
        return numNew != 0;
    }

    //  从指定未知开始添加集合
    public boolean addAll(int index, Collection<? extends E> c) {
        rangeCheckForAdd(index);

        Object[] a = c.toArray();
        int numNew = a.length;
        ensureCapacityInternal(size + numNew);  // Increments modCount

        int numMoved = size - index;
        if (numMoved > 0)
            System.arraycopy(elementData, index, elementData, index + numNew,
                             numMoved);

        System.arraycopy(a, 0, elementData, index, numNew);
        size += numNew;
        return numNew != 0;
    }

    // 删除指定范围的元素
    protected void removeRange(int fromIndex, int toIndex) {
        modCount++;
        int numMoved = size - toIndex;
        System.arraycopy(elementData, toIndex, elementData, fromIndex,
                         numMoved);

        // clear to let GC do its work
        int newSize = size - (toIndex-fromIndex);
        for (int i = newSize; i < size; i++) {
            elementData[i] = null;
        }
        size = newSize;
    }

    // 检查index是否超出size
    private void rangeCheck(int index) {
        if (index >= size)
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    // 检查是否溢出列表范围
    private void rangeCheckForAdd(int index) {
        if (index > size || index < 0)
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    // 抛出异常详情
    private String outOfBoundsMsg(int index) {
        return "Index: "+index+", Size: "+size;
    }

    // 删除c集合中包含的元素
    public boolean removeAll(Collection<?> c) {
        return batchRemove(c, false);
    }

    // 仅保留c集合内存在的元素
    public boolean retainAll(Collection<?> c) {
        return batchRemove(c, true);
    }

    // 根据complement标识决定是否批量仅 保留/删除 集合c中包含的元素
    private boolean batchRemove(Collection<?> c, boolean complement) {
        final Object[] elementData = this.elementData;
        int r = 0, w = 0;
        boolean modified = false;
        try {
            for (; r < size; r++)
                if (c.contains(elementData[r]) == complement)// 如果complement=false,仅保留非c集合中的元素，为true时，仅保留c集合中的元素。
                    elementData[w++] = elementData[r];
        } finally {
            // Preserve behavioral compatibility with AbstractCollection,
            // even if c.contains() throws.
            if (r != size) {// 如果r没有遍历到size-1，则把从r到size-1的值复制到新数组，这个地方不知道什么时候会运行，有待探究
                System.arraycopy(elementData, r,
                                 elementData, w,
                                 size - r);
                w += size - r;
            }
            if (w != size) {// c集合小于当前集合时，都会运行
                // clear to let GC do its work
                for (int i = w; i < size; i++)
                    elementData[i] = null;// 将w到size-1列表上的值置空，方便垃圾回收
                modCount += size - w;//记录改动的次数
                size = w;
                modified = true;
            }
        }
        return modified;
    }

    // 序列化写
    private void writeObject(java.io.ObjectOutputStream s)
        throws java.io.IOException{
        // Write out element count, and any hidden stuff
        int expectedModCount = modCount;// 用于判断在写入流期间是否被更改的标识
        s.defaultWriteObject();

        // Write out size as capacity for behavioural compatibility with clone()
        s.writeInt(size);

        // Write out all elements in the proper order.
        for (int i=0; i<size; i++) {
            s.writeObject(elementData[i]);
        }

        if (modCount != expectedModCount) {// 将列表写入IO流后，判断在此期间列表是否别更改，如果被更改则报错。
            throw new ConcurrentModificationException();
        }
    }

    // 从流中读取值放到新建的数组对象中
    private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
        elementData = EMPTY_ELEMENTDATA;// 先声明一个空数组

        // Read in size, and any hidden stuff
        s.defaultReadObject();

        // Read in capacity
        s.readInt(); // ignored

        if (size > 0) {
            // be like clone(), allocate array based upon size not capacity
            ensureCapacityInternal(size);// 读空数组扩容

            Object[] a = elementData;
            // Read in all elements in the proper order.
            for (int i=0; i<size; i++) {
                a[i] = s.readObject();
            }
        }
    }

    // 返回ListIterator index
    public ListIterator<E> listIterator(int index) {
        if (index < 0 || index > size)
            throw new IndexOutOfBoundsException("Index: "+index);
        return new ListItr(index);
    }

    // 返回ListIterator 0
    public ListIterator<E> listIterator() {
        return new ListItr(0);
    }

    
    public Iterator<E> iterator() {
        return new Itr();
    }

   // Itr类，用于Iterator遍历
    private class Itr implements Iterator<E> {
        int cursor;       // index of next element to return
        int lastRet = -1; // index of last element returned; -1 if no such
        int expectedModCount = modCount;

        public boolean hasNext() {
            return cursor != size;
        }

        @SuppressWarnings("unchecked")
        public E next() {
            checkForComodification();
            int i = cursor;
            if (i >= size)
                throw new NoSuchElementException();
            Object[] elementData = ArrayList.this.elementData;
            if (i >= elementData.length)
                throw new ConcurrentModificationException();
            cursor = i + 1;
            return (E) elementData[lastRet = i];
        }

        public void remove() {
            if (lastRet < 0)
                throw new IllegalStateException();
            checkForComodification();

            try {
                ArrayList.this.remove(lastRet);
                cursor = lastRet;
                lastRet = -1;
                expectedModCount = modCount;
            } catch (IndexOutOfBoundsException ex) {
                throw new ConcurrentModificationException();
            }
        }

        final void checkForComodification() {
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }
    }

    // ListItrerator 不同于Itr,可向前向后遍历，在遍历期间可以修改，
    private class ListItr extends Itr implements ListIterator<E> {
        ListItr(int index) {
            super();
            cursor = index;
        }

        public boolean hasPrevious() {
            return cursor != 0;
        }

        public int nextIndex() {
            return cursor;
        }

        public int previousIndex() {
            return cursor - 1;
        }

        @SuppressWarnings("unchecked")
        public E previous() {
            checkForComodification(); //检查是否被修改
            int i = cursor - 1;
            if (i < 0)
                throw new NoSuchElementException();
            Object[] elementData = ArrayList.this.elementData;// 此处这样复制引用而不是直接调用，原因是：内部类是通过保留指向外部类的指针访问外部类字段的，显式写出来就是ltr.ArrayList.this.elementData，复制引用就是为了减少多次指针引用
            if (i >= elementData.length)
                throw new ConcurrentModificationException();
            cursor = i;
            return (E) elementData[lastRet = i];
        }

        public void set(E e) {
            if (lastRet < 0)
                throw new IllegalStateException();
            checkForComodification();

            try {
                ArrayList.this.set(lastRet, e);
            } catch (IndexOutOfBoundsException ex) {
                throw new ConcurrentModificationException();
            }
        }

        public void add(E e) {
            checkForComodification();

            try {
                int i = cursor;
                ArrayList.this.add(i, e);
                cursor = i + 1;
                lastRet = -1;
                expectedModCount = modCount;
            } catch (IndexOutOfBoundsException ex) {
                throw new ConcurrentModificationException();
            }
        }
    }

    // 返回指定范围的子数组
    // JDK中，List接口有一个实例方法List<E> subList(int fromIndex, int toIndex)，
    // 其作用是返回一个以fromIndex为起始索引（包含），以toIndex为终止索引（不包含）的子列表（List）。 
    // 但值得注意的是，返回的这个子列表的幕后其实还是原列表；
    // 也就是说，修改这个子列表，将导致原列表也发生改变；反之亦然。
    public List<E> subList(int fromIndex, int toIndex) {
        subListRangeCheck(fromIndex, toIndex, size);
        return new SubList(this, 0, fromIndex, toIndex);
    }

    static void subListRangeCheck(int fromIndex, int toIndex, int size) {
        if (fromIndex < 0)
            throw new IndexOutOfBoundsException("fromIndex = " + fromIndex);
        if (toIndex > size)
            throw new IndexOutOfBoundsException("toIndex = " + toIndex);
        if (fromIndex > toIndex)
            throw new IllegalArgumentException("fromIndex(" + fromIndex +
                                               ") > toIndex(" + toIndex + ")");
    }

    private class SubList extends AbstractList<E> implements RandomAccess {
        private final AbstractList<E> parent;
        private final int parentOffset;
        private final int offset;
        int size;

        SubList(AbstractList<E> parent,
                int offset, int fromIndex, int toIndex) {
            this.parent = parent;
            this.parentOffset = fromIndex;
            this.offset = offset + fromIndex;
            this.size = toIndex - fromIndex;
            this.modCount = ArrayList.this.modCount;
        }

        public E set(int index, E e) {
            rangeCheck(index);
            checkForComodification();
            E oldValue = ArrayList.this.elementData(offset + index);
            ArrayList.this.elementData[offset + index] = e;
            return oldValue;
        }

        public E get(int index) {
            rangeCheck(index);
            checkForComodification();
            return ArrayList.this.elementData(offset + index);
        }

        public int size() {
            checkForComodification();
            return this.size;
        }

        public void add(int index, E e) {
            rangeCheckForAdd(index);
            checkForComodification();
            parent.add(parentOffset + index, e);
            this.modCount = parent.modCount;
            this.size++;
        }

        public E remove(int index) {
            rangeCheck(index);
            checkForComodification();
            E result = parent.remove(parentOffset + index);
            this.modCount = parent.modCount;
            this.size--;
            return result;
        }

        protected void removeRange(int fromIndex, int toIndex) {
            checkForComodification();
            parent.removeRange(parentOffset + fromIndex,
                               parentOffset + toIndex);
            this.modCount = parent.modCount;
            this.size -= toIndex - fromIndex;
        }

        public boolean addAll(Collection<? extends E> c) {
            return addAll(this.size, c);
        }

        public boolean addAll(int index, Collection<? extends E> c) {
            rangeCheckForAdd(index);
            int cSize = c.size();
            if (cSize==0)
                return false;

            checkForComodification();
            parent.addAll(parentOffset + index, c);
            this.modCount = parent.modCount;
            this.size += cSize;
            return true;
        }

        public Iterator<E> iterator() {
            return listIterator();
        }

        public ListIterator<E> listIterator(final int index) {
            checkForComodification();
            rangeCheckForAdd(index);
            final int offset = this.offset;

            return new ListIterator<E>() {
                int cursor = index;
                int lastRet = -1;
                int expectedModCount = ArrayList.this.modCount;

                public boolean hasNext() {
                    return cursor != SubList.this.size;
                }

                @SuppressWarnings("unchecked")
                public E next() {
                    checkForComodification();
                    int i = cursor;
                    if (i >= SubList.this.size)
                        throw new NoSuchElementException();
                    Object[] elementData = ArrayList.this.elementData;
                    if (offset + i >= elementData.length)
                        throw new ConcurrentModificationException();
                    cursor = i + 1;
                    return (E) elementData[offset + (lastRet = i)];
                }

                public boolean hasPrevious() {
                    return cursor != 0;
                }

                @SuppressWarnings("unchecked")
                public E previous() {
                    checkForComodification();
                    int i = cursor - 1;
                    if (i < 0)
                        throw new NoSuchElementException();
                    Object[] elementData = ArrayList.this.elementData;
                    if (offset + i >= elementData.length)
                        throw new ConcurrentModificationException();
                    cursor = i;
                    return (E) elementData[offset + (lastRet = i)];
                }

                public int nextIndex() {
                    return cursor;
                }

                public int previousIndex() {
                    return cursor - 1;
                }

                public void remove() {
                    if (lastRet < 0)
                        throw new IllegalStateException();
                    checkForComodification();

                    try {
                        SubList.this.remove(lastRet);
                        cursor = lastRet;
                        lastRet = -1;
                        expectedModCount = ArrayList.this.modCount;
                    } catch (IndexOutOfBoundsException ex) {
                        throw new ConcurrentModificationException();
                    }
                }

                public void set(E e) {
                    if (lastRet < 0)
                        throw new IllegalStateException();
                    checkForComodification();

                    try {
                        ArrayList.this.set(offset + lastRet, e);
                    } catch (IndexOutOfBoundsException ex) {
                        throw new ConcurrentModificationException();
                    }
                }

                public void add(E e) {
                    checkForComodification();

                    try {
                        int i = cursor;
                        SubList.this.add(i, e);
                        cursor = i + 1;
                        lastRet = -1;
                        expectedModCount = ArrayList.this.modCount;
                    } catch (IndexOutOfBoundsException ex) {
                        throw new ConcurrentModificationException();
                    }
                }

                final void checkForComodification() {
                    if (expectedModCount != ArrayList.this.modCount)
                        throw new ConcurrentModificationException();
                }
            };
        }

        public List<E> subList(int fromIndex, int toIndex) {
            subListRangeCheck(fromIndex, toIndex, size);
            return new SubList(this, offset, fromIndex, toIndex);
        }

        private void rangeCheck(int index) {
            if (index < 0 || index >= this.size)
                throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
        }

        private void rangeCheckForAdd(int index) {
            if (index < 0 || index > this.size)
                throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
        }

        private String outOfBoundsMsg(int index) {
            return "Index: "+index+", Size: "+this.size;
        }

        private void checkForComodification() {
            if (ArrayList.this.modCount != this.modCount)
                throw new ConcurrentModificationException();
        }
    }
}
```
