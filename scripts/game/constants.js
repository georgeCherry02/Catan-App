let hexToSettle = [
	['tl', 't', 'tr', 'bl', 'b', 'br'],
	/* First Row */
	[1, 2, 3, 9, 10, 11],
	[3, 4, 5, 11, 12, 13],
	[5, 6, 7, 13, 14, 15],
	/* Second Row */
	[8, 9, 10, 18, 20, 21],
	[10, 11, 12, 21, 22, 23],
	[12, 13, 14, 23, 24, 25],
	[14, 15, 16, 25, 26, 27],
	/* Third Row */
	[17, 18, 20, 19, 30, 31],
	[20, 21, 22, 31, 33, 34],
	[22, 23, 24, 34, 35, 36],
	[24, 25, 26, 36, 37, 38],
	[26, 27, 28, 38, 39, 29],
	/* Fourth Row */
	[30, 31, 33, 32, 41, 42],
	[33, 34, 35, 42, 45, 46],
	[35, 36, 37, 46, 49, 50],
	[37, 38, 39, 50, 51, 40],
	/* Fifth Row */
	[41, 42, 45, 43, 44, 47],
	[45, 46, 49, 47, 48, 52],
	[49, 50, 51, 52, 53, 54]
];

let settleToHex = [
	['x'],
	/* 1-7 */
	[1],
	[1],
	[1, 2],
	[2],
	[2, 3],
	[3],
	[3],
	/* 8-16 */
	[4],
	[1, 4],
	[1, 4, 5],
	[1, 2, 5],
	[2, 5, 6],
	[2, 3, 6],
	[3, 6, 7],
	[3, 7],
	[7],
	/* 17-29 */
	[8],
	[4, 8],
	[8],
	[4, 8, 9],
	[4, 5, 9],
	[5, 9, 10],
	[5, 6, 10],
	[6, 10, 11],
	[6, 7, 11],
	[7, 11, 12],
	[7, 12],
	[12],
	[12],
	/* 30-40 */
	[8, 13],
	[8, 9, 13],
	[13],
	[9, 13, 14],
	[9, 10, 14],
	[10, 14, 15],
	[10, 11, 15],
	[11, 15, 16],
	[11, 12, 16],
	[12, 16],
	[16],
	/* 41-54 */
	[13, 17],
	[13, 14, 17],
	[17],
	[17],
	[14, 17, 18],
	[14, 15, 18],
	[17, 18],
	[18],
	[15, 18, 19],
	[15, 16, 19],
	[16, 19],
	[18, 19],
	[19],
	[19]
];

let roadToSettle = [
	['x'],
	/* 1-10 */
	[1, 2],
	[2, 3],
	[1, 9],
	[3, 4],
	[4, 5],
	[3, 11],
	[5, 6],
	[6, 7],
	[5, 13],
	[7, 15],
	/* 11-23 */
	[8, 9],
	[9, 10],
	[8, 18],
	[10, 11],
	[11, 12],
	[10, 21],
	[12, 13],
	[13, 14],
	[12, 23],
	[14, 15],
	[15, 16],
	[14, 25],
	[16, 27],
	/* 24-41 */
	[17, 18],
	[18, 20],
	[17, 19],
	[19, 30],
	[20, 21],
	[21, 22],
	[20, 31],
	[22, 23],
	[23, 24],
	[22, 34],
	[24, 25],
	[25, 26],
	[24, 36],
	[26, 27],
	[27, 28],
	[26, 38],
	[28, 29],
	[29, 39],
	/* 42-56 */
	[30, 31],
	[31, 33],
	[30, 32],
	[32, 41],
	[33, 34],
	[34, 35],
	[33, 42],
	[35, 36],
	[36, 37],
	[35, 46],
	[37, 38],
	[38, 39],
	[37, 50],
	[39, 40],
	[40, 51],
	/* 57-72 */
	[41, 42],
	[42, 45],
	[41, 43],
	[43, 44],
	[44, 47],
	[45, 46],
	[46, 49],
	[45, 47],
	[47, 48],
	[48, 52],
	[49, 50],
	[50, 51],
	[49, 52],
	[51, 54],
	[52, 53],
	[53, 54]
];

let settleToRoad = [
	['x'],
	/* 1-7 */
	[1, 3],
	[1, 2],
	[2, 4, 6],
	[4, 5],
	[5, 7, 9],
	[7, 8],
	[8, 10],
	/* 8-16 */
	[11, 13],
	[3, 11, 12],
	[12, 14, 16],
	[6, 14, 15],
	[15, 17, 19],
	[9, 17, 18],
	[18, 20, 22],
	[10, 20, 21],
	[21, 23],
	/* 17-29 */
	[24, 26],
	[13, 24, 25],
	[26, 27],
	[25, 28, 30],
	[16, 28, 29],
	[29, 31, 33],
	[19, 31, 32],
	[32, 34, 36],
	[22, 34, 35],
	[35, 37, 39],
	[23, 37, 38],
	[38, 40],
	[40, 41],
	/* 30-40 */
	[27, 42, 44],
	[30, 42, 43],
	[44, 45],
	[43, 46, 48],
	[33, 46, 47],
	[47, 49, 51],
	[36, 49, 50],
	[50, 52, 54],
	[39, 52, 53],
	[41, 53, 55],
	[55, 56],
	/* 41-54 */
	[45, 57, 59],
	[48, 57, 58],
	[59, 60],
	[60, 61],
	[58, 62, 64],
	[51, 62, 63],
	[61, 64, 65],
	[65, 66],
	[63, 67, 69],
	[54, 67, 68],
	[56, 68, 70],
	[66, 69, 71],
	[71, 72],
	[70, 72]
];

let resTypes = ["wood", "brick", "sheep", "wheat", "ore"];

let cardTypes = ['Knight', 'Victory Point', 'Road Building', 'Monopoly', 'Year of Plenty'];

let colours = ['white', 'red', 'blue', 'yellow'];

let costs = {
	"road" : {
		"wood": 1, 
		"brick": 1
	},
	"settle": {
		"wood": 1,
		"brick": 1,
		"sheep": 1,
		"wheat": 1
	},
	"city": {
		"wheat": 2,
		"ore": 3
	},
	"card": {
		"sheep": 1,
		"wheat": 1,
		"ore": 1
	}
};
