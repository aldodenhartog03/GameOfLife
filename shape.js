class shape extends HTMLElement {
    static observedAttributes = ["rotation"];

    static gridSize;
    static cellSize;
    static shapeCanvas;
    static shapeCords;
    static ctx;
    static shapeName;
    static description;
    static rotation;

    constructor() {
        super();
    }

    async connectedCallback() {
        this.shapeName = this.getAttribute('shape');
        this.shapeCords = await getShape(this.shapeName);

        const shadowRoot = this.attachShadow({ mode: 'open' });

        this.rotation = 0; 
        this.rotateButton = document.createElement('div');
        this.rotateButton.innerHTML = 'O';
        this.rotateButton.part = 'rotate-button';
        this.rotateButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.rotation = this.rotation == 3 ? 0 : this.rotation + 1;
        })
        shadowRoot.appendChild(this.rotateButton);

        this.shapeCanvas = document.createElement('canvas');
        this.shapeCanvas.style.width = '5vw';
        this.gridSize = this.getGridSize();
        this.cellSize = Math.floor(1 / this.gridSize * 1000);
        this.drawShape(this.shapeCanvas);
        shadowRoot.appendChild(this.shapeCanvas);

        this.description = document.createElement('div');
        this.description.innerHTML = this.shapeName;
        this.description.part = 'div';
        shadowRoot.appendChild(this.description);
    }

    attributeChangedCallback(name, oldValue, newValue){
        console.log(name +' '+ oldValue +' '+ newValue);
    }

    drawShape() {
        this.ctx = this.shapeCanvas.getContext("2d");
        this.shapeCanvas.width = this.gridSize * this.cellSize;
        this.shapeCanvas.height = this.gridSize * this.cellSize;
        for (let i = 0; i < this.shapeCords.length; i++) {
            this.fillRect(this.shapeCords[i][0], this.shapeCords[i][1]);
        }

        this.drawGrid();
    }

    drawGrid() {
        let lineSize = Math.floor(this.shapeCanvas.width / 100 * 1);

        for (let x = 0; x <= this.gridSize; x++) {
            this.ctx.clearRect(x * this.cellSize, 0, lineSize, this.shapeCanvas.height);
        }
        for (let y = 0; y <= this.gridSize; y++) {
            this.ctx.clearRect(0, y * this.cellSize, this.shapeCanvas.width, lineSize);
        }
    }

    fillRect(x, y) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
    }

    getGridSize() {
        let biggestCord = 0;
        this.shapeCords.forEach(cords => {
            if (biggestCord < cords[0]) {
                biggestCord = cords[0];
            }
            if (biggestCord < cords[1]) {
                biggestCord = cords[1];
            }
        })

        return biggestCord + 1;
    }
}

customElements.define('custom-shape', shape);

async function getShape(name) {
    let shapes = {};

    await fetch('shapes.json')
        .then(response => response.json())
        .then(data => {
            shapes = data;
        })
        .catch(error => console.error('Error loading shapes:', error));

    return shapes[name];
}

export default shape;