// tic tac toe game
function TTTGame() {
	let playerOneCharacter = 'X';
	let playerTwoCharacter = 'O';

	this.board = new Array(9).fill(null);
	this.resetGame = () => this.board = this.board.map(tile => null);

	this.winingStrikePaths = {
		'strike-diagonal-left': 	[0, 4, 8],
		'strike-diagonal-right': 	[2, 4, 6],
		'vertical-left': 			[0, 3, 6],
		'vertical-middle': 			[1, 4, 7], 
		'vertical-right': 			[2, 5, 8],
		'horizontal-top': 			[0, 1, 2],
		'horizontal-middle': 		[3, 4, 5],
		'horizontal-bottom': 		[6, 7, 8]
	}

	Object.defineProperty(this, 'allCharacters', {
		get: () => {
			return {
				defaultX: '❌',
				defaultO: '⭕',
				face1: '😕',
				face3: '😝',
				yawnFace: '🥱',
				devilSmerk: '😈',
				water: '💧',
				fire: '🔥',
				death: '☠'
			}
		}
	})

	//this.getWinningInfo = () => winningInfo;
	this.getWinningInfo = () => {
		for (const path in this.winingStrikePaths) {
			const [a, b, c] = this.winingStrikePaths[path];
			if (this.board[a] &&
				this.board[a] === this.board[b] && 
				this.board[a] === this.board[c]) 
			{
				return {
					path,
					character: this.board[a],
				};
			}
		}
	};

	this.setPlayerCharacter = (player, character) => {
		if (player === 1) 
			playerOneCharacter = character
		else
			playerTwoCharacter = character
	}

	this.getPlayerCharacter = (player) => {
		return player === 1 ? playerOneCharacter : playerTwoCharacter
	}
	
	this.handlePlayerMove = (player=1, boardPosition) => {
		if (player === 1) 
			this.board[boardPosition] = playerOneCharacter;
		else
			this.board[boardPosition] = playerTwoCharacter;
	}

	this.didPlayerWin = (player) => {
		const character = player === 1 ? playerOneCharacter : playerTwoCharacter
		for (const path in this.winingStrikePaths) {
			const [a, b, c] = this.winingStrikePaths[path];
			if (this.board[a] === character &&
				this.board[a] === this.board[b] && 
				this.board[a] === this.board[c]) 
			{
				return true;
			}
		}
		return false
	}

	this.didGameTie = () => {
		if (this.didPlayerWin(1) || this.didPlayerWin(2)) return false
		return this.board.some(position => position === null) ? false : true
	}
}


