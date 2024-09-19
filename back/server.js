import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import {
	start,
	playAgain,
	movePlayer,
	getGridSize,
	getWinPlayer,
	getGameStatus,
	getGooglePoints,
	getPlayerPoints,
	getGooglePositions,
	getPlayersPositions,
	subscribe,
	unSubscribe,
} from '../core/state-manager-server.js'

const functions = {
	start,
	playAgain,
	movePlayer,
	getGridSize,
	getWinPlayer,
	getGameStatus,
	getGooglePoints,
	getPlayerPoints,
	getGooglePositions,
	getPlayersPositions,
}

const app = express()
app.use(cors())
const PORT = process.env.PORT || 3000
const hostname = '0.0.0.0'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
console.log(__filename)
console.log(__dirname)

app.use(express.static(path.join(__dirname, '..', 'ui')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'ui', 'index.html'))
})

app.get('/core/constants.js', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'core', 'constants.js'))
})

app.get('/core/state-manager.js', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'core', 'state-manager.js'))
})

app.get('/events', (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Connection', 'keep-alive')

	const observer = e => {
		res.write(`data: ${JSON.stringify(e)}\n\n`)
	}
	subscribe(observer)

	req.on('close', () => {
		unSubscribe(observer)
		res.end()
	})
})

app.get('/:functionName', async (req, res) => {
	let { ...queryParams } = req.query
	let functionName = req.params
	functionName = functionName.functionName
	if (functions[functionName]) {
		try {
			const result = await functions[functionName](
				queryParams.playerNumber,
				queryParams.direction
			)
			res.json({ data: result })
		} catch (error) {
			res.status(500).json({ error: error.message })
		}
	} else {
		res.status(404).json({ error: 'Function not found' })
	}
})

app.listen(PORT, hostname, () => {
	console.log(`Server is running on http://192.168.0.5:${PORT}`)
})
