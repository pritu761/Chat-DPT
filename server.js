import express from 'express'
import cors from 'cors'
import { generate } from './chatbot.js'
const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.post("/chat",async(req,res) => {
    try {
        const { messages , threadId} = req.body
        //todo validate above fields
        if(!messages || !threadId) {
           res.status(400).json({ error: 'Missing required fields' })
            return
        }
        console.log('Message received:', messages)
        const responseText = await generate(messages, threadId)
        res.json({ messages: [{ role: 'assistant', content: responseText }] })
    } catch (error) {
        console.error('Error in /chat:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
