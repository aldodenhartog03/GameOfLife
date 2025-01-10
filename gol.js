var startButton = document.getElementById("start");
var nextButton = document.getElementById('nextStep');
var next10Button = document.getElementById('next10Step');
var resetButton = document.getElementById('reset');
var selectSize = document.getElementById("size-select");
var randomButton = document.getElementById('random');

var selectSpeed = document.getElementById("speed-select");
var speed = 300;

var selectShape = document.getElementById("shape-select");
var shape = 'dot';
var selectDirectionDiv = document.getElementById("direction-select-div");
var selectDirection = document.getElementById("direction-select");
var directionUp = 1;
var directionRight = 1;

var wrapButton = document.getElementById("wrap");
var wrapAround = false;

var grid = document.getElementById("grid");
var isDrawing = false;

var gridContent = new Array(10);
var currentGen = new Array(10);

var isRunning = false;
var runningInterval;

grid.addEventListener('mousedown', (e) => {
    isDrawing = true;
    draw(e);
})
grid.addEventListener('mouseup', () => {
    isDrawing = false;
})
grid.addEventListener('mouseover', draw)

document.addEventListener('mouseup', () => {
    isDrawing = false;
})

function setGridSize(size) {
    size = Math.sqrt(size);

    gridContent = new Array(size);
    grid.innerHTML = '';

    //add rows
    for (var i = 0; i < size; i++) {
        gridContent[i] = new Array(size);
        currentGen[i] = new Array(size);
        for(var j = 0; j < size; j++){
            gridContent[i][j] = document.createElement("div");
            gridContent[i][j].classList.add('size-' + size)
            gridContent[i][j].id = j +'-'+ i;
            grid.appendChild(gridContent[i][j]);

            currentGen[i][j] = false;
        }
    }    

    console.log(gridContent);
    console.log(currentGen);
}

setGridSize(100);

function draw(e) {
    if(!isDrawing){
        return;
    }
    var box = e.target;
    var [x, y] = findCords(e);

    if (shape == 'glider') {
        makeGlider(x, y);
        return;
    }

    if(shape == 'pyramid'){
        makePyramid(x, y);
        return;
    }

    if(shape == 'reflector'){
        makeReflector(x, y);
        return;
    }

    if(shape == 'crab'){
        makeCrab(x + 12, y + 14);
        return;
    }

    if (currentGen[y][x]) {
        box.classList.remove("active")
        currentGen[y][x] = false;
    } else {
        box.classList.add("active")
        currentGen[y][x] = true;
    }
}

function makeGlider(x, y) {
    for(var i = x - 1; i <= x + 1; i++){
        activateIfInActive(i, y - directionUp);
    }

    activateIfInActive(x + directionRight, y);
    activateIfInActive(x, y + directionUp);
}

function makePyramid(x, y){
    activateIfInActive(x, y);
    activateIfInActive(x - 1, y);
    activateIfInActive(x + 1, y);
    activateIfInActive(x, y - 1);
}

function makeReflector(x, y){
    activateIfInActive(x, y);
    activateIfInActive(x - 1, y);
    activateIfInActive(x - 3, y);
    activateIfInActive(x - 4, y);
    activateIfInActive(x + 1, y);
    activateIfInActive(x + 2, y);
    activateIfInActive(x + 4, y);
    activateIfInActive(x + 5, y);

    activateIfInActive(x - 2, y + 1);
    activateIfInActive(x - 2, y - 1);
    activateIfInActive(x + 3, y + 1);
    activateIfInActive(x + 3, y - 1);
}

