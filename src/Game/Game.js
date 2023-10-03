function Game() {
    const timer = new Timer;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    document.body.insertBefore(canvas,null);

    const button = document.createElement('button');
    button.className = 'button';
    button.innerHTML = 'Умение';
    document.body.insertBefore(button,null);

    const scene = new GameScene(canvas,10,10);

    scene.render();

    button.onclick = () => {
        scene.skill();
    }

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
        this.saint = false;
    }

    render(canvas,x,y) {
        canvas.beginPath();
        canvas.arc(x * 50 + 25, y * 50 + 25, 23 , 0, 2 * Math.PI, false);
        canvas.fillStyle = this.color;
        canvas.fill();
        canvas.lineWidth = (this.saint) ? 4 : 2;
        canvas.strokeStyle = (this.saint) ? '#1144ff' : '#003300';
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
        is: false,
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
        this.context = this.canvas.getContext("2d");

        this.energy = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        }

        this.turnNumber = 0;

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
            this.turn(this.drag.start.x, this.drag.start.y, x,y);
            if (this.drag.is);
            this.drag.crystal = null;
            this.render();
        }

        

        let result = 1;
        while (result != 0){
            result = 0;
            this.new();
            //this.map.forEach(crystals => crystals.forEach(crystal => /*result += this.kill(crystal)*/));
        }

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
        this.map.forEach(items => items.forEach(item => item.item = new Crystal(Math.trunc(Math.random() * 5 - 0.1) + 1) ));
        const x = Math.trunc(Math.random()*this.width);
        const y = Math.trunc(Math.random()*this.height);
        console.log(this.map[y][x]);
        this.map[y][x].saint = true;
        this.render();
    }

    turn(x1,y1,x2,y2){
        const dx = Math.abs(x1-x2);
        const dy = Math.abs(y1-y2);
            if ( (dx > 0 && dx <= 1 && dy == 0) || (dy>0 && dy <= 1 && dx == 0)){
                this.swap(x1,y1,x2,y2);
                this.turnNumber +=1;
                if (this.turnNumber === 3) this.gravity();
                return true;
            }
        return false;
    }

    next(turn, x,y,dx,dy, power){
        const crystal = this.map[y][x].item;
        if (crystal && y+dy >= 0 && y+dy < this.width && x+dx >= 0 && x+dx < this.height)
            if (this.map[y+dy][x+dx].item)
                if (this.map[y+dy][x+dx].item.power === power) {
                    turn.push(this.map[y+dy][x+dx]);
                    return this.next(turn, x + dx, y + dy, dx, dy, power);
                };
        return turn;
    }

    check(x,y){
        const crystal = this.map[y][x];
        if (this.map[y][x].item) {
            const bot = this.next([],x,y,0,1, crystal.item.power);
            const top = this.next([],x,y,0,-1, crystal.item.power);
            const left = this.next([],x,y,1,0,crystal.item.power)
            const right = this.next([],x,y,-1,0,crystal.item.power)
            const power = crystal.item.power;
            const vertical = [crystal];
            const horizontal = [crystal];
            vertical.push(...bot,...top);
            horizontal.push(...left,...right);
            console.log(vertical);
            if (vertical.length >= 3) {
                console.log(power);
                vertical.forEach(place => this.kill(place));
            }
            if (horizontal.length >= 3) {
                console.log(power);
                horizontal.forEach(place => this.kill(place));
            }
            
        }

        /*const horizontal = 1 + this.next([],x,y,1,0).length + .length;
        if (vertical >= 3 || horizontal >= 3) console.log("GREAT!!!");
        return;*/
        return;
    }

    swap(x1,y1,x2,y2) {
        const current = this.map[y1][x1].item;
        this.setCrystal(x1,y1, this.map[y2][x2].item);
        this.setCrystal(x2,y2, current);
        this.check(x1,y1);
        this.check(x2,y2);
        this.gravity();
        
    }

    setCrystal(x,y,crystal){
        this.map[y][x].item = crystal;
    }


    /*kill(crystal){
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

    }*/

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

    gravity(){
        this.map.forEach((crystals,y) => crystals.forEach((crystal,x) => {
            if (crystal.item) {
                if (y+1<this.height){
                    if (!this.map[y+1][x].item) {
                        this.swap(x,y,x,y+1);
                    }
                }
            }
        }))
        this.render();
    }

    select(x,y){
        this.drag.is = true;
        this.drag.crystal = this.map[y][x].item;
        this.drag.start.x = x;
        this.drag.start.y = y;
    }

    dragging(x,y){
    }

    kill(place){
        place.item = null;
    }

    render(){
        this.context.fillStyle = "white";
        this.context.fillRect(0,0,600,600);
        this.map.forEach((crystals, y) => crystals.forEach ((crystal, x) => {
            if (crystal?.item) crystal.item.render(this.context,x,y)}));
    }

    skill(){
        this.map[this.height-1].forEach(crystal => crystal.item = null);
        this.gravity();
    }
}