/// tic tac toe game bot
function TTTBot() {
	let botPlayer = 2
	let opponentPlayer = 1
	let difficultyLevel = 3

	Object.defineProperty(this, 'configuration', {
		get: () => `\n
		BOT PLAYER = ${botPlayer} 
		OPPONENT PlAYER = ${opponentPlayer} 
		DIFFICULTY LEVEL = ${difficultyLevel}
		`
	})

	this.setDifficultyLevel = (level) => {
		if (level > 3 || level < 1) return
		difficultyLevel = level
	}

	this.getMove = (TTTGameInstance, botAsPlayer=2) => {
		botPlayer = botAsPlayer
		opponentPlayer = botAsPlayer === 1 ? 2 : 1

		if (difficultyLevel === 1) 
			return playDumb(TTTGameInstance);
		else if (difficultyLevel === 2) 
			return playSmart(TTTGameInstance);
		else if (difficultyLevel === 3) 
			return playDecisionAI(TTTGameInstance);
	}

	const playDumb = (game) => {
		const availablePositions = game.board
			.map((character, index) => character === null ? index : false)
			.filter(index => index);
		const randomIndex = Math.floor(Math.random() * (availablePositions.length - 1));
		return availablePositions[randomIndex];
	}

	const playSmart = (game) => {
		return playDumb(game);
	}

	const playDecisionAI = (game) => {
		if (game.board.every(tile => tile === null)) return 0;

		let bestGameStateScore = -Infinity;
		let bestBoardPosition = playDumb(game);

		for (let i=0; i<game.board.length; i++) {
			if (game.board[i] === null) {
				game.handlePlayerMove(botPlayer, i);
				let currentGameStateScore = minimax(game, isMaximizerTurn=false);
				game.board[i] = null // undo playermove

				if (currentGameStateScore > bestGameStateScore) {
					bestBoardPosition = i;
					bestGameStateScore = currentGameStateScore;
				}
			}
		}

		return bestBoardPosition;
	}

	const minimax = (futureGameState, isMaximizerTurn) => {
		if (futureGameState.didGameTie()) return 0
		if (futureGameState.didPlayerWin(botPlayer)) return 1
		if (futureGameState.didPlayerWin(opponentPlayer)) return -1

		let bestGameStateScore = isMaximizerTurn ? -Infinity : Infinity;

		if (isMaximizerTurn) {
			for (let i=0; i<futureGameState.board.length; i++) {
				if (futureGameState.board[i] === null) {
					futureGameState.handlePlayerMove(botPlayer, i)
					let score = minimax(futureGameState, false);
					futureGameState.board[i] = null

					if (score > bestGameStateScore) {
						bestGameStateScore = score;
					}
				}
			}
		} else {
			for (let i=0; i<futureGameState.board.length; i++) {
				if (futureGameState.board[i] === null) {
					futureGameState.handlePlayerMove(opponentPlayer, i)
					let score = minimax(futureGameState, true);
					futureGameState.board[i] = null

					if (score < bestGameStateScore) {
						bestGameStateScore = score;
					}
				}
			}
		}

		return bestGameStateScore
	}
}

/*(function simulateGame() {
	const testGame = new TTTGame();
	const testGameBot = new TTTBot();

	console.log('bot info', testGameBot.configuration)

	testGame.handlePlayerMove(player=1, 8)
	console.log('--normal game board', testGame.board)

	testGame.handlePlayerMove(player=2, testGameBot.getMove(testGame));
	console.log('--normal game board', testGame.board)

	testGame.handlePlayerMove(player=1, 7)
	console.log('--normal game board', testGame.board)

	testGame.handlePlayerMove(player=2, testGameBot.getMove(testGame));
	console.log('--normal game board', testGame.board)

	// Leave a opening for bot to win
	
	testGame.handlePlayerMove(player=1, 0)
	console.log('--normal game board', testGame.board)

	testGame.handlePlayerMove(player=2, testGameBot.getMove(testGame));
	console.log('--normal game board', testGame.board)
	
	// Comment out other moves below

	testGame.handlePlayerMove(player=1, 2)
	console.log('--normal game board', testGame.board)

	testGame.handlePlayerMove(player=2, testGameBot.getMove(testGame));
	console.log('--normal game board', testGame.board)

	testGame.handlePlayerMove(player=1, 3)
	console.log('--normal game board', testGame.board)

	testGame.handlePlayerMove(player=2, testGameBot.getMove(testGame));
	console.log('--normal game board', testGame.board)

	testGame.handlePlayerMove(player=1, 1)
	console.log('--normal game board', testGame.board)	
	
	if (testGame.didPlayerWin(1)) {
		console.log("\nPlayer 1 won")
	}
	if (testGame.didPlayerWin(2)) {
		console.log("\nPlayer 2 won")
	}
	if (testGame.didGameTie()) {
		console.log("\nGame was a Tie")
	} else {
		console.log('Game in Progress');
	}
})()*/


let gameSoundsOn;
let playerWhoMadeLastMove;
let tttUserSelectedPlayer;
let tttBotSelectedPlayer;

