// EventSource

const eventSource = new EventSource('http://newtestdomen.ddns.net:3000/events')
eventSource.addEventListener('message', ese => {
	const event = JSON.parse(ese.data)
	_notifyObserver(event.name, event.payload)
})

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
export async function start() {
	fetch('http://newtestdomen.ddns.net:3000/start')
}
export async function playAgain() {
	fetch('http://newtestdomen.ddns.net:3000/playAgain')
}
export async function movePlayer(playerNumber, direction) {
	await fetch(
		`http://newtestdomen.ddns.net:3000/movePlayer?playerNumber=${playerNumber}&direction=${direction}`
	)
}

//GETTERS/SELECTORS
export async function getGooglePoints() {
	const response = await fetch(
		'http://newtestdomen.ddns.net:3000/getGooglePoints'
	)
	const responsePayload = await response.json()
	return responsePayload.data
}
export async function getPlayerPoints(playerNumber) {
	const response = await fetch(
		`http://newtestdomen.ddns.net:3000/getPlayerPoints?playerNumber=` +
			playerNumber
	)
	const responsePayload = await response.json()
	return responsePayload.data
}
export async function getGridSize() {
	const response = await fetch('http://newtestdomen.ddns.net:3000/getGridSize')
	const responsePayload = await response.json()
	return responsePayload.data
}
export async function getGooglePositions() {
	const response = await fetch(
		'http://newtestdomen.ddns.net:3000/getGooglePositions'
	)
	const responsePayload = await response.json()
	return responsePayload.data
}
export async function getPlayersPositions(playerNumber) {
	const response = await fetch(
		`http://newtestdomen.ddns.net:3000/getPlayersPositions?playerNumber=` +
			playerNumber
	)
	const responsePayload = await response.json()
	return responsePayload.data
}
export async function getGameStatus() {
	const response = await fetch(
		'http://newtestdomen.ddns.net:3000/getGameStatus'
	)
	const responsePayload = await response.json()
	return responsePayload.data
}
export async function getWinPlayer() {
	const response = await fetch('http://newtestdomen.ddns.net:3000/getWinPlayer')
	const responsePayload = await response.json()
	return responsePayload.data
}
