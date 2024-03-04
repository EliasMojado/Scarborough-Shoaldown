import { Player, Boat, Tile } from "./entities.js";

console.log("https://youtu.be/xHuh61KNS8E?si=o6CemlDiz92sNCMc");

const canvas = document.getElementById('Scarborough');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingQuality = "high";

const cloud = new Image();
cloud.src = "/assets/top-clouds.png";

const greendot = new Image();
greendot.src = "/assets/greendot.png";

const redarrow = new Image();
redarrow.src = "/assets/redarrow.png";

const redmark = new Image();
redmark.src = "/assets/redmark.png";

const island = new Image();
island.src = "/assets/top-island.png";

const human = new Player("human");
const computer = new Player("computer");
const map = [];
let turn = "human";

document.getElementById("EndTurn").addEventListener("click", endTurn);

const turnText = document.getElementById("turn");
const background = document.body;
const oilText = document.getElementById("oils");

// INITIALIZE THE MAP
for(let i = 0; i < 10; i++){
    map[i] = [];
    for(let j = 0; j < 10; j++){
        map[i][j] = new Tile(i, j, "water");
    }
}

// add the islands
map[2][2].type = "island";
map[2][3].type = "island";
map[3][2].type = "island";

map[7][2].type = "island";
map[7][3].type = "island";
map[6][2].type = "island";

map[2][7].type = "island";
map[2][6].type = "island";
map[3][7].type = "island";

map[7][7].type = "island";
map[7][6].type = "island";
map[6][7].type = "island";

// map[4][4].type = "island";
// map[4][5].type = "island";
// map[5][4].type = "island";
// map[5][5].type = "island";

// Load the map
cloud.onload = function() {
    updateGame();
}

island.onload = function() {
    updateGame();
}

// INITIALIZE THE OILER BOATS
// const humanColumn = Math.floor(Math.random() * 10);
const humanColumn = 5;
human.boats.push(new Boat("oiler", "human", humanColumn, 8));
map[humanColumn][8].boat = human.boats[0];
human.boats[0].action = true;
// make the surrounding tiles visible to the human
for(let i = 7; i <= 9; i++){
    for(let j = humanColumn - 1; j <= humanColumn + 1; j++){
        if(i >= 0 && i < 10 && j >= 0 && j < 10){
            map[j][i].visibleToHuman = true;
        }
    }
}

// const computerColumn = Math.floor(Math.random() * 10);
const computerColumn = 4;
computer.boats.push(new Boat("oiler", "computer", computerColumn, 1));
map[computerColumn][1].boat = computer.boats[0];
computer.boats[0].action = true;
// make the surrounding tiles visible to the computer
for(let i = 0; i <= 2; i++){
    for(let j = computerColumn - 1; j <= computerColumn + 1; j++){
        if(i >= 0 && i < 10 && j >= 0 && j < 10){
            map[j][i].visibleToComputer = true;
        }
    }
}

