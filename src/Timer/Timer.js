class Timer {
    interval = setInterval(() => this.run(), 30);
    head = null;

    run(){
        if (this.head) {
            const TIME = Date.now();
            while (this.head.time <= TIME) {
                this.head.call();
                this.head = this.head.next;
            }
        }
    }

    subscribe(time, func) {
        if (time && func instanceof Function) {
            const newTask = {
                time,
                call: func
            }
            let prev = this.head;
            if (prev) {
                let next = prev.next;
                while (next && prev.time <= time) {
                    prev = next;
                    next = next.next;
                }
                if (prev.time > time && prev.prev) {
                    prev = prev.prev;
                    next = prev.next;
                }
                if (next) {
                    next = prev.next;
                    next.prev = newTask;
                    newTask.next = next;
                }

                prev.next = newTask;
                newTask.prev = prev;
            }
            else this.head = newTask;
        }
    }


}