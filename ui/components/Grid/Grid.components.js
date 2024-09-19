import { MOVING_DIRECTIONS } from '../../../core/constants.js'
import {
	getGridSize,
	movePlayer,
	subscribe,
	unSubscribe,
} from '../../../core/state-manager.js'
import { CellComponent } from './cell/Cell.component.js'

export function GridComponent() {
	const element = document.createElement('table')
	const localeState = { cleanupFunctions: [] }

	const keyupObserver = e => {
		switch (e.code) {
			case 'ArrowUp':
				movePlayer(2, MOVING_DIRECTIONS.UP)
				break
			case 'ArrowDown':
				movePlayer(2, MOVING_DIRECTIONS.DOWN)
				break
			case 'ArrowRight':
				movePlayer(2, MOVING_DIRECTIONS.RIGHT)
				break
			case 'ArrowLeft':
				movePlayer(2, MOVING_DIRECTIONS.LEFT)
				break

			case 'KeyW':
				movePlayer(1, MOVING_DIRECTIONS.UP)
				break
			case 'KeyS':
				movePlayer(1, MOVING_DIRECTIONS.DOWN)
				break
			case 'KeyD':
				movePlayer(1, MOVING_DIRECTIONS.RIGHT)
				break
			case 'KeyA':
				movePlayer(1, MOVING_DIRECTIONS.LEFT)
				break
		}
	}

	document.addEventListener('keyup', keyupObserver)

	render(element, localeState)
	return {
		element,
		cleanUp: () => {
			localeState.cleanupFunctions.forEach(cf => cf())
			document.removeEventListener('keyup', keyupObserver)
		},
	}
}

async function render(element, localeState) {
	localeState.cleanupFunctions.forEach(cf => cf())
	localeState.cleanupFunctions = []

	element.innerHTML = ''
	const gridSize = await getGridSize()
	for (let y = 0; y < gridSize.rowsCount; y++) {
		const tr = document.createElement('tr')
		tr.classList = 'grid'

		for (let x = 0; x < gridSize.columnsCount; x++) {
			const td = CellComponent(x, y)
			localeState.cleanupFunctions.push(td.cleanUp)
			tr.appendChild(td.element)
		}
		element.append(tr)
	}
}