// GAME LOOP
var selectedBoat = null;
var placingBoat = false;
var spawningBoat = null;

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const i = Math.floor(x / 50);
    const j = Math.floor(y / 50);

    if(turn === "human"){
        if(map[i][j].visibleToHuman){
            
            if(placingBoat){
                if(map[i][j].boat === null && map[i][j].type === "water"){
                    // Check if it is around the oiler
                    if(Math.abs(human.boats[0].x - i) <= 1 && Math.abs(human.boats[0].y - j) <= 1){
                        let newBoat = new Boat(spawningBoat, "human", i, j);
                        human.boats.push(newBoat);
                        map[i][j].boat = newBoat;

                        // update fog of war
                        for(let i = newBoat.y - 1; i <= newBoat.y + 1; i++){
                            for(let j = newBoat.x - 1; j <= newBoat.x + 1; j++){
                                if(i >= 0 && i < 10 && j >= 0 && j < 10){
                                    map[j][i].visibleToHuman = true;
                                }
                            }
                        }
                    }
                    
                    human.boats[0].action = false;
                    placingBoat = false;
                    spawningBoat = null;
                    selectedBoat = null;
                    updateMap();
                }else{
                    alert("Invalid placement");
                }
            }else if(map[i][j].boat !== null && map[i][j].boat.side === "human"){
                // Player select the boat
                if(map[i][j].boat.action === true){
                    selectedBoat = map[i][j].boat;
                    markSurrondingTiles(i, j);
                }
            }else if (map[i][j].boat === null && selectedBoat !== null && selectedBoat.action === true && map[i][j].type === "water"){
                // Player move the boat

                if(Math.abs(selectedBoat.x - i) <= selectedBoat.speed && Math.abs(selectedBoat.y - j) <= selectedBoat.speed){
                    map[selectedBoat.x][selectedBoat.y].boat = null;
                    selectedBoat.x = i;
                    selectedBoat.y = j;
                    map[i][j].boat = selectedBoat;
                    selectedBoat.action = false;
                    

                    // update fog of war
                    for(let i = selectedBoat.y - 1; i <= selectedBoat.y + 1; i++){
                        for(let j = selectedBoat.x - 1; j <= selectedBoat.x + 1; j++){
                            if(i >= 0 && i < 10 && j >= 0 && j < 10){
                                map[j][i].visibleToHuman = true;
                            }
                        }
                    }
                    selectedBoat = null;
                    updateMap();
                }
            }else if (map[i][j].boat !== null && map[i][j].boat.side === "computer" && selectedBoat !== null){
                // Player attack the enemy boat
                if(selectedBoat.name === "aircraft_carrier" && selectedBoat.count % 4 !== 0){
                    // Aircraft carrier cant cast special attack
                    return;
                }

                if(selectedBoat.name === "submarine"){
                    // Reveal the submarine
                    selectedBoat.visible = true;
                }
                
                if(map[i][j].boat.name === "submarine" && map[i][j].boat.visible === false){
                    // Reveal the enemy submarine
                    map[i][j].boat.visible = true;
                    updateMap();
                }else if(Math.abs(selectedBoat.x - i) <= selectedBoat.range && Math.abs(selectedBoat.y - j) <= selectedBoat.range){
                    map[i][j].boat.health -= selectedBoat.damage;
                    if(map[i][j].boat.health <= 0){
                        map[i][j].boat = null;
                        human.boats = human.boats.filter(boat => boat.health > 0);
                    }

                    if(selectedBoat.name === "aircraft_carrier"){
                        selectedBoat.count = 1;
                    }

                    selectedBoat.action = false;
                    selectedBoat = null;
                    updateMap();
                }
            }
        }else{
            placingBoat = false;
            selectedBoat = null;
            updateMap();
        }
    }else{
        if(map[i][j].visibleToComputer){
            
            if(placingBoat){
                if(map[i][j].boat === null && map[i][j].type === "water"){
                    // Check if it is around the oiler
                    if(Math.abs(computer.boats[0].x - i) <= 1 && Math.abs(computer.boats[0].y - j) <= 1){
                        let newBoat = new Boat(spawningBoat, "computer", i, j);
                        computer.boats.push(newBoat);
                        map[i][j].boat = newBoat;

                        // update fog of war
                        for(let i = newBoat.y - 1; i <= newBoat.y + 1; i++){
                            for(let j = newBoat.x - 1; j <= newBoat.x + 1; j++){
                                if(i >= 0 && i < 10 && j >= 0 && j < 10){
                                    map[j][i].visibleToComputer = true;
                                }
                            }
                        }
                    }
                    
                    computer.boats[0].action = false;
                    placingBoat = false;
                    spawningBoat = null;
                    selectedBoat = null;
                    updateMap();
                }else{
                    alert("Invalid placement");
                }
            }else if(map[i][j].boat !== null && map[i][j].boat.side === "computer"){
                // Player select the boat

                if(map[i][j].boat.action === true){
                    selectedBoat = map[i][j].boat;
                    markSurrondingTiles(i, j);
                }
            }else if (map[i][j].boat === null && selectedBoat !== null && selectedBoat.action === true && map[i][j].type === "water"){
                // Player move the boat

                if(map[i][j].boat === "submarine" && map[i][j].boat.visible === false){
                    // Reveal the enemy submarine
                    map[i][j].boat.visible = true;
                    updateMap();
                }else if(Math.abs(selectedBoat.x - i) <= selectedBoat.speed && Math.abs(selectedBoat.y - j) <= selectedBoat.speed){
                    map[selectedBoat.x][selectedBoat.y].boat = null;
                    selectedBoat.x = i;
                    selectedBoat.y = j;
                    map[i][j].boat = selectedBoat;
                    selectedBoat.action = false;

                    // update fog of war
                    for(let i = selectedBoat.y - 1; i <= selectedBoat.y + 1; i++){
                        for(let j = selectedBoat.x - 1; j <= selectedBoat.x + 1; j++){
                            if(i >= 0 && i < 10 && j >= 0 && j < 10){
                                map[j][i].visibleToComputer = true;
                            }
                        }
                    }
                    selectedBoat = null;
                    updateMap();
                }
     
            }else if (map[i][j].boat !== null && map[i][j].boat.side === "human" && selectedBoat !== null){
                // Player attack the enemy boat
                if(selectedBoat.name === "aircraft_carrier" && selectedBoat.count % 4 !== 0){
                    // Aircraft carrier cant cast special attack
                    return;
                }

                if(selectedBoat.name === "submarine"){
                    // Reveal the submarine
                    selectedBoat.visible = true;
                }
                
                if(map[i][j].boat.name === "submarine" && map[i][j].boat.visible === false){
                    // Reveal the enemy submarine
                    map[i][j].boat.visible = true;
                    updateMap();
                }else if(Math.abs(selectedBoat.x - i) <= selectedBoat.range && Math.abs(selectedBoat.y - j) <= selectedBoat.range){
                    map[i][j].boat.health -= selectedBoat.damage;
                    if(map[i][j].boat.health <= 0){
                        map[i][j].boat = null;
                        human.boats = human.boats.filter(boat => boat.health > 0);
                    }

                    if(selectedBoat.name === "aircraft_carrier"){
                        selectedBoat.count = 1;
                    }

                    selectedBoat.action = false;
                    selectedBoat = null;
                    updateMap();
                }
            }
        }else{
            placingBoat = false;
            selectedBoat = null;
            updateMap();
        }
    }
});

