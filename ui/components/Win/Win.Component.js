import { getWinPlayer, playAgain } from '../../../core/state-manager.js'

export function WinComponent() {
	const element = document.createElement('div')
	render(element)
	return { element }
}

async function render(element) {
	const button = document.createElement('button')
	button.textContent = 'Play again'
	button.addEventListener('click', () => {
		playAgain()
	})
	const winPayerNumber = await getWinPlayer()
	element.append(`Player ${winPayerNumber} win, Google Lose!`, button)
}
