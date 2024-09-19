import { EVENTS } from '../../../core/constants.js'
import {
	getPlayerPoints,
	getGooglePoints,
	subscribe,
	unSubscribe,
} from '../../../core/state-manager.js'

export function ResultPanelComponent() {
	const element = document.createElement('div')
	element.classList.add('result-panel')

	const observer = e => {
		if (e.name !== EVENTS.SCORES_CHANGED) return
		render(element)
	}
	subscribe(observer)

	render(element)
	return {
		element,
		cleanUp: () => {
			unSubscribe(observer)
		},
	}
}

async function render(element) {
	element.innerHTML = ''

	const googlePoint = await getGooglePoints()
	const player1Points = await getPlayerPoints(1)
	const player2Points = await getPlayerPoints(2)

	element.innerHTML = `Player1: ${player1Points},Player2: ${player2Points},Google: ${googlePoint},`
}