function makeCrab(x, y){
    activateIfInActive(x - 8, y);
    activateIfInActive(x - 9, y);
    activateIfInActive(x - 7, y - 1);
    activateIfInActive(x - 8, y - 1);
    activateIfInActive(x - 9, y - 2);
    activateIfInActive(x - 11, y - 3);
    activateIfInActive(x - 12, y - 3);
    activateIfInActive(x - 10, y - 4);
    activateIfInActive(x - 9, y - 6);
    activateIfInActive(x - 12, y - 6);
    activateIfInActive(x - 1, y - 7);
    activateIfInActive(x - 2, y - 7);
    activateIfInActive(x - 8, y - 7);
    activateIfInActive(x - 9, y - 7);
    activateIfInActive(x, y - 8);
    activateIfInActive(x - 1, y - 8);
    activateIfInActive(x - 7, y - 8);
    activateIfInActive(x - 2, y - 9);
    activateIfInActive(x - 7, y - 9);
    activateIfInActive(x - 9, y - 9);
    activateIfInActive(x - 4, y - 10);
    activateIfInActive(x - 5, y - 10);
    activateIfInActive(x - 8, y - 10);
    activateIfInActive(x - 4, y - 11);
    activateIfInActive(x - 5, y - 11);
    activateIfInActive(x - 8, y - 12);
    activateIfInActive(x - 7, y - 13);
    activateIfInActive(x - 9, y - 13);
    activateIfInActive(x - 8, y - 14);
}

function activateIfInActive(x, y){

    if (x < 0 || y < 0 || x > gridContent.length - 1 || y > gridContent.length - 1) {
        return;
    }

    if(!currentGen[y][x]){
        gridContent[y][x].classList.add('active');
        currentGen[y][x] = true;
    }
}

wrapButton.addEventListener('click', (e) => {
    wrapAround = !wrapAround;
    if(wrapAround){
        e.target.style.backgroundColor = 'green';
    }else{
        e.target.style.backgroundColor = 'red';
    }
})

randomButton.addEventListener('click', setRandomStates);

function setRandomStates(){
    for(var i = 0; i < currentGen.length; i++){
        for(var j = 0; j < currentGen.length; j++){
            var random = Math.floor(Math.random() * 4);
            var bool = random == 1;

            if(bool){
                activateIfInActive(j, i);
            }else{
                gridContent[i][j].classList.remove('active');
                gridContent[i][j].classList.remove('old');
                currentGen[i][j] = false;
            }
        }
    }
}

nextButton.addEventListener('click', nextGeneration);

next10Button.addEventListener('click', () => {
    if(isRunning){
        return;
    }

    let count = 0;
    isRunning = true;
    
    runningInterval = setInterval(() => {
        count++;
        if(count > 10){
            isRunning = false;
            clearInterval(runningInterval);
        }
        nextGeneration();
    }, speed);
})

startButton.addEventListener('click', startStop)

selectSize.addEventListener('change', (e) => {
    stop();
    if (e.target.value == 100) {
        setGridSize(100);
        grid.style.gridTemplateColumns = 'repeat(10, 4.5vw)';
    }
    if (e.target.value == 225) {
        setGridSize(225);
        grid.style.gridTemplateColumns = 'repeat(15, 3vw)';
    }
    if (e.target.value == 400) {
        setGridSize(400);
        grid.style.gridTemplateColumns = 'repeat(20, 2.2vw)';
    }
    if (e.target.value == 10000) {
        setGridSize(10000);
        grid.style.gridTemplateColumns = 'repeat(100, 45px)';
    }
})

function startStop() {
    if (!isRunning) {
        runningInterval = setInterval(nextGeneration, speed);
        startButton.innerHTML = 'Stop';
        isRunning = true;
    } else {
        clearInterval(runningInterval)
        startButton.innerHTML = 'Start';
        isRunning = false;
    }
}

function stop() {
    if (isRunning) {
        clearInterval(runningInterval)
        startButton.innerHTML = 'Start';
        isRunning = false;
    }
}

resetButton.addEventListener('click', () => {
    stop();

    for(var i = 0; i < currentGen.length; i++){
        for (var j = 0; j < currentGen.length; j++) {
            if(currentGen[i][j]){
                gridContent[i][j].classList.remove('old');
                gridContent[i][j].classList.remove('active');
                currentGen[i][j] = false;
            }
        }
    }
})

