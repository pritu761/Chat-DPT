import express from 'express'
import { generate } from './chatbot'
const app = express()
const port = 3000

app.use(express.json())

app.post("/chat",async(req,res) => {
    const { messages } = req.body

    console.log('Message', messages)
    const response = await generate(messages)
    res.json(response)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})