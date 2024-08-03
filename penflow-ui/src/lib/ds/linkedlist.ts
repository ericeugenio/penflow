
export class Node<T> {
    key: string;
    value: T;
    next: Node<T> | null;
    prev: Node<T> | null;

    constructor(key: string, value: T) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

export class LinkedList<T> {
    head: Node<T> | null;

    constructor(head: Node<T> | null = null) {
        this.head = head
    }

    isEmpty(): boolean {
        return this.head === null;
    }

    search(key: string): Node<T> | null {
        let current = this.head;
        while (current != null && current.key !== key) {
            current = current.next;
        }
        return current;
    }

    prepend(newNode: Node<T>) {
        newNode.next = this.head;
        if (this.head != null) {
            this.head.prev = newNode;
        }
        this.head = newNode;
    }

    insert(node: Node<T>, newNode: Node<T>) {
        newNode.next = node.next;
        newNode.prev = node;
        if (node.next != null) {
            node.next.prev = newNode;
        }
        node.next = newNode;
    }

    swap(nodeA: Node<T>, nodeB: Node<T>) {
        const tmpKey: string = nodeA.key;
        const tmpValue: T = nodeA.value;
        nodeA.key = nodeB.key;
        nodeA.value = nodeB.value;
        nodeB.key = tmpKey;
        nodeB.value = tmpValue;
    }

    delete(node: Node<T>) {
        if (node.prev != null) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }
        if (node.next != null) {
            node.next.prev = node.prev;
        }
    }
}