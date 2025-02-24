const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

let gridSize = 100;
let cellSize = Math.floor(1 / gridSize * 2000);

let currentGen = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false));
let oldCells = new Array();
let changes = new Array();

canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

let wrapAround = false;
let speed = 150;

const offscreenCanvas = document.createElement("canvas");
const offscreenCtx = offscreenCanvas.getContext("2d");

function initializeOffscreenCanvas() {
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;

    offscreenCtx.strokeStyle = "gray";
    for (let x = 0; x <= gridSize; x++) {
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(x * cellSize, 0);
        offscreenCtx.lineTo(x * cellSize, canvas.height);
        offscreenCtx.stroke();
    }
    for (let y = 0; y <= gridSize; y++) {
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(0, y * cellSize);
        offscreenCtx.lineTo(canvas.width, y * cellSize);
        offscreenCtx.stroke();
    }
}

initializeOffscreenCanvas();

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    changes.forEach(({ x, y, state }) => {
        if (state && oldCells.some(cell => cell[0] == x && cell[1] == y)) {
            ctx.fillStyle = "grey";
        } else {
            ctx.fillStyle = state ? "white" : "black";
        }
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    });

    ctx.drawImage(offscreenCanvas, 0, 0);

    changes = [];
}

function updateCell(x, y, state) {
    currentGen[y][x] = state;
    changes.push({ x, y, state });
}

function fillCell(x, y, state) {
    ctx.fillStyle = state ? "white" : "black";
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

drawGrid();

function neighbourCount(x, y) {
    var neighbourCount = 0;

    for (var i = y - 1; i <= y + 1; i++) {
        for (var j = x - 1; j <= x + 1; j++) {
            let xToCheck = j;
            let yToCheck = i;

            if ((i < 0 || j < 0 || i > gridSize - 1 || j > gridSize - 1) && !wrapAround) {
                continue;
            }

            if (xToCheck == -1 && wrapAround) {
                xToCheck = gridSize - 1;
            } else if (xToCheck == gridSize && wrapAround) {
                xToCheck = 0;
            }

            if (yToCheck == -1 && wrapAround) {
                yToCheck = gridSize - 1;
            } else if (yToCheck == gridSize && wrapAround) {
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

function nextGeneration() {
    var nextGen = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false));

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let alive = currentGen[y][x];
            let neigbours = neighbourCount(x, y);

            if (alive && (neigbours < 2 || neigbours > 3)) {
                nextGen[y][x] = false;
            } else if (alive) {
                nextGen[y][x] = true;
            }

            if (neigbours == 3) {
                nextGen[y][x] = true;
            }
        }
    }
    setNextGen(nextGen);
}

function setNextGen(nextGen) {
    oldCells = new Array();

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let alive = currentGen[y][x];

            if (alive && !nextGen[y][x]) {
                updateCell(x, y, false);
            }

            if (nextGen[y][x] && alive) {
                oldCells.push([x, y]);
                updateCell(x, y, true);
            } else if (nextGen[y][x]) {
                updateCell(x, y, true);
            }
        }
    }

    drawGrid();
}



let visitedWhileDrawing = new Array();
let isDrawing = false;

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    draw(e);
});

canvas.addEventListener("mousemove", draw);

document.addEventListener("mouseup", () => {
    isDrawing = false;
    visitedWhileDrawing = new Array();
})

function draw(e) {
    if (!isDrawing) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX / cellSize);
    const y = Math.floor((e.clientY - rect.top) * scaleY / cellSize);
    
    let shapeGridSizeX = 0;
    let shapeGridSizeY = 0;

    //get max size of shape
    selectedShape.forEach((cord) => {
        if(cord[0] > shapeGridSizeX){
            shapeGridSizeX = cord[0]
        }
        if(cord[1] > shapeGridSizeY){
            shapeGridSizeY = cord[1];
        }
    })

    if(selectedShape.length != 1 && selectedShape[0] != [0, 0]){
        for (let i = 0; i < selectedShape.length; i++) {
            let cordsX = selectedShape[i][0];
            let cordsY = selectedShape[i][1];
            let rotatedX;
            let rotatedY;

            switch (selectedRotation) {
                case 0: // 0 degrees
                    rotatedX = cordsX;
                    rotatedY = cordsY;
                    break;
                case 3: // 90 degrees
                    rotatedX = cordsY;
                    rotatedY = shapeGridSizeY - 1 - cordsX;
                    break;
                case 2: // 180 degrees
                    rotatedX = shapeGridSizeX - 1 - cordsX;
                    rotatedY = shapeGridSizeY - 1 - cordsY;
                    break;
                case 1: // 270 degrees
                    rotatedX = shapeGridSizeX - 1 - cordsY;
                    rotatedY = cordsX;
                    break;
            }
            rotatedX += parseInt(x);
            rotatedY += parseInt(y);
            currentGen[rotatedY][rotatedX] = true;
            fillCell(rotatedX, rotatedY, true);
        }
        return;
    }

    if (visitedWhileDrawing.some(visited => visited[0] == x && visited[1] == y)) {
        return;
    }

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        currentGen[y][x] = !currentGen[y][x];
        visitedWhileDrawing.push([x, y]);
        fillCell(x, y, currentGen[y][x]);
    }
}



