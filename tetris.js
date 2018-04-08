
function Tetris() {
	
	const KEY_LEFT = 'a';
	const KEY_RIGHT = 'd';
	const KEY_DOWN = 's';
	const KEY_ROTATE = 'w';

	this.ctx;

	// HTML Elements
	this.canvas;
	this.linesLabel = null;
	this.levelLabel = null;
	this.scoreLabel = null;
	this.pauseButton = null;
	this.upNextCanvas = null;

	this.updateCounter = 0; // Number of frames left before moving piece
	this.keyboardDelay = 0;

	// Game State
	this.speed = 5; // Number of frames before piece moves down
	this.board = [];
	this.fallingPiece = null;
	this.lines = 0;
	this.level = 0;
	this.score = 0;
	this.isGameOver = false;
	this.isPaused = false;

	// Input State
	this.isDownPressed = false;
	this.isLeftPressed = false;
	this.isRightPressed = false;
	this.isRotatePressed = false;
	this.yTouchStart = 0;
	this.xTouchStart = 0;


	this.hasDrawnText = false;

	this.init = function() {

		this.canvas = document.getElementById("gameCanvas");
		this.ctx = this.canvas.getContext("2d");

		this.linesLabel = document.getElementById("lines");
		this.levelLabel = document.getElementById("level");
		this.scoreLabel = document.getElementById("score");
		this.pauseButton = document.getElementById("pauseButton");
		this.upNextCanvas = document.getElementById("upNextCanvas");

		this.isPaused = false;

		// Set up the frame ticker
		var frameTime = 1000 / data.fps;
		setInterval(this.onFrame, frameTime);

		var width = this.canvas.width;
		var height = this.canvas.height;
		this.squareSize = width / data.numCols;

		// Keyboard Input
		document.addEventListener('keyup', this.onKeyUp);
		document.addEventListener('keydown', this.onKeyDown);

		// Touch Input (for mobile devices)
		document.addEventListener('touchstart', this.handleTouchStart);        
		document.addEventListener('touchmove', this.handleTouchMove);
		document.addEventListener('touchend', this.handleTouchEnd);

		this.reset();
	};

	this.onKeyUp = function(event) {

		if (event.key == KEY_DOWN) {
			tetris.isDownPressed = false;
		}
		else if (event.key == KEY_ROTATE) {
			tetris.isRotatePressed = false;
		}
		else if (event.key == KEY_LEFT) {
			tetris.isLeftPressed = false;
		}
		else if (event.key == KEY_RIGHT) {
			tetris.isRightPressed = false;
		}
		tetris.keyboardDelay = 0;
	};

	this.onKeyDown = function(event) {

		if (event.key == KEY_DOWN) {
			tetris.isDownPressed = true;
		}
		else if (event.key == KEY_ROTATE) {
			tetris.isRotatePressed = true;
		}
		else if (event.key == KEY_LEFT) {
			tetris.isLeftPressed = true;
		}
		else if (event.key == KEY_RIGHT) {
			tetris.isRightPressed = true;
		}
		tetris.keyboardDelay = 0;
	};

	this.handleTouchStart = function(event) {
		tetris.xTouchStart = event.changedTouches[0].clientX;
		tetris.yTouchStart = event.changedTouches[0].clientY;
	};

	this.handleTouchMove = function(event) {
		event.preventDefault();
	};

	this.handleTouchEnd = function(event) {
   		var xTouchEnd = event.changedTouches[0].clientX;                                    
    	var yTouchEnd = event.changedTouches[0].clientY;
    	var xDelta = xTouchEnd - tetris.xTouchStart;
    	var yDelta = yTouchEnd - tetris.yTouchStart;

    	if (Math.abs(xDelta) > Math.abs(yDelta)) {
    		// Horizontal swipe
    		if (xDelta > 0) {
    			tetris.moveRight();
    		} else {
    			tetris.moveLeft();
    		}
    	} else {
    		// vertical swipe
    		if (yDelta > 0) {
    			tetris.moveDown();
    		} else {
    			tetris.rotate();
    		}
    	}
	};

	this.togglePaused = function() {
		this.setPaused(!this.isPaused);
	};

	this.setPaused = function(value) {
		this.isPaused = value;
		this.pauseButton.innerHTML = this.isPaused ? "Resume" : "Pause";
	};

	this.reset = function() {
		this.lines = 0;
		this.level = 0
		this.score = 0;
		this.speed = data.levels[this.level].speed;
		this.isGameOver = false;
		this.setPaused(false);
		this.upNext = Math.floor(Math.random() * data.pieces.length);
		this.fallingPiece = null;

		this.hasDrawnText = false;

		// Initialize board with empty squares
		for (var i = 0; i < data.numCols; i++) {
			this.board[i] = [];
			for (var j = 0; j<data.numRows; j++) {
				this.board[i][j] = new Square(i, j);
			}
		}
	};

	this.canMove = function (piece, colDiff, rowDiff) {

		if (!piece) {
			return;
		}

		for (var i = 0; i < piece.squares.length; i++) {

			var square = piece.squares[i];
			// check if spot on board is already taken (or out of bounds)
			var newCol = square.col + colDiff;
			var newRow = square.row + rowDiff;
			if (newCol < 0 || newCol >= data.numCols) {
				return false;
			}
			if (newRow < 0 || newRow >= data.numRows) {
				return false;
			}
			if (!tetris.board[newCol][newRow].isEmpty && !piece.containsSquare(newCol, newRow)) {
				return false;
			}
		}
		return true;
	};

	this.canRotate = function(piece) {

		if (!piece) {
			return;
		}

		if (!piece.origin) {
			return; // square has no origin cant rotate
		}

		for (var i = 0; i < piece.squares.length; i++){

			var square = piece.squares[i];

			// Subtract the origin
			var col =  square.col - piece.origin.col;
			var row = square.row - piece.origin.row;

			// Flip sign of row
			row = -row;

			var temp = col;
			col = -row;
			row = temp;

			// Flip row back
			row = -row;

			// Add origin offset back
			col += piece.origin.col;
			row += piece.origin.row;

			if (col < 0 || col >= data.numCols) {
				return false;
			}
			if (row < 0 || row >= data.numRows) {
				return false;
			}
			if (!tetris.board[col][row].isEmpty && !piece.containsSquare(col, row)) {
				return false;
			}
		}
		return true;
	};

	this.checkForGameOver = function() {
		if (this.fallingPiece) {
			return; // Don't check for game over while a piece is falling
		}

		var topRow = 3; // The first 4 rows are where we spawn the pieces.  Check the 4th row
		for (var col=0; col < data.numCols; col++) {
			if (!this.board[col][topRow].isEmpty) {
				this.isGameOver = true;
			}
		}
	};

	this.checkForLines = function() {
		if (this.fallingPiece) {
			return; // Don't check for lines while a piece is falling
		}

		var lines = [];

		for (var row = 0; row<data.numRows; row++) {
			var isLine = true;
			for (var col=0; col < data.numCols; col++) {
				if (this.board[col][row].isEmpty) {
					isLine = false;
				}
			}
			if (isLine == true) {
				lines.push(row);
			}
		}

		for (var i =0; i < lines.length; i++) {
			this.lines++;
			this.clearRow(lines[i]);

			var levelObject = data.levels[tetris.level];
			// Increment score
			this.score += levelObject.scorePerLine;

			// Check for level up
			if (levelObject.maxLines > 0 && tetris.lines > levelObject.maxLines) {
				tetris.level++;
				tetris.speed = levelObject.speed;
			}
		}

		// Bonus for getting a tetris
		if (lines.length == 4) {
			this.score += data.tetrisBonus;
		}
	};

	// Delete a row, and move all rows above down
	this.clearRow = function(rowToDelete) {

		for (var row = rowToDelete; row >= 0; row--) {
			for (var col=0; col < data.numCols; col++) {

				if (row == rowToDelete) {
					// Delete the selected row
					this.board[col][row].clear()
				} else {
					// Move all rows above that row down one
					this.board[col][row + 1].isEmpty = this.board[col][row].isEmpty;
					this.board[col][row + 1].color = this.board[col][row].color;
					this.board[col][row].clear()
				}				
			}
		}
	};

	this.drawText = function(text, ctx) {
		if (!tetris.hasDrawnText) {
			ctx.font = "30px Arial";
			ctx.fillStyle = "#101d1b";
			ctx.textAlign = "center";
			ctx.fillText(text,150,50);
			tetris.hasDrawnText = true;
		}
	};

	this.onFrame = function() {

		var needsRedraw = false;

		if (tetris.isGameOver) {
			tetris.drawText("GAME OVER", tetris.ctx);
			return;
		}

		if (tetris.isPaused) {
			tetris.drawText("PAUSED", tetris.ctx);
			return;
		}

		// First - check if it's time to move the piece down
		if (tetris.updateCounter <= 0) {
			needsRedraw = true;
			tetris.updateCounter = tetris.speed;

			if (tetris.fallingPiece == null) {
				// Add a new falling piece
				var type = tetris.upNext;
				tetris.upNext = Math.floor(Math.random() * data.pieces.length);
				tetris.fallingPiece = new Piece(type);
				tetris.drawUpNext();
			} else {

				if (!tetris.moveDown()) {
					// The piece is placed
					// New Piece will be created on next update
					tetris.fallingPiece = null;

					// Check for lines
					tetris.checkForLines();

					tetris.checkForGameOver();
				}
			}
		} else {
			tetris.updateCounter--;
		}

		// Next handle keypresses
		if (tetris.keyboardDelay < 1) {
			if (tetris.isDownPressed) {
				tetris.moveDown();
				needsRedraw = true;
			}
			if (tetris.isRightPressed) {
				tetris.moveRight();
				needsRedraw = true;
			}
			if (tetris.isLeftPressed) {
				tetris.moveLeft();
				needsRedraw = true;
			}
			if (tetris.isRotatePressed) {
				tetris.rotate();
				needsRedraw = true;
			}
			tetris.keyboardDelay = data.keyboardDelay;
		}
		else {
			tetris.keyboardDelay--;
		}

		// Finally, Draw the board if needed
		var numInvisibleRows = 4;
		if (needsRedraw) {

			tetris.hasDrawnText = false; // If we've got here then there's no text

			// Draw the board
			for (var i = 0; i < data.numCols; i++) {
				for (var j = numInvisibleRows - 1; j<data.numRows; j++) {
					var x = i * tetris.squareSize;
					var y = (j - numInvisibleRows) * tetris.squareSize;
					tetris.drawSquare(x, y, tetris.board[i][j].color, tetris.board[i][j].isEmpty, tetris.ctx);
				}
			}

			// Update the score elements
			tetris.linesLabel.innerHTML = tetris.lines;
			tetris.levelLabel.innerHTML = tetris.level + 1;
			tetris.scoreLabel.innerHTML = tetris.score;
		}
	};

	this.drawUpNext = function() {
		var context = tetris.upNextCanvas.getContext("2d");
		for (var i = 0; i < 4; i++) {
			for (var j = 0; j< 4; j++) {

				var x = i * tetris.squareSize;
				var y = j * tetris.squareSize;

				var piece = data.pieces[tetris.upNext];
				var color = data.upNextBackgroundColor;
				var isEmpty = true;
				if (piece.squares[j][i] > 0) {
					isEmpty = false;
					color = piece.color;
				}
				tetris.drawSquare(x, y, color, isEmpty, context);
			}
		}
	};

	this.drawSquare = function(x, y, color, isEmpty, ctx) {

		ctx.fillStyle = color;
		ctx.fillRect(x,y,tetris.squareSize,tetris.squareSize);

		if (!isEmpty) {
			var bezelSize = tetris.squareSize * 0.1;
			
			// Top (light)
			ctx.fillStyle = "rgba(255, 255, 255, 0.4)";	
			ctx.moveTo(x, y);
			ctx.beginPath();
			ctx.lineTo(x + bezelSize, y+bezelSize);
			ctx.lineTo(x + tetris.squareSize - bezelSize, y + bezelSize);
			ctx.lineTo(x + tetris.squareSize, y);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.fill();

			// Right side
			ctx.fillStyle = "rgba(150, 150, 150, 0.4)";
			ctx.moveTo(x + tetris.squareSize, y);
			ctx.beginPath();
			ctx.lineTo(x + tetris.squareSize - bezelSize, y+bezelSize);
			ctx.lineTo(x + tetris.squareSize - bezelSize, y + tetris.squareSize - bezelSize);
			ctx.lineTo(x + tetris.squareSize, y + tetris.squareSize);
			ctx.lineTo(x + tetris.squareSize, y);
			ctx.closePath();
			ctx.fill();

			// Bottom (darkest)
			ctx.fillStyle = "rgba(50, 50, 50, 0.4)";
			ctx.moveTo(x, y + tetris.squareSize);
			ctx.beginPath();
			ctx.lineTo(x + bezelSize, y + tetris.squareSize - bezelSize);
			ctx.lineTo(x + tetris.squareSize + bezelSize, y + tetris.squareSize - bezelSize);
			ctx.lineTo(x + tetris.squareSize, y + tetris.squareSize);
			ctx.lineTo(x, y + tetris.squareSize);
			ctx.closePath();
			ctx.fill();

		}
		ctx.moveTo(0,0);
	};

	this.moveDown = function() {
		if (tetris.canMove(tetris.fallingPiece, 0, 1)) {
			tetris.fallingPiece.move(0, 1);
			return true;
		} 
		return false;
	};

	this.moveLeft = function() {
		if (tetris.canMove(tetris.fallingPiece, -1, 0)) {
			tetris.fallingPiece.move(-1, 0);
			return true;
		} 
		return false;
	};

	this.moveRight = function() {
		if (tetris.canMove(tetris.fallingPiece, 1, 0)) {
			tetris.fallingPiece.move(1, 0);
			return true;
		} 
		return false;
	};

	this.rotate = function() {
		if (tetris.canRotate(tetris.fallingPiece)) {
			tetris.fallingPiece.rotate();
			return true;
		}
		return false;
	};

	function Square(col, row) {
		this.row = row;
		this.col = col;

		this.clear = function() {
			this.isEmpty = true;
			this.color = data.backgroundColor;
		};
		this.clear();
	}

	function Piece(type) {

		// The point that the piece rotates around
		this.origin = null;

		// The squares on the board
		this.squares = [];


		// The first four rows of the board aren't drawn. Add the piece here
		var startingColumn = 3;
		for (var row = 0; row < 4; row ++) {
			for (var col = 0; col < 4; col++) {

				if (data.pieces[type]["squares"][row][col] > 0) {
					this.squares.push(tetris.board[startingColumn + col][row]);
				}

				if (data.pieces[type]["squares"][row][col] == 2) {
					this.origin = {};
					this.origin.col = startingColumn + col;
					this.origin.row = row;
				}
			}
		}
		this.color = data.pieces[type]["color"];

		// Update the board with this piece
		for (var i = 0; i < this.squares.length; i++){
			this.squares[i].isEmpty = false;
			this.squares[i].color = this.color;
		}

		this.containsSquare = function(col, row) {
			for (var i = 0; i < this.squares.length; i++){
				if (this.squares[i].col == col && this.squares[i].row == row) {
					return true;
				}
			}
			return false;
		};

		this.rotate = function() {

			// clear out the existing squares
			for (var i = 0; i < this.squares.length; i++){
				this.squares[i].clear();
			}

			var newSquares = [];

			for (var i = 0; i < this.squares.length; i++) {
				var square = this.squares[i];

				// Subtract the origin
				var col =  square.col - this.origin.col;
				var row = square.row - this.origin.row;

				// Flip sign of row
				row = -row;

				var temp = col;
				col = -row;
				row = temp;

				// Flip row back
				row = -row;

				// Add origin offset back
				col += this.origin.col;
				row += this.origin.row;

				newSquares[i] = tetris.board[col][row];
				newSquares[i].isEmpty = false;
				newSquares[i].color = this.color;
			}
			this.squares = newSquares;
		};

		this.move = function(colDelta, rowDelta) {
			
			// clear out the existing squares
			for (var i = 0; i < this.squares.length; i++){
				this.squares[i].clear();
			}

			// Move each square my the delta
			for (var i = 0; i < this.squares.length; i++){
				var oldSquare = this.squares[i];
				var row = oldSquare.row + rowDelta;
				var col = oldSquare.col + colDelta;
				this.squares[i] = tetris.board[col][row];
				this.squares[i].isEmpty = false;
				this.squares[i].color = this.color;
			}

			// Adjust the origin
			if (this.origin) {
				this.origin.col += colDelta;
				this.origin.row += rowDelta;
			}
		};
	}
};

// Global
var tetris = new Tetris();

function start() {
	tetris.init();
};