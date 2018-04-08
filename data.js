function Data() {

	// The tetris pieces.  In the squares matrix 2 represents the origin of the piece
	this.pieces = [
		{
			"squares": [
				[0, 0, 1, 0],
				[0, 0, 1, 0],
				[0, 0, 2, 0],
				[0, 0, 1, 0],
			],
			"color":"#95a744"
		},
		{
			"squares": [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 2, 0, 0],
				[1, 1, 1, 0],
			],
			"color" : "#519596"
		},
		{
			"squares": [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[1, 2, 0, 0],
				[0, 1, 1, 0],
			],
			"color" : "#494365"
		},
		{
			"squares": [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 2, 1, 0],
				[1, 1, 0, 0],
			],
			"color" : "#80495b"
		},
		{
			"squares": [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 1, 1, 0],
				[0, 1, 1, 0],
			],
			"color" : "#3d4f40"
		},
		{
			"squares": [
				[0, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 2, 0, 0],
				[0, 1, 1, 0],
			],
			"color" : "#292e4b"
		},
		{
			"squares": [
				[0, 0, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 2, 0],
				[0, 1, 1, 0],
			],
			"color" : "#774f94"
		}
	];

	this.backgroundColor = "#ffffff";
	this.upNextBackgroundColor = "#d2d2d2";

	this.levels = [
		{
			"maxLines":4,
			"scorePerLine":10,
			"speed":10
		},
		{
			"maxLines":8,
			"scorePerLine":15,
			"speed":7
		},
		{
			"maxLines":16,
			"scorePerLine":20,
			"speed":4
		},
		{
			"maxLines":32,
			"scorePerLine":50,
			"speed":2
		},
		{
			"maxLines":-1,
			"scorePerLine":50,
			"speed":1
		}
	];

	// Number of points awarded for getting a "Tetris"
	this.tetrisBonus = 100;
	
	this.numCols = 10;

	// The first four rows are not drawn (where new pieces are spawned)
	this.numRows = 24;

	// Number of frames that must happen before handling keypress
	this.keyboardDelay = 3;

	this.fps = 30;
};
var data = new Data();