function markSurrondingTiles(x, y){
    for(let i = x - selectedBoat.speed; i <= x + selectedBoat.speed; i++){
        for(let j = y - selectedBoat.speed; j <= y + selectedBoat.speed; j++){
            if(i >= 0 && i < 10 && j >= 0 && j < 10){
                if(turn === "human"){
                    if(map[i][j].visibleToHuman){
                        if(map[i][j].boat === null && map[i][j].type === "water"){
                            ctx.drawImage(greendot, i * 50 + 15, j * 50 + 15, 20, 20);
                        }
                    }
                }else{
                    if(map[i][j].visibleToComputer){
                        if(map[i][j].boat === null && map[i][j].type === "water"){
                            ctx.drawImage(greendot, i * 50 + 15, j * 50 + 15, 20, 20);
                        }
                    }
                }
            }
        }
    }

    for(let i = x - selectedBoat.range; i <= x + selectedBoat.range; i++){
        for(let j = y - selectedBoat.range; j <= y + selectedBoat.range; j++){
            if(i >= 0 && i < 10 && j >= 0 && j < 10){
                if(turn === "human"){
                    if(map[i][j].visibleToHuman){
                        if(map[i][j].boat !== null && map[i][j].boat.side === "computer"){
                            if(map[i][j].boat.visible === false){
                                if(Math.abs(selectedBoat.x - i) <= selectedBoat.speed && Math.abs(selectedBoat.y - j) <= selectedBoat.speed){
                                    ctx.drawImage(greendot, i * 50 + 15, j * 50 + 15, 20, 20);
                                }
                            }else{
                                ctx.drawImage(redmark, i * 50 + 15, j * 50 + 15, 20, 20);
                            }
                        }
                    }
                }else{
                    if(map[i][j].visibleToComputer){
                        if(map[i][j].boat !== null && map[i][j].boat.side === "human"){
                            if(map[i][j].boat.visible === false){
                                ctx.drawImage(greendot, i * 50 + 15, j * 50 + 15, 20, 20);
                            }else{
                                ctx.drawImage(redmark, i * 50 + 15, j * 50 + 15, 20, 20);
                            }
                        }
                    }
                }
            }
        }
    }
}

function markSurrondingTilesSpawn(){
    updateMap();
    if(turn === "human"){
        for(let i = human.boats[0].x - 1; i <= human.boats[0].x + 1; i++){
            for(let j = human.boats[0].y - 1; j <= human.boats[0].y + 1; j++){
                if(i >= 0 && i < 10 && j >= 0 && j < 10){
                    if(map[i][j].boat === null && map[i][j].type === "water"){
                        ctx.drawImage(redarrow, i * 50 + 15, j * 50 + 15, 20, 20);
                    }
                }
            }
        }
    }else{
        for(let i = computer.boats[0].x - 1; i <= computer.boats[0].x + 1; i++){
            for(let j = computer.boats[0].y - 1; j <= computer.boats[0].y + 1; j++){
                if(i >= 0 && i < 10 && j >= 0 && j < 10){
                    if(map[i][j].boat === null && map[i][j].type === "water"){
                        ctx.drawImage(redarrow, i * 50 + 15, j * 50 + 15, 20, 20);
                    }
                }
            }
        }
    }
}