//start button
const startButton = document.getElementById("start");
startButton.addEventListener("click", startStop);

let isRunning = false;
let runningInterval;

function startStop() {
    if (!isRunning) {
        runningInterval = setInterval(nextGeneration, speed);
        startButton.innerHTML = 'Stop';
        isRunning = true;
    } else {
        stop();
    }
}



//reset button
var resetButton = document.getElementById('reset');

function stop() {
    if (isRunning) {
        clearInterval(runningInterval)
        startButton.innerHTML = 'Start';
        isRunning = false;
    }
}

resetButton.addEventListener('click', () => {
    stop();

    for (var i = 0; i < currentGen.length; i++) {
        for (var j = 0; j < currentGen.length; j++) {
            if (currentGen[i][j]) {
                updateCell(j, i, false);
            }
        }
    }

    drawGrid();
})



//fast forward
var nextButton = document.getElementById('nextStep');
var next10Button = document.getElementById('next10Step');

nextButton.addEventListener('click', nextGeneration);

next10Button.addEventListener('click', () => {
    if (isRunning) {
        return;
    }

    let count = 0;
    isRunning = true;

    runningInterval = setInterval(() => {
        count++;
        if (count > 10) {
            isRunning = false;
            clearInterval(runningInterval);
        }
        nextGeneration();
    }, speed);
})



//select speed
var selectSpeed = document.getElementById("speed-select");

selectSpeed.addEventListener('change', (e) => {
    changeSpeed(e.target.value)
})

function changeSpeed(multiplier) {
    let baseSpeed = 300;
    speed = baseSpeed / multiplier

    if (isRunning) {
        clearInterval(runningInterval)
        runningInterval = setInterval(nextGeneration, speed);
    }
}


//select size
var selectSize = document.getElementById("size-select");

selectSize.addEventListener('change', (e) => {
    stop();

    gridSize = parseInt(e.target.value);
    cellSize = Math.floor(1 / gridSize * 2000);

    currentGen = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false));

    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;

    initializeOffscreenCanvas();
    drawGrid();
})


//wrap around
var wrapButton = document.getElementById("wrap");

wrapButton.addEventListener('click', (e) => {
    wrapAround = !wrapAround;
    if(wrapAround){
        e.target.style.backgroundColor = 'green';
    }else{
        e.target.style.backgroundColor = 'red';
    }
})


//random
var randomButton = document.getElementById('random');

randomButton.addEventListener('click', setRandomStates);

function setRandomStates(){
    for(var i = 0; i < gridSize; i++){
        for(var j = 0; j < gridSize; j++){
            var random = Math.floor(Math.random() * 4);
            var bool = random == 1;

            updateCell(j, i, bool);
        }
    }
    drawGrid();
}


//shape
var shapesDiv = document.getElementById('shapes');

let shapesCords = await getShapes();
let shapesItems = new Array();
let selectedShape;
let selectedRotation = 0;

Object.keys(shapesCords).forEach((shape) => {
    let newShape = document.createElement('custom-shape');
    newShape.setAttribute('shape', shape);
    newShape.addEventListener('click', onShapeSelect);
    shapesDiv.appendChild(newShape);
    
    shapesItems.push(newShape);

    //first selected shape = dot
    if(shape == 'Dot'){
        newShape.classList.add('selected');
        selectedShape = shapesCords[shape];
    }
})

function onShapeSelect(e){
    shapesItems.forEach(shapeItem => {
        shapeItem.classList.toggle('selected', false);
    })
    e.target.classList.add('selected');
    selectedShape = shapesCords[e.target.getAttribute('shape')];
    selectedRotation = parseInt(e.target.getAttribute('rotation'));
    console.log(selectedRotation);
}

async function getShapes() {
    let shapes = {};

    await fetch('shapes.json')
        .then(response => response.json())
        .then(data => {
            shapes = data;
        })
        .catch(error => console.error('Error loading shapes:', error));

    return shapes;
}