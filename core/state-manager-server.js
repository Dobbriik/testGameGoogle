import { EVENTS, GAME_STATUSES, MOVING_DIRECTIONS } from './constants.js'

const _state = {
	gameStatus: GAME_STATUSES.SETTINGS,
	settings: {
		googleJumpInterval: 5000,
		gridSize: {
			rowsCount: 5,
			columnsCount: 5,
		},
		pointsToLose: 5,
		pointsToWin: 15,
	},
	position: {
		google: {
			x: 0,
			y: 0,
		},
		players: [
			{
				x: 0,
				y: 0,
			},
			{ x: 0, y: 0 },
		],
	},
	points: {
		google: 0,
		players: [0, 0],
	},
	winPlayerNumber: null,
}
// Observer
let _observer = []
export function subscribe(observer) {
	_observer.push(observer)
}
export function unSubscribe(observer) {
	_observer = _observer.filter(o => o !== observer)
}
function _notifyObserver(name, payload = {}) {
	const event = {
		name,
		payload,
	}
	_observer.forEach(o => {
		try {
			o(event)
		} catch (error) {
			console.log(error)
		}
	})
}

// COMMANDS/SETTERS
let googleJumpInterval
function _stopInterval() {
	clearInterval(googleJumpInterval)
}
function _startInterval() {
	googleJumpInterval = setInterval(() => {
		const oldPosition = { ..._state.position.google } // сейвим позицию
		_jumpGoogleToNewPosition() // гугл прыгает
		_notifyObserver(EVENTS.GOOGLE_JUMPED, {
			oldPosition,
			newPosition: { ..._state.position.google }, // передаём новую и старую позицию
		})

		_notifyObserver(EVENTS.GOOGLE_RUN_AWAY)
		_state.points.google++

		_notifyObserver(EVENTS.SCORES_CHANGED)

		if (_state.points.google == _state.settings.pointsToLose) {
			clearInterval(googleJumpInterval) // STOP INTERVAL гугл победил
			_state.gameStatus = GAME_STATUSES.LOSE
			_notifyObserver(EVENTS.STATUS_CHANGED)
		}
	}, _state.settings.googleJumpInterval)
}

export async function start() {
	_state.winPlayerNumber = 0

	try {
		if (_state.gameStatus !== GAME_STATUSES.SETTINGS) {
			throw new Error('Incorrect game status to start')
		}
	} catch (error) {
		console.log('Incorrect game status to start')
		return
	}
	_state.position.players[0] = {
		x: 0,
		y: _state.settings.gridSize.rowsCount - 1,
	}
	_state.position.players[1] = {
		x: _state.settings.gridSize.columnsCount - 1,
		y: _state.settings.gridSize.rowsCount - 1,
	}

	_jumpGoogleToNewPosition()

	_state.points.google = 0
	_state.points.players = [0, 0]

	_startInterval()

	_state.gameStatus = GAME_STATUSES.IN_PROGRESS
	_notifyObserver(EVENTS.STATUS_CHANGED)
}
export async function playAgain() {
	_state.gameStatus = GAME_STATUSES.SETTINGS
	_notifyObserver(EVENTS.STATUS_CHANGED)
}
export async function movePlayer(playerNumber, direction) {
	if (_state.gameStatus !== GAME_STATUSES.IN_PROGRESS) {
		console.warn(
			`You can move player when game status - ${GAME_STATUSES.IN_PROGRESS},: your status ${_state.gameStatus}`
		)
		return
	}

	const playerIndex = _getIndexPlayer(playerNumber)
	const oldPosition = { ..._state.position.players[playerIndex] }
	const newPosition = { ..._state.position.players[playerIndex] }

	switch (direction) {
		case MOVING_DIRECTIONS.UP:
			newPosition.y--
			break
		case MOVING_DIRECTIONS.DOWN:
			newPosition.y++
			break
		case MOVING_DIRECTIONS.LEFT:
			newPosition.x--
			break
		case MOVING_DIRECTIONS.RIGHT:
			newPosition.x++
			break
	}

	const isValidRange = _isPositionInValidRange(newPosition)
	if (!isValidRange) return

	const isPlayer1PositionTheSame =
		_doesPositionMathWithPlayer1Position(newPosition)
	if (isPlayer1PositionTheSame) return

	const isPlayer2PositionTheSame =
		_doesPositionMathWithPlayer2Position(newPosition)
	if (isPlayer2PositionTheSame) return

	const isGooglePositionTheSame = _checkGooglePosition(newPosition)
	if (isGooglePositionTheSame) {
		_catchGoogle(playerNumber)
	}

	_state.position.players[playerIndex] = newPosition
	_notifyObserver(EVENTS[`PLAYER${playerNumber}_MOVED`], {
		oldPosition: oldPosition,
		newPosition: newPosition,
	})
}