function endTurn(){
    if(turn === "human"){
        console.log(computer);
        turn = "computer";
        human.oil += 5;
        for(let i = 0; i < human.boats.length; i++){
            human.boats[i].action = true;
            if(human.boats[i].name === "aircraft_carrier"){
                if(human.boats[i].count % 4 !== 0){
                    human.boats[i].count++;
                }
            }else{
                human.boats[i].count++;
            }
        }

        // If enemy has a submarine, hide it
        for(let i = 0; i < computer.boats.length; i++){
            if(computer.boats[i].name === "submarine"){
                computer.boats[i].visible = false;
            }
        }
    } else {
        turn = "human";
        computer.oil += 5;
        console.log(human);
        for(let i = 0; i < computer.boats.length; i++){
            computer.boats[i].action = true;
            if(computer.boats[i].name === "aircraft_carrier"){
                if(computer.boats[i].count % 4 !== 0){
                    computer.boats[i].count++;
                }
            }else{
                computer.boats[i].count++;
            }
        }

        // If enemy has a submarine, hide it
        for(let i = 0; i < human.boats.length; i++){
            if(human.boats[i].name === "submarine"){
                human.boats[i].visible = false;
            }
        }
    }

    updateGame();
}

function updateGame(){
    applyArmoredShipDamage();
    updateMap();

    if(turn === "computer"){
        turnText.innerHTML = "Computer's turn";
    }else{
        turnText.innerHTML = "Human's turn";
    }

    selectedBoat = null;
}

function applyArmoredShipDamage() {
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            // Check if there is an armored ship on the current tile
            if (map[i][j].boat !== null && map[i][j].boat.name === "armored_ship") {
                // Get the side of the armored ship
                const armoredShipSide = map[i][j].boat.side;

                // Check surrounding tiles for enemy ships
                for (let x = i - 1; x <= i + 1; x++) {
                    for (let y = j - 1; y <= j + 1; y++) {
                        if (x >= 0 && x < 10 && y >= 0 && y < 10 && map[x][y].boat !== null && map[x][y].boat.side !== armoredShipSide) {
                            // Apply 1 damage to the enemy boat
                            map[x][y].boat.health -= 1;
                        }
                    }
                }
            }
        }
    }

    // Remove destroyed boats
    for(let i = 0; i < 10; i++){
        for(let j = 0; j < 10; j++){
            if(map[i][j].boat !== null && map[i][j].boat.health <= 0){
                map[i][j].boat = null;
            }
        }
    }

    human.boats = human.boats.filter(boat => boat.health > 0);
    computer.boats = computer.boats.filter(boat => boat.health > 0);
}

function updateMap(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let i=0; i<10; i++){
        for(let j=0; j<10; j++){
            if(map[i][j].type === "island"){
                ctx.drawImage(island, i * 50, j * 50, 50, 50);
            }
        }
    }


    if(turn === "human"){
        background.style.backgroundColor = "#0ACDFE";
        oilText.innerHTML = human.oil;

        for(let i = 0; i < 10; i++){
            for(let j = 0; j < 10; j++){
                if(map[i][j].visibleToHuman){
                    if(map[i][j].boat !== null){
                        if(map[i][j].boat.visible === false && map[i][j].boat.side === "computer"){
                            // do not render the boat
                            continue;
                        }  

                        // Render boat
                        const boatimg = new Image();
                        boatimg.src = map[i][j].boat.imgPath;
                        boatimg.onload = function() {
                            if (map[i][j].boat.action === false) {
                                ctx.filter = 'grayscale(100%)'; // Apply grayscale filter if the boat has already made an action
                            }
                            ctx.drawImage(boatimg, i * 50, j * 50, 50, 50);

                            // Render health above the boat
                            ctx.font = "10px Arial";
                            ctx.fillStyle = "black";
                            ctx.fillText(map[i][j].boat.health + "/" + map[i][j].boat.maxhealth, i * 50, j * 50 + 10); 
                            ctx.filter = 'none';
                        }
                    }
                }else{
                    // Render clouds
                    ctx.drawImage(cloud, i * 50, j * 50, 50, 50);
                }
            }
        }

    }else if(turn === "computer"){
        background.style.backgroundColor = "#D84945";
        oilText.innerHTML = computer.oil;

        for(let i = 0; i < 10; i++){
            for(let j = 0; j < 10; j++){
                if(map[i][j].visibleToComputer){
                    if(map[i][j].boat !== null){
                        if(map[i][j].boat.visible === false && map[i][j].boat.side === "human"){
                            // do not render the boat
                            continue;
                        }    

                        // Render boat
                        const boatimg = new Image();
                        boatimg.src = map[i][j].boat.imgPath;
                        boatimg.onload = function() {
                            if (map[i][j].boat.action === false) {
                                ctx.filter = 'grayscale(100%)'; // Apply grayscale filter if the boat has already made an action
                            }
                            ctx.drawImage(boatimg, i * 50, j * 50, 50, 50);

                            ctx.font = "10px Arial";
                            ctx.fillStyle = "black";
                            ctx.fillText(map[i][j].boat.health + "/" + map[i][j].boat.maxhealth, i * 50, j * 50 + 10); 
                            ctx.filter = 'none';
                        }
                    }
                }else{
                    // Render clouds
                    ctx.drawImage(cloud, i * 50, j * 50, 50, 50);
                }
            }
        }
    }
}

