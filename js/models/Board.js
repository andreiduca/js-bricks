function Board(gameBoard) {

    this.board = gameBoard;
    this.ball = null;
    this.pad = null;
    this.cells = [];
    this.cellsW = 0;
    this.cellsH = 0;

    this.width = this.board.canvas.width;
    this.height = this.board.canvas.height;
    this.isSmall = false;

    this.missPad = false;
    this.noMoreCells = false;

    // initialise board elements
    this.init = function() {
        // detect small screens
        this.isSmall = this.width <= 720;

        this.addPad();
        this.addBall();
        this.addCells();

        this.drawElements();
    };

    // clears the canvas
    this.clear = function() {
        this.board.clearRect(0, 0, this.width, this.height);
    };

    // draws elements on canvas
    this.drawElements = function() {
        this.drawPad();
        this.drawBall();
        this.drawCells();
    };

    // add the pad to the scene
    this.addPad = function () {
        this.missPad = false;
        this.pad = new Pad();

        // small pad for small screens
        if (this.isSmall) {
            this.pad.width = parseInt(this.width/4);
            this.pad.height = 10;
        }
        // bigger pad for bigger screens
        else {
            this.pad.width = parseInt(this.width/6);
            this.pad.height = 20;
        }

        // position the pad at the bottom center
        this.pad.x = parseInt(this.width/2 - this.pad.width/2);
        this.pad.y = parseInt(this.height - this.pad.height - 5);
    };

    // move left / right by 15px, but keep between borders
    this.movePadLeft = function() {
        if (this.pad.x > 0) {
            this.pad.x = Math.max(this.pad.x - 15, 0);
        }
    };
    this.movePadRight = function() {
        if (this.pad.x + this.pad.width < this.width) {
            this.pad.x = Math.min(this.width - this.pad.width, this.pad.x + 15);
        }
    };

    // move pad to X, but no less than left border and no more than right border
    this.movePadTo = function(x) {
        this.pad.x = Math.max(0, Math.min(parseInt(x - this.pad.width/2), this.width - this.pad.width));
    };

    // draws the pad on canvas
    this.drawPad = function() {
        this.board.fillStyle = "rgb(255, 255, 255)";
        this.board.fillRect(this.pad.x, this.pad.y, this.pad.width, this.pad.height);
        this.board.fill();
    };

    // add the ball to the scene
    this.addBall = function() {
        this.ball = new Ball();

        // smaller ball for smaller screens
        if (this.isSmall) {
            this.ball.radius = parseInt(this.width/25);
        }
        // bigger ball for bigger screens
        else {
            this.ball.radius = parseInt(this.width/50);
        }

        // set ball speed
        this.ball.speedX = 6; // starts going up
        this.ball.speedY = -6; // starts going right

        // position the ball in the center, just above the pad
        this.ball.x = parseInt(this.width/2);
        this.ball.y = parseInt(this.pad.y - this.ball.radius);
    };

    // ball move logic
    this.moveBall = function() {

        // ball hits the side of the board
        if ((this.ball.x + this.ball.radius/2 <= this.width && this.ball.x + this.ball.radius/2 + this.ball.speedX > this.width) || (this.ball.x - this.ball.radius/2 >= 0 && this.ball.x - this.ball.radius/2 + this.ball.speedX < 0)) {
            // switch horizontal movement
            this.ball.speedX = -this.ball.speedX;
        }

        // ball is at the same height as the pad
        if (this.ball.y + this.ball.radius/2 <= this.pad.y && this.ball.y + this.ball.radius/2 + this.ball.speedY > this.pad.y) {
            // are we in pad's range?
            if (this.ball.x + this.ball.radius/2 >= this.pad.x && this.ball.x - this.ball.radius/2 <= this.pad.x + this.pad.width) {
                // switch vertical movement
                this.ball.speedY = -this.ball.speedY;
            }
            // we missed the pad :(
            else {
                this.missPad = true;
            }
        }
        // ball is elsewhere on scene
        else {
            // ball hits the top of the board
            if (this.ball.y - this.ball.radius/2 >= 0 && this.ball.y - this.ball.radius/2 + this.ball.speedY < 0) {
                // switch vertical movement
                this.ball.speedY = -this.ball.speedY;
            }
            else {
                // check for any cell hit
                this.checkHit();
            }
        }

        // make the move
        this.ball.move();
    };

    this.drawBall = function() {
        this.board.fillStyle = "rgb(255, 255, 255)";
        this.board.beginPath();
        this.board.arc(this.ball.x, this.ball.y, this.ball.radius, 0, 2 * Math.PI, true);
        this.board.closePath();
        this.board.fill();
    };

    // computes the cells alignment on the board
    this.addCells = function() {
        // fewer cells on smaller screens
        if (this.isSmall) {
            this.cellsW = 8;
            this.cellsH = 4;
        }
        // more cells on bigger screens
        else {
            this.cellsW = 15;
            this.cellsH = 6;
        }

        // cells container is 80% of canvas width and centered
        var cellsContainerWidth = parseInt(0.8 * this.width);
        var cellsContainerX = parseInt((this.width - cellsContainerWidth) / 2);

        for (var i = 0; i < this.cellsH; i++) {
            // init new row
            this.cells[i] = [];

            for (var j = 0; j < this.cellsW; j++) {
                var cell = new Cell();

                // get initial cell width/height
                cell.width = parseInt(cellsContainerWidth / this.cellsW);
                cell.height = parseInt(cell.width / 2);

                // position cell based on i/j indexes
                cell.x = parseInt(cellsContainerX + j * cell.width + cell.width * 0.05); // slightly right (for padding)
                cell.y = parseInt((i + 2) * cell.height);

                // add padding (make cell smaller by 10% than its initial values)
                cell.width = parseInt(cell.width * 0.9);
                cell.height = parseInt(cell.height * 0.9);

                // add cell in current row
                this.cells[i][j] = cell;
            }
        }
    };

    this.drawCells = function() {
        this.noMoreCells = true;

        for (var i = 0; i < this.cells.length; i++) {
            for (var j = 0; j < this.cells[i].length; j++) {

                if (this.cells[i][j] !== null) {
                    this.board.fillStyle = "rgb(255, 255, 255)";
                    this.board.fillRect(this.cells[i][j].x, this.cells[i][j].y, this.cells[i][j].width, this.cells[i][j].height);
                    this.board.fill();

                    this.noMoreCells = false;
                }
            }
        }
    };


    // check if we have a ball-cell hit
    this.checkHit = function() {
        var hit = false;
        for (var i = 0; i < this.cells.length && !hit; i++) {
            for (var j = 0; j < this.cells[i].length && !hit; j++) {
                if (this.cells[i][j] !== null) {
                    // check vertical hit
                    if (this.checkTopHit(this.ball, this.cells[i][j]) || this.checkBottomHit(this.ball, this.cells[i][j])) {
                        hit = true;
                        this.ball.speedY = -this.ball.speedY;
                    }
                    // check horizontal hit
                    else if (this.checkLeftHit(this.ball, this.cells[i][j]) || this.checkRightHit(this.ball, this.cells[i][j])) {
                        hit = true;
                        this.ball.speedX = -this.ball.speedX;
                    }
                    // remove the cell if we have a hit
                    if (hit) {
                        this.cells[i][j] = null;
                    }
                }
            }
        }

        return hit;
    };

    // 4 sides hit logic
    this.checkBottomHit = function(ball, cell) {
        return (ball.x + ball.radius/2 >= cell.x) && (ball.x - ball.radius/2 <= cell.x + cell.width) && (ball.y - ball.radius/2 > cell.y + cell.height) && (ball.y - ball.radius/2 + ball.speedY <= cell.y + cell.height);
    };
    this.checkTopHit = function(ball, cell) {
        return (ball.x + ball.radius/2 >= cell.x) && (ball.x - ball.radius/2 <= cell.x + cell.width) && (ball.y + ball.radius/2 < cell.y) && (ball.y + ball.radius/2 + ball.speedY >= cell.y);
    };
    this.checkLeftHit = function(ball, cell) {
        return (ball.y + ball.radius/2 >= cell.y) && (ball.y - ball.radius/2 <= cell.y + cell.height) && (ball.x + ball.radius/2 < cell.x) && (ball.x + ball.radius/2 + ball.speedX >= cell.x);
    };
    this.checkRightHit = function(ball, cell) {
        return (ball.y + ball.radius/2 >= cell.y) && (ball.y - ball.radius/2 <= cell.y + cell.height) && (ball.x - ball.radius/2 > cell.x + cell.width) && (ball.x - ball.radius/2 + ball.speedX <= cell.x + cell.width);
    };
}