//private function
function _isPositionInValidRange(position) {
	if (position.x < 0 || position.x >= _state.settings.gridSize.columnsCount)
		return false
	if (position.y < 0 || position.y >= _state.settings.gridSize.rowsCount)
		return false
	return true
}
function _doesPositionMathWithPlayer1Position(newPosition) {
	return (
		newPosition.x === _state.position.players[0].x &&
		newPosition.y === _state.position.players[0].y
	)
}
function _doesPositionMathWithPlayer2Position(newPosition) {
	return (
		newPosition.x === _state.position.players[1].x &&
		newPosition.y === _state.position.players[1].y
	)
}
function _checkGooglePosition(newPosition) {
	return (
		newPosition.x === _state.position.google.x &&
		newPosition.y === _state.position.google.y
	)
}
let timerCatch = false
function _catchGoogle(playerNumber) {
	timerCatch = false
	setTimeout(() => {
		timerCatch = true
	}, _state.settings.googleJumpInterval)
	const playerIndex = _getIndexPlayer(playerNumber)
	_state.points.players[playerIndex]++
	_notifyObserver(EVENTS.SCORES_CHANGED)
	_notifyObserver(EVENTS.GOOGLE_CAUGHT)

	if (_state.points.players[playerIndex] === _state.settings.pointsToWin) {
		_state.winPlayerNumber = playerNumber
		_state.gameStatus = GAME_STATUSES.WIN
		_notifyObserver(EVENTS.STATUS_CHANGED)
		clearInterval(googleJumpInterval)
	} else {
		const oldPosition = { ..._state.position.google }
		_jumpGoogleToNewPosition()
		_stopInterval()
		_startInterval()
		_notifyObserver(EVENTS.GOOGLE_JUMPED, {
			oldPosition,
			newPosition: { ..._state.position.google },
		})
	}
}

function _generateNewNumber(first, last) {
	return Math.floor(Math.random() * last + first)
}
function _getIndexPlayer(playerNumber) {
	const playerIndex = playerNumber - 1
	if (playerIndex < 0 || playerIndex > _state.points.players.length - 1) {
		throw new Error('Ошибка индекса игрока')
	}
	return playerIndex
}
function _jumpGoogleToNewPosition() {
	const newPosition = { ..._state.position.google }

	do {
		newPosition.x = _generateNewNumber(0, _state.settings.gridSize.columnsCount)
		newPosition.y = _generateNewNumber(0, _state.settings.gridSize.rowsCount)
	} while (
		_checkGooglePosition(newPosition) ||
		_doesPositionMathWithPlayer1Position(newPosition) ||
		_doesPositionMathWithPlayer2Position(newPosition)
	)
	{
		_state.position.google = newPosition
	}
}

//GETTERS/SELECTORS
export async function getGooglePoints() {
	return _state.points.google
}
/**
 *
 * @param {number} playerNumber - one-based index of player
 * @returns {Promise<number>} number of points
 */
export async function getPlayerPoints(playerNumber) {
	const playerIndex = _getIndexPlayer(playerNumber)
	return _state.points.players[playerIndex]
}
/**
 *
 * @param {} ()
 * @returns {object} get object sizeGrid with  rowsCount and columnsCount
 */
export async function getGridSize() {
	return { ..._state.settings.gridSize }
}
/**
 *
 * @returns object - google position
 */
export async function getGooglePositions() {
	return { ..._state.position.google }
}
/**
 *
 * @returns object - players position
 */
export async function getPlayersPositions(playerNumber) {
	const playerIndex = _getIndexPlayer(playerNumber)
	return { ..._state.position.players[playerIndex] }
}
export async function getGameStatus() {
	return _state.gameStatus
}

export async function getWinPlayer() {
	return _state.winPlayerNumber
}