const tttUI 					= document.querySelector('.tic-tac-toe');
const tttSessionStatus 			= tttUI.querySelector('.tic-tac-toe__status');
const tttResetBtn 				= tttUI.querySelector('.tic-tac-toe__btn-quit');
const tttBoard 					= tttUI.querySelector('.tic-tac-toe__board');
const tttBoardTiles 			= tttUI.querySelectorAll('.tic-tac-toe__tile');
const tttUserSelect 			= tttUI.querySelector('.user-selected-player');
const tttBoardDefaultClasses 	= Array.from(tttBoard.classList).join(" ");

const tttGameSoundToggle = tttUI.querySelector('.tic-tac-toe__btn-sounds');
const tttTileClickedSFX = new Audio('assets/music/tic-tac-toe/click.wav');
const tttGameOverSFX = new Audio('assets/music/tic-tac-toe/over.wav');

tttUserSelectedPlayer	= Number(tttUserSelect.value);
tttBotSelectedPlayer = tttUserSelectedPlayer === 1 ? 2 : 1;

tttGameSoundToggle.addEventListener('click', toggleGameSoundsOn);
tttResetBtn.addEventListener('click', resetTTTGame);
tttUserSelect.addEventListener('input', setUsersPlayer);
tttBoardTiles.forEach((tile, tileIndex) => {
	tile.addEventListener('click', handleGameplay(tileIndex))
	tile.addEventListener('keydown', handleGameplay(tileIndex))
})

window.addEventListener('DOMContentLoaded', () => {
	updateStatus();
	updateBoardTiles();
	updateGameSoundsOn();
})

const tttLogic = new TTTGame();
tttLogic.setPlayerCharacter(1, tttLogic.allCharacters.defaultX)
tttLogic.setPlayerCharacter(2, tttLogic.allCharacters.face3)

const tttBot = new TTTBot();
//tttBot.setDifficultyLevel(1)

// VIEW FUNCTIONS
function toggleGameSoundsOn() {
	if (gameSoundsOn) {
		tttGameSoundToggle.setAttribute('arial-game-sounds-on', 'false');
		updateGameSoundsOn();
	} else {
		tttGameSoundToggle.setAttribute('arial-game-sounds-on', 'true');
		updateGameSoundsOn();
	}
}

function updateGameSoundsOn() {
	gameSoundsOn = tttGameSoundToggle.getAttribute('arial-game-sounds-on') === 'true' 
		? true : false;
}

function resetTTTGame() {
	tttLogic.resetGame();
	tttUserSelect.value = 1;
	playerWhoMadeLastMove = undefined;
	tttBoard.className = tttBoardDefaultClasses;
	tttBoardTiles[Math.floor(Math.random() * 8)].focus()
	setUsersPlayer()
	updateBoardTiles();
	updateStatus();
}

function isGameInSession() {
	if (tttLogic.didPlayerWin(1) || tttLogic.didPlayerWin(2) 
		|| tttLogic.didGameTie() || tttLogic.board.some(tile => tile))
		return true;
	return false;
}

function setUsersPlayer() {
	if(isGameInSession()) {
		tttUserSelect.value = tttUserSelectedPlayer;
	}
	else {
		tttUserSelectedPlayer = Number(tttUserSelect.value);
		tttBotSelectedPlayer = tttUserSelectedPlayer === 1 ? 2 : 1;
		tttBotSelectedPlayer === 1 && handleBotGamePlay();
	}
}

function getCurrentPlayerCharacter() {
	if (playerWhoMadeLastMove === tttUserSelectedPlayer)
		return tttLogic.getPlayerCharacter(tttBotSelectedPlayer);
	return tttLogic.getPlayerCharacter(tttUserSelectedPlayer);
}

function strikeOnBoard() {
	if (tttLogic.getWinningInfo()) {
		const path = tttLogic.getWinningInfo().path;
		tttBoard.className = `${tttBoardDefaultClasses} tic-tac-toe__board--${path}`;
	}
}