// SPAWN BOATS
document.getElementById("coast_guard").addEventListener("click", function(){
    spawnBoat("coast_guard");
});

document.getElementById("speed_boat").addEventListener("click", function(){
    spawnBoat("speed_boat");
});

document.getElementById("canon_boat").addEventListener("click", function(){
    spawnBoat("canon_boat");
});

document.getElementById("armored_ship").addEventListener("click", function(){
    spawnBoat("armored_ship");
});

document.getElementById("submarine").addEventListener("click", function(){
    spawnBoat("submarine");
});

document.getElementById("aircraft_carrier").addEventListener("click", function(){
    spawnBoat("aircraft_carrier");
});

function spawnBoat(type){
    if(turn === "human" && human.boats[0].action === true){
        selectedBoat = human.boats[0];
        if(type === "coast_guard" && human.oil >= 2){
            human.oil -= 2;
            placingBoat = true;
            spawningBoat = "coast_guard";
            markSurrondingTilesSpawn();
        }else if(type === "speed_boat" && human.oil >= 3){
            human.oil -= 3;
            placingBoat = true;
            spawningBoat = "speed_boat";
            markSurrondingTilesSpawn();
        }else if(type === "canon_boat" && human.oil >= 5){
            human.oil -= 5;
            placingBoat = true;
            spawningBoat = "canon_boat";
            markSurrondingTilesSpawn();
        }else if(type === "armored_ship" && human.oil >= 8){
            human.oil -= 8;
            placingBoat = true;
            spawningBoat = "armored_ship";
            markSurrondingTilesSpawn();
        }else if(type === "submarine" && human.oil >= 12){
            human.oil -= 12;
            placingBoat = true;
            spawningBoat = "submarine";
            markSurrondingTilesSpawn();
        }else if(type === "aircraft_carrier" && human.oil >= 20){
            human.oil -= 20;
            placingBoat = true;
            spawningBoat = "aircraft_carrier";
            markSurrondingTilesSpawn();
        }
    }else if(turn === "computer" && computer.boats[0].action === true){
        selectedBoat = computer.boats[0];
        if(type === "coast_guard" && computer.oil >= 2){
            computer.oil -= 2;
            placingBoat = true;
            spawningBoat = "coast_guard";
            markSurrondingTilesSpawn();
        }else if(type === "speed_boat" && computer.oil >= 3){
            computer.oil -= 3;
            placingBoat = true;
            spawningBoat = "speed_boat";
            markSurrondingTilesSpawn();
        }else if(type === "canon_boat" && computer.oil >= 5){
            computer.oil -= 5;
            placingBoat = true;
            spawningBoat = "canon_boat";
            markSurrondingTilesSpawn();
        }else if(type === "armored_ship" && computer.oil >= 8){
            computer.oil -= 8;
            placingBoat = true;
            spawningBoat = "armored_ship";
            markSurrondingTilesSpawn();
        }else if(type === "submarine" && computer.oil >= 12){
            computer.oil -= 12;
            placingBoat = true;
            spawningBoat = "submarine";
            markSurrondingTilesSpawn();
        }else if(type === "aircraft_carrier" && computer.oil >= 20){
            computer.oil -= 20;
            placingBoat = true;
            spawningBoat = "aircraft_carrier";
            markSurrondingTilesSpawn();
        }
    }
}
