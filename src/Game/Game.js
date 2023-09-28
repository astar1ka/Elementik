function Game() {
    const timer = new Timer;

    const canvas = document.createElement('canvas',);
    canvas.width = 600;
    canvas.height = 600;
    document.body.insertBefore(canvas,null);

    const scene = new GameScene(canvas,10,10);

    scene.render();

    function update() {
        check();
        timer.subscribe(Date.now() + 30, () => update())
    }

    timer.subscribe(Date.now(), () => {
        update();
    });

    function check(){

    }

}

class Crystal {
    constructor(power) {
        this.power = power;
        if (this.power == 1) this.color = "red";
        if (this.power == 2) this.color = "blue";
        if (this.power == 3) this.color = "green";
        if (this.power == 4) this.color = "brown";
        if (this.power == 5) this.color = "orange";
        this.active = true;
    }

    render(canvas,x,y) {
        canvas.beginPath();
        canvas.arc(x * 50 + 25, y * 50 + 25, 23 , 0, 2 * Math.PI, false);
        canvas.fillStyle = this.color;
        canvas.fill();
        canvas.lineWidth = 2;
        canvas.strokeStyle = '#003300';
        canvas.stroke();
    }

    destroy(){
        this.color = "black";
        this.power = 0;
        this.active = false;
    }
}

class GameScene{
    drag = {
        start: {
            x: 0,
            y: 0
        },
        crystal: null
    }

    constructor(canvas, w, h){

        this.width = w;
        this.height = h;
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d")

        this.energy = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        }

        this.enemy = {
            energy: 0,
            power: 1
        }

        this.map = this.createMap();

        this.canvas.onmousedown = (event) => {
            const x = Math.trunc(event.x/50);
            const y = Math.trunc(event.y/50);
            this.select(x,y);
        };

        this.canvas.onmousemove = (event) => {
            if (this.drag.crystal){
                this.dragging(event.x/50,event.y/50)
            }
        }

        this.canvas.onmouseup = (event) => {
            const x = Math.trunc(event.x/50);
            const y = Math.trunc(event.y/50);
            if (!this.turn(this.drag.start.x, this.drag.start.y, x,y) && this.drag.crystal) this.drag.crystal.setXY(this.drag.start.x, this.drag.start.y);
            this.drag.crystal = null;
            this.render();
        }

        this.map.forEach(items => items.forEach(item => item.item = new Crystal(Math.trunc(Math.random() * 5 - 0.1) + 1) ));

        let result = 1;
        while (result != 0){
            result = 0;
            this.new();
            this.map.forEach(crystals => crystals.forEach(crystal => result += this.kill(crystal)));
        }
        setInterval(() => {this.map[9].forEach((crystal, x) => {
            if (crystal) {
                this.enemy.energy ++;
                if(crystal.power === this.enemy.power) this.enemy.energy++;
            }
            this.map[9][x] = null
        }); this.gravity()}, 3000);

        this.energy = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        }
    }

    createMap(){
        const result = [];
        for (let y = 0; y < this.height; y++){
            result.push([]);
            for (let x = 0; x< this.width; x++)
                result[y].push({
                    item: null
                })
        }

        return result;
    }

    new(){
        this.map.forEach(crystals => crystals.forEach(crystal => {if (!crystal) this.map[y][x] = new Crystal(Math.trunc(Math.random() * 5 - 0.1) + 1)}));
        this.render();
    }

    turn(x1,y1,x2,y2){
        const dx = Math.abs(x1-x2);
        const dy = Math.abs(y1-y2);
            if ( (dx > 0 && dx <= 1 && dy == 0) || (dy>0 && dy <= 1 && dx == 0)){
                this.swap(x1,y1,x2,y2);
                return true;
            }
        return false;
    }

    check(x,y){
        const crystal = this.map[y][x].item;
        console.log(crystal);

    }

    swap(x1,y1,x2,y2) {
        const current = this.map[y1][x1].item;
        this.setCrystal(x1,y1, this.map[y2][x2].item);
        this.setCrystal(x2,y2, current)
    }

    setCrystal(x,y,crystal){
        this.map[y][x].item = crystal;
        this.check(x,y);
    }


    kill(crystal){
        if (crystal) {
            const near = {
                top: [...this.next(crystal, { x: 0, y: -1})],
                bot: [...this.next(crystal, { x: 0, y: 1})],
                left: [...this.next(crystal, { x: -1, y: 0})],
                right: [...this.next(crystal, { x: 1, y: 0})]
            };
    
            const vertical = [crystal, ...near.top, ...near.bot];
            const horizontal = [crystal, ...near.left, ...near.right];
    
            let result = 0;
            if (vertical.length > 2) {
                vertical.forEach(crystal => {if (crystal) this.map[crystal.y][crystal.x].item.destroy()});
                result += vertical.length;
            }
            if (horizontal.length > 2) {
                horizontal.forEach(crystal => {if (crystal) this.map[crystal.y][crystal.x].item.destroy()});
                result += horizontal.length;
            }
            if (result != 0){
                this.energy[crystal.power] += result;
                this.gravity();
                this.status();
            }

            return result; 
        }

    }

    status(){
        //console.clear();
        console.log('---STATUS---');
        console.log('fire:',this.energy[1]);
        console.log('water:',this.energy[2]);
        console.log('forest:',this.energy[3]);
        console.log('ground:',this.energy[4]);
        console.log('sun:',this.energy[5]);
        console.log('enemy: ', this.enemy.energy);
    }

    next(crystal, step){
        if (crystal && crystal.power != 0) {
            const x = crystal.x + step.x;
            const y = crystal.y + step.y
            if (x >= 0 && y >= 0 && x < 10 && y < 10){
                const next = this.map[y][x];
                if (next && next.power == crystal.power) {
                    const result = [next]
                    result.push(...this.next(next, step));
                    return result;
                }
            }
        }
        return [];
    }

    down(crystal){
        if (crystal && crystal.y < 9) {
            const down = this.map[crystal.y + 1][crystal.x - 0];
            if (!down) {
                this.turn(crystal.x, crystal.y, crystal.x ,crystal.y + 1);
                return true;
            }
        }
        return false;
    }

    gravity(){
        /*let result = true;
        while (result) {
            result = false;
            this.map.forEach(crystals => crystals.forEach(crystal => {if (this.down(crystal.item)) result = true}));
        }
        this.new();
        let resultKill = 1;
        while (resultKill != 0){
            resultKill = 0;
            this.new();
            this.map.forEach(crystals => crystals.forEach(crystal => resultKill += this.kill(crystal.item)));
        }*/
    }

    select(x,y){
        this.drag.crystal = this.map[y][x].item;
        this.drag.start.x = x;
        this.drag.start.y = y;
    }

    dragging(x,y){
    }

    render(){
        this.context.fillStyle = "white";
        this.context.fillRect(0,0,600,600);
        this.map.forEach((crystals, y) => crystals.forEach ((crystal, x) => {
            if (crystal) crystal.item.render(this.context,x,y)}));
    }
}