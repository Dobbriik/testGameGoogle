export function PlayerComponent(num) {
	const element = document.createElement('img')
	render(element, num)
	return { element }
}

async function render(element, num) {
	element.src = `assets/images/player${num}.png`
}
