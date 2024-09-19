import { start } from '../../../../core/state-manager.js'

export function StartComponent() {
	const element = document.createElement('div')
	render(element)
	return { element }
}

async function render(element) {
	const button = document.createElement('button')
	button.textContent = 'Start'
	button.addEventListener('click', () => {
		start()
	})
	element.append(button)
}
