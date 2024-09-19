import { EVENTS } from '../../../../core/constants.js'
import {
	getGooglePositions,
	getPlayersPositions,
	subscribe,
	unSubscribe,
} from '../../../../core/state-manager.js'
import { GoogleComponent } from '../../common/Google/Google.component.js'
import { PlayerComponent } from '../../common/Player/Player.component.js'

export function CellComponent(x, y) {
	const element = document.createElement('td')

	const localeState = { renderVersion: 0 }

	const observer = e => {
		if (
			[EVENTS.GOOGLE_JUMPED, EVENTS.PLAYER1_MOVED, EVENTS.PLAYER2_MOVED].every(
				name => name !== e.name
			)
		)
			return // stop function if do not jumped

		let oldP = e.payload.oldPosition
		let newP = e.payload.newPosition

		const oldPosEquality = oldP.x === x && oldP.y === y
		const newPosEquality = newP.x === x && newP.y === y

		if (!oldPosEquality && !newPosEquality) return

		render(element, x, y, localeState)
	}
	subscribe(observer)

	render(element, x, y, localeState)
	return {
		element,
		cleanUp: () => {
			unSubscribe(observer)
		},
	}
}

async function render(element, x, y, localeState) {
	localeState.renderVersion++
	const currentRenderVersion = localeState.renderVersion

	element.innerHTML = ''

	const googlePosition = await getGooglePositions()
	const player1Position = await getPlayersPositions(1)
	const player2Position = await getPlayersPositions(2)

	if (currentRenderVersion < localeState.renderVersion) {
		return
	}

	if (googlePosition.x === +x && googlePosition.y === +y) {
		element.append(GoogleComponent().element)
	} else if (player1Position.x === +x && player1Position.y === +y) {
		element.append(PlayerComponent(1).element)
	} else if (player2Position.x === +x && player2Position.y === +y) {
		element.append(PlayerComponent(2).element)
	} else {
		element.append('')
	}
}