selectSpeed.addEventListener('change', (e) => {
    changeSpeed(e.target.value)
})

function changeSpeed(multiplier) {
    let baseSpeed = 300;
    speed = baseSpeed / multiplier

    if(isRunning){
        clearInterval(runningInterval)
        runningInterval = setInterval(nextGeneration, speed);
    }
}

selectShape.addEventListener('change', (e) => {
    shape = e.target.value;
    if(shape == 'glider'){
        selectDirectionDiv.hidden = false;
    }else{
        selectDirectionDiv.hidden = true;
    }
})

selectDirection.addEventListener('change', (e) => {
    let direction = e.target.value;

    if(direction.includes('up')){
        directionUp = 1;
    }else{
        directionUp = -1;
    }

    if(direction.includes('Right')){
        directionRight = 1;
    }else{
        directionRight = -1;
    }
})

function neighbourCount(x, y) {
    var neighbourCount = 0;

    for (var i = y - 1; i <= y + 1; i++) {
        for (var j = x - 1; j <= x + 1; j++) {
            let xToCheck = j;
            let yToCheck = i;

            if ((i < 0 || j < 0 || i > gridContent.length - 1 || j > gridContent.length - 1) && !wrapAround) {
                continue;
            }

            if(xToCheck == -1 && wrapAround){
                xToCheck = currentGen.length - 1;
            }else if(xToCheck == currentGen.length && wrapAround){
                xToCheck = 0;
            }

            if(yToCheck == -1 && wrapAround){
                yToCheck = currentGen.length - 1;
            }else if(yToCheck == currentGen.length && wrapAround){
                yToCheck = 0;
            }

            if (i === y && j === x) {
                continue;
            }

            if (currentGen[yToCheck][xToCheck]) {
                neighbourCount++;
            }
        }
    }

    return neighbourCount;
}

function addNeighbourCount(x, y, count){
    if(currentGen[y][x]){
        count++;
        console.log('hier');
    }
    return count;
}

function findCords(e) {
    var target = e.target;
    var [xString, yString] = target.id.split('-');
    let x = parseInt(xString);
    let y = parseInt(yString);


    // for (let i = 0; i < gridContent.length; i++) {
    //     for (let j = 0; j < gridContent[i].length; j++) {
    //         if (gridContent[i][j] === target) {
    //             y = i;
    //             x = j;
    //             break;
    //         }
    //     }
    // }

    return [x, y];
}

function nextGeneration() {
    var nextGen = new Array(gridContent.length);
    for (let i = 0; i < nextGen.length; i++) {
        nextGen[i] = new Array(gridContent.length);
    }

    for (let i = 0; i < gridContent.length; i++) {
        for (let j = 0; j < gridContent[i].length; j++) {
            let alive = currentGen[i][j];
            let neigbours = neighbourCount(j, i);

            if (alive && (neigbours < 2 || neigbours > 3)) {
                nextGen[i][j] = false;
            } else if (alive) {
                nextGen[i][j] = true;
            }

            if (neigbours == 3) {
                nextGen[i][j] = true;
            }
        }
    }
    setNextGen(nextGen);
}

function setNextGen(nextGen) {
    for (let i = 0; i < gridContent.length; i++) {
        for (let j = 0; j < gridContent[i].length; j++) {
            let box = gridContent[i][j]
            let alive = currentGen[i][j];

            if (alive && !nextGen[i][j]) {
                box.classList.remove('active');
                box.classList.remove('old');
                currentGen[i][j] = false;
            }

            if (nextGen[i][j] && alive) {
                box.classList.remove('active');
                box.classList.add('old');
            }else if (nextGen[i][j]){
                currentGen[i][j] = true;
                box.classList.add('active');
            }
        }
    }
}