function updateBoardTiles() {
	tttBoardTiles.forEach((tile, index) => {
		tttBoardTiles[index].style.setProperty('--show-content', `"${tttLogic.board[index] || ''}"`);
		if (tttLogic.getWinningInfo()) {
			tttBoardTiles[index].style.setProperty('--hover-content', '');
		} else if (tttLogic.board[index] === null) {
			tttBoardTiles[index].style.setProperty('--hover-content', `'${getCurrentPlayerCharacter()}'`);
		} else {
			tttBoardTiles[index].style.setProperty('--hover-content', '');
		}
	})
}

function handleHumanGamePlay(userMoveIndex) {
	playerWhoMadeLastMove = tttUserSelectedPlayer;
	tttLogic.handlePlayerMove(player=tttUserSelectedPlayer, userMoveIndex);
	updateBoardTiles();
	strikeOnBoard();
	updateStatus();
}

function handleBotGamePlay() {
	tttBoard.style.setProperty('pointer-events', 'none'); //hide character on hover

	let botMoveIndex = tttBot.getMove(tttLogic, botAsPlayer=tttBotSelectedPlayer);
	let simulatedThinkingTime = Math.floor(Math.random() * 1500);
	playerWhoMadeLastMove = tttBotSelectedPlayer;
	tttLogic.handlePlayerMove(player=tttBotSelectedPlayer, botMoveIndex);
	setTimeout(() => {
		updateBoardTiles()
		strikeOnBoard();
		updateStatus();
		gameSoundsOn && tttTileClickedSFX.play();
		
		tttBoard.style.setProperty('pointer-events', 'auto'); //hide character on hover
	}, simulatedThinkingTime);

}

function handleGameplay(userMoveIndex) {
	return ({ keyCode: keyboardCode, type: eventType, target: tile }) => {
		if (eventType === 'click' || keyboardCode === 13) {
			if (tttLogic.board[userMoveIndex]) return

			if (tttLogic.didPlayerWin(tttBotSelectedPlayer) || tttLogic.didGameTie()) return
			handleHumanGamePlay(userMoveIndex);

			if (tttLogic.didPlayerWin(tttUserSelectedPlayer) || tttLogic.didGameTie()) return
			handleBotGamePlay();
		} 

		if (eventType === 'keydown') {
			// left
			if (userMoveIndex > 0 && keyboardCode === 37) 
				tile.previousElementSibling.focus()
			// right
			if (userMoveIndex < 8 && keyboardCode === 39) 
				tile.nextElementSibling.focus()
			// up
			if (userMoveIndex > 2 && keyboardCode === 38)
				tile.previousElementSibling.previousElementSibling
				.previousElementSibling.focus()
			// down
			if (userMoveIndex < 6 && keyboardCode === 40)
				tile.nextElementSibling.nextElementSibling
				.nextElementSibling.focus()
		}
	}
}

function updateStatus() {
	tttSessionStatus.innerHTML = "";
	let indicateStatus = document.createElement('span');
	indicateStatus.classList.add('indicate');

	if (tttLogic.board.every(tile => tile === null)) {
		indicateStatus.classList.add('info');
		indicateStatus.innerHTML = `awating PLAYER 1 move`;
	} else if (tttLogic.getWinningInfo()) {
		let { character } = tttLogic.getWinningInfo();
		indicateStatus.classList.add('warning');
		indicateStatus.innerHTML = `${character} PLAYER ${playerWhoMadeLastMove} Wins ${character}`;
		gameSoundsOn && tttGameOverSFX.play();
	} else if (tttLogic.didGameTie()){
		indicateStatus.classList.add('warning');
		indicateStatus.innerHTML = 'Game Tied!';
		gameSoundsOn && tttGameOverSFX.play();
	} else {
		indicateStatus.classList.add('primary');
		indicateStatus.innerHTML = `
		PLAYER ${playerWhoMadeLastMove === 1 ? 2 : 1} turn as ${getCurrentPlayerCharacter()}`;
		gameSoundsOn && tttTileClickedSFX.play();
	}

	tttSessionStatus.appendChild(indicateStatus)
}