---
layout: post
title: "LinkedList源码解析"
date: 2018-01-12
tag: "Java"
detail: LinkedList 是一个继承于AbstractSequentialList的双向链表。它也可以被当作堆栈、队列或双端队列进行操作，是List和Deque接口的双向链表的实现，实现了所有可选列表操作，并允许包括null值，其顺序访问非常高效，而随机访问效率比较低。
img: 

---

* content
{:toc}


	
## LinkedList 

LinkedList 是一个继承于AbstractSequentialList的双向链表。它也可以被当作堆栈、队列或双端队列进行操作。

LinkedList 是List和Deque接口的双向链表的实现。实现了所有可选列表操作，并允许包括null值。

LinkedList 其顺序访问非常高效，而随机访问效率比较低。

LinkedList 实现了Cloneable接口，即覆盖了函数clone()，能克隆。

LinkedList 实现java.io.Serializable接口，这意味着LinkedList支持序列化，能通过序列化去传输。

LinkedList 是非同步的。

如果多个线程同时访问一个LinkedList实例，而其中至少一个线程从结构上修改了列表，那么它必须保持外部同步。这通常是通过同步那些用来封装列表的 对象来实现的。但如果没有这样的对象存在，则该列表需要运用{@link Collections#synchronizedList Collections.synchronizedList}来进行“包装”，该方法最好是在创建列表对象时完成，为了避免对列表进行突发的非同步操作。

`List list = Collections.synchronizedList(new LinkedList(...));`

使用synchronizedList在迭代的时候，需要开发者自己加上线程锁控制代码，因为在整个迭代的过程中如果在循环外面不加同步代码，在一次次迭代之间，其他线程对于这个容器的add或者remove会影响整个迭代的预期效果，所以这里需要用户在整个循环外面加上synchronized(list);

类中的iterator()方法和listIterator()方法返回的iterators迭代器是fail-fast的：当某一个线程A通过iterator去遍历某集合的过程中，若该集合的内容被其他线程所改变了；那么线程A访问集合时，就会抛出ConcurrentModificationException异常，产生fail-fast事件。


![LinkedList关系图](https://images0.cnblogs.com/blog/497634/201401/272345393446232.jpg)

[图片地址：https://images0.cnblogs.com/blog/497634/201401/272345393446232.jpg](https://images0.cnblogs.com/blog/497634/201401/272345393446232.jpg)

```
public class LinkedList<E>
        extends AbstractSequentialList<E>
        implements List<E>, Deque<E>, Cloneable, java.io.Serializable
{
    // 
    transient int size = 0;

    // 首节点  
    transient Node<E> first;

    // 尾节点  
    transient Node<E> last;

      
    public LinkedList() {
    }

      
    public LinkedList(Collection<? extends E> c) {
        this();
        addAll(c);
    }

    // 使用参数作为首节点  
    private void linkFirst(E e) {
        final Node<E> f = first; // 获取当前首节点
        final Node<E> newNode = new Node<>(null, e, f); // 使用参数创建节点，next指向f即原首节点
        first = newNode; // 设置首节点
        if (f == null) // 维护双向链表
            last = newNode;
        else
            f.prev = newNode;
        size++; // 维护链表大小
        modCount++;// 记录被改动次数
    }

      
    void linkLast(E e) {
        final Node<E> l = last;
        final Node<E> newNode = new Node<>(l, e, null);
        last = newNode;
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        size++;
        modCount++;
    }

    // 将参数e插入节点succ前面  
    void linkBefore(E e, Node<E> succ) {
        // assert succ != null;
        final Node<E> pred = succ.prev;// 获取succ的prev节点
        final Node<E> newNode = new Node<>(pred, e, succ);// 使用参数新建节点，并把prev指向pred，next指向succ
        succ.prev = newNode;
        if (pred == null) 
            first = newNode;
        else
            pred.next = newNode;
        size++;
        modCount++;
    }

     //删除首节点并返回删除前首节点的值，内部使用  
    private E unlinkFirst(Node<E> f) {
        // assert f == first && f != null;
        final E element = f.item;
        final Node<E> next = f.next;
        f.item = null;
        f.next = null; // help GC
        first = next;
        if (next == null)
            last = null;
        else
            next.prev = null;
        size--;
        modCount++;
        return element;
    }

    //删除尾节点并返回删除前尾节点的值，内部使用  
    private E unlinkLast(Node<E> l) {
        // assert l == last && l != null;
        final E element = l.item;
        final Node<E> prev = l.prev;
        l.item = null;
        l.prev = null; // help GC
        last = prev;
        if (prev == null)
            first = null;
        else
            prev.next = null;
        size--;
        modCount++;
        return element;
    }

    //删除指定节点并返回被删除的元素值  
    E unlink(Node<E> x) {
        // assert x != null;
        final E element = x.item;
        final Node<E> next = x.next;
        final Node<E> prev = x.prev;

        if (prev == null) {
            first = next;
        } else {
            prev.next = next;
            x.prev = null;
        }

        if (next == null) {
            last = prev;
        } else {
            next.prev = prev;
            x.next = null;
        }

        x.item = null;
        size--;
        modCount++;
        return element;
    }

      
    public E getFirst() {
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return f.item;
    }

      
    public E getLast() {
        final Node<E> l = last;
        if (l == null)
            throw new NoSuchElementException();
        return l.item;
    }

      
    public E removeFirst() {
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return unlinkFirst(f);
    }

      
    public E removeLast() {
        final Node<E> l = last;
        if (l == null)
            throw new NoSuchElementException();
        return unlinkLast(l);
    }

      
    public void addFirst(E e) {
        linkFirst(e);
    }

      
    public void addLast(E e) {
        linkLast(e);
    }

      
    public boolean contains(Object o) {
        return indexOf(o) != -1;
    }

      
    public int size() {
        return size;
    }

      
    public boolean add(E e) {
        linkLast(e);
        return true;
    }

    // 删除指定元素  
    public boolean remove(Object o) {// 遍历删除
        if (o == null) {
            for (Node<E> x = first; x != null; x = x.next) {
                if (x.item == null) {
                    unlink(x);
                    return true;
                }
            }
        } else {
            for (Node<E> x = first; x != null; x = x.next) {
                if (o.equals(x.item)) {
                    unlink(x);
                    return true;
                }
            }
        }
        return false;
    }

      
    public boolean addAll(Collection<? extends E> c) {
        return addAll(size, c);
    }

    // 从index处开始添加集合  
    public boolean addAll(int index, Collection<? extends E> c) {
        checkPositionIndex(index);

        Object[] a = c.toArray();
        int numNew = a.length;
        if (numNew == 0)
            return false;// c为空返回false

        Node<E> pred, succ; // 声明两个变量，pred是记录index之前的一个节点，succ是记录index位置的节点。
        if (index == size) {
            succ = null;
            pred = last;
        } else { 
            succ = node(index);
            pred = succ.prev;
        }
        // 遍历集合，将集合中的元素一个一个的添加到pred节点后面
        for (Object o : a) {
            @SuppressWarnings("unchecked") E e = (E) o;
            Node<E> newNode = new Node<>(pred, e, null);
            if (pred == null)
                first = newNode;
            else
                pred.next = newNode;
            pred = newNode;
        }
        // 加上succ节点，如果succ节点为空，则刷新last节点，否则直接添加succ即可
        if (succ == null) {
            last = pred;
        } else {
            pred.next = succ;
            succ.prev = pred;
        }

        size += numNew;
        modCount++;
        return true;
    }

      
    public void clear() {
        // Clearing all of the links between nodes is "unnecessary", but:
        // - helps a generational GC if the discarded nodes inhabit
        //   more than one generation
        // - is sure to free memory even if there is a reachable Iterator
        for (Node<E> x = first; x != null; ) {
            Node<E> next = x.next;
            x.item = null;
            x.next = null;
            x.prev = null;
            x = next;
        }
        first = last = null;
        size = 0;
        modCount++;
    }
  
    public E get(int index) {
        checkElementIndex(index);
        return node(index).item;
    }

      
    public E set(int index, E element) {
        checkElementIndex(index);
        Node<E> x = node(index);
        E oldVal = x.item;
        x.item = element;
        return oldVal;
    }

      
    public void add(int index, E element) {
        checkPositionIndex(index);

        if (index == size)
            linkLast(element);
        else
            linkBefore(element, node(index));
    }

      
    public E remove(int index) {
        checkElementIndex(index);
        return unlink(node(index));
    }

      
    private boolean isElementIndex(int index) {
        return index >= 0 && index < size;
    }

      
    private boolean isPositionIndex(int index) {
        return index >= 0 && index <= size;
    }

      
    private String outOfBoundsMsg(int index) {
        return "Index: "+index+", Size: "+size;
    }

    private void checkElementIndex(int index) {
        if (!isElementIndex(index))
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    private void checkPositionIndex(int index) {
        if (!isPositionIndex(index))
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    // 返回链表index位置的Node节点， 
    Node<E> node(int index) {
        // assert isElementIndex(index);

        if (index < (size >> 1)) { // 二分遍历
            Node<E> x = first;
            for (int i = 0; i < index; i++)
                x = x.next;
            return x;
        } else {
            Node<E> x = last;
            for (int i = size - 1; i > index; i--)
                x = x.prev;
            return x;
        }
    }

    public int indexOf(Object o) {
        int index = 0;
        if (o == null) {
            for (Node<E> x = first; x != null; x = x.next) {
                if (x.item == null)
                    return index;
                index++;
            }
        } else {
            for (Node<E> x = first; x != null; x = x.next) {
                if (o.equals(x.item))
                    return index;
                index++;
            }
        }
        return -1;
    }

      
    public int lastIndexOf(Object o) {
        int index = size;
        if (o == null) {
            for (Node<E> x = last; x != null; x = x.prev) {
                index--;
                if (x.item == null)
                    return index;
            }
        } else {
            for (Node<E> x = last; x != null; x = x.prev) {
                index--;
                if (o.equals(x.item))
                    return index;
            }
        }
        return -1;
    }

    //提供普通队列和双向队列的功能，当然，也可以实现栈，FIFO，FILO
    //出队（从前端），获得第一个元素，不存在会返回null，不会删除元素（节点）
    public E peek() {
        final Node<E> f = first;
        return (f == null) ? null : f.item;
    }

    //出队（从前端），不删除元素，若为null会抛出异常而不是返回null   
    public E element() {
        return getFirst();
    }

    //出队（从前端），如果不存在会返回null，存在的话会返回值并移除这个元素（节点）  
    public E poll() {
        final Node<E> f = first;
        return (f == null) ? null : unlinkFirst(f);
    }

    //出队（从前端），如果不存在会抛出异常而不是返回null，存在的话会返回值并移除这个元素（节点）  
    public E remove() {
        return removeFirst();
    }

    //入队（从后端），始终返回true  
    public boolean offer(E e) {
        return add(e);
    }

    // Deque operations
    //入队（从前端），始终返回true  
    public boolean offerFirst(E e) {
        addFirst(e);
        return true;
    }

    //入队（从后端），始终返回true  
    public boolean offerLast(E e) {
        addLast(e);
        return true;
    }

    //出队（从前端），获得第一个元素，不存在会返回null，不会删除元素（节点）  
    public E peekFirst() {
        final Node<E> f = first;
        return (f == null) ? null : f.item;
    }

    //出队（从后端），获得最后一个元素，不存在会返回null，不会删除元素（节点）  
    public E peekLast() {
        final Node<E> l = last;
        return (l == null) ? null : l.item;
    }

    //出队（从前端），获得第一个元素，不存在会返回null，会删除元素（节点）  
    public E pollFirst() {
        final Node<E> f = first;
        return (f == null) ? null : unlinkFirst(f);
    }

    //出队（从后端），获得最后一个元素，不存在会返回null，会删除元素（节点）
    public E pollLast() {
        final Node<E> l = last;
        return (l == null) ? null : unlinkLast(l);
    }

    //入栈，从前面添加  
    public void push(E e) {
        addFirst(e);
    }

    //出栈，返回栈顶元素，从前面移除（会删除）  
    public E pop() {
        return removeFirst();
    }

    // 方法删除指定元素第一次出现在该列表中(遍历从头部到尾部列表时)。如果列表中不包含该元素，它是不变的。  
    public boolean removeFirstOccurrence(Object o) {
        return remove(o);
    }

    // 方法删除指定元素第一次出现在该列表中(遍历从尾部到头部列表时)。如果列表中不包含该元素，它是不变的。  
    public boolean removeLastOccurrence(Object o) {
        if (o == null) {
            for (Node<E> x = last; x != null; x = x.prev) {
                if (x.item == null) {
                    unlink(x);
                    return true;
                }
            }
        } else {
            for (Node<E> x = last; x != null; x = x.prev) {
                if (o.equals(x.item)) {
                    unlink(x);
                    return true;
                }
            }
        }
        return false;
    }

    // 返回迭代器  
    public ListIterator<E> listIterator(int index) {
        checkPositionIndex(index);
        return new ListItr(index);
    }

    // 迭代器的类 关于ListIterator 和 Iterator的区别可以访问 http://zhongyp.me/2018/01/12/listirerator/
    private class ListItr implements ListIterator<E> {
        private Node<E> lastReturned = null;
        private Node<E> next;
        private int nextIndex;
        private int expectedModCount = modCount;

        ListItr(int index) {
            // assert isPositionIndex(index);
            next = (index == size) ? null : node(index);
            nextIndex = index;
        }

        public boolean hasNext() {
            return nextIndex < size;
        }

        public E next() {
            checkForComodification();
            if (!hasNext())
                throw new NoSuchElementException();

            lastReturned = next;
            next = next.next;
            nextIndex++;
            return lastReturned.item;
        }

        public boolean hasPrevious() {
            return nextIndex > 0;
        }

        public E previous() {
            checkForComodification();
            if (!hasPrevious())
                throw new NoSuchElementException();

            lastReturned = next = (next == null) ? last : next.prev;
            nextIndex--;
            return lastReturned.item;
        }

        public int nextIndex() {
            return nextIndex;
        }

        public int previousIndex() {
            return nextIndex - 1;
        }

        public void remove() {
            checkForComodification();
            if (lastReturned == null)
                throw new IllegalStateException();

            Node<E> lastNext = lastReturned.next;
            unlink(lastReturned);
            if (next == lastReturned)
                next = lastNext;
            else
                nextIndex--;
            lastReturned = null;
            expectedModCount++;
        }

        public void set(E e) {
            if (lastReturned == null)
                throw new IllegalStateException();
            checkForComodification();
            lastReturned.item = e;
        }

        public void add(E e) {
            checkForComodification();
            lastReturned = null;
            if (next == null)
                linkLast(e);
            else
                linkBefore(e, next);
            nextIndex++;
            expectedModCount++;
        }

        final void checkForComodification() {
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }
    }

    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }

    // 方法返回一个迭代器在此双端队列以逆向顺序的元素  
    public Iterator<E> descendingIterator() {
        return new DescendingIterator();
    }

      
    private class DescendingIterator implements Iterator<E> {
        private final ListItr itr = new ListItr(size());
        public boolean hasNext() {
            return itr.hasPrevious();
        }
        public E next() {
            return itr.previous();
        }
        public void remove() {
            itr.remove();
        }
    }


    // LinkedList的 Clone方法只是简单的将原来每个 node的 item放到克隆后的对象中，和 ArrayList的 clone方法一样， LinkedList的 Clone方法也只是浅复制，如果元素为引用类型，那么修改原 list的值会影响克隆的 list的值。
    @SuppressWarnings("unchecked")
    private LinkedList<E> superClone() {
        try {
            return (LinkedList<E>) super.clone();// 调用底层c++ 获取克隆对象
        } catch (CloneNotSupportedException e) {
            throw new InternalError();
        }
    }

      
    public Object clone() {
        LinkedList<E> clone = superClone();

        // Put clone into "virgin" state
        clone.first = clone.last = null;
        clone.size = 0;
        clone.modCount = 0;

        // Initialize clone with our elements
        for (Node<E> x = first; x != null; x = x.next)
            clone.add(x.item);

        return clone;
    }

      
    public Object[] toArray() {
        Object[] result = new Object[size];
        int i = 0;
        for (Node<E> x = first; x != null; x = x.next)
            result[i++] = x.item;
        return result;
    }

      
    @SuppressWarnings("unchecked")
    public <T> T[] toArray(T[] a) {
        if (a.length < size)
            a = (T[])java.lang.reflect.Array.newInstance(
                    a.getClass().getComponentType(), size);
        int i = 0;
        Object[] result = a;
        for (Node<E> x = first; x != null; x = x.next)
            result[i++] = x.item;

        if (a.length > size)
            a[size] = null;

        return a;
    }


    /**
     * 序列化
     */
    private static final long serialVersionUID = 876323262645176354L;

      
    private void writeObject(java.io.ObjectOutputStream s)
            throws java.io.IOException {
        // Write out any hidden serialization magic
        s.defaultWriteObject();

        // Write out size
        s.writeInt(size);

        // Write out all elements in the proper order.
        for (Node<E> x = first; x != null; x = x.next)
            s.writeObject(x.item);
    }

      
    @SuppressWarnings("unchecked")
    private void readObject(java.io.ObjectInputStream s)
            throws java.io.IOException, ClassNotFoundException {
        // Read in any hidden serialization magic
        s.defaultReadObject();

        // Read in size
        int size = s.readInt();

        // Read in all elements in the proper order.
        for (int i = 0; i < size; i++)
            linkLast((E)s.readObject());
    }
}



```
