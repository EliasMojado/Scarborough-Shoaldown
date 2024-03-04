export class Player{
    constructor(name){
        this.name = name;
        this.boats = [];
        this.oil = 5;
    }
}

export class Boat{
    constructor(name, side, x, y){
        this.x = x;
        this.y = y;
        this.name = name;
        this.health = 0;
        this.damage = 0;
        this.speed = 0;
        this.maxhealth = 0;
        this.side = side;
        this.imgPath = '';
        this.action = false;
        this.range = 0;
        this.count = 0;
        this.visible = true;

        if(name === "oiler"){
            this.health = 10;
            this.maxhealth = 10;
            this.damage = 0;
            this.speed = 1;
            this.range = 0;
            if(side === "human"){
                this.imgPath = "/assets/Oiler Green.png";
                // this.imgPath = "/assets/scaleddown.png";
            }else{
                this.imgPath = "/assets/Oiler Red.png";
            }
        }else if(name === "coast_guard"){
            this.health = 4;
            this.maxhealth = 4;
            this.damage = 2;
            this.speed = 3;
            this.range = 2;
            if(side === "human"){
                this.imgPath = "/assets/Coast Green.png";
            }else{
                this.imgPath = "/assets/Coast Red.png";
            }
        }else if(name === "speed_boat"){
            this.health = 3;
            this.maxhealth = 3;
            this.damage = 1;
            this.speed = 4;
            this.range = 1;
            if(side === "human"){
                this.imgPath = "/assets/Speed Green.png";
            }else{
                this.imgPath = "/assets/Speed Red.png";
            }
        }else if(name === "canon_boat"){
            this.health = 3;
            this.maxhealth = 3;
            this.damage = 3;
            this.speed = 2;
            this.range = 3;
            if(side === "human"){
                this.imgPath = "/assets/Cannon_Green.png";
            }else{
                this.imgPath = "/assets/Cannon_Red.png";
            }
        }else if(name === "armored_ship"){
            this.health = 15;
            this.maxhealth = 15;
            this.damage = 1;
            this.speed = 2;
            this.range = 1;
            if(side === "human"){
                this.imgPath = "/assets/Armored Green.png";
            }else{
                this.imgPath = "/assets/Armored Red.png";
            }
        }else if(name === "submarine"){
            this.health = 3;
            this.maxhealth = 3;
            this.damage = 5;
            this.speed = 3;
            this.range = 2;
            this.visible = false;
            if(side === "human"){
                this.imgPath = "/assets/Submarine Green.png";
            }else{
                this.imgPath = "/assets/Submarine Red.png";
            }
        }else if(name === "aircraft_carrier"){
            this.health = 8;
            this.maxhealth = 8;
            this.damage = 6;
            this.speed = 1;
            this.range = 8;
            if(side === "human"){
                this.imgPath = "/assets/Aircraft Green.png";
            }else{
                this.imgPath = "/assets/Aircraft Red.png";
            }
        }
    }
}

export class Tile{
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.visibleToHuman = false;
        this.visibleToComputer = false;
        this.boat = null;
    }
}