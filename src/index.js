import express from "express"
import { MainRouter } from "./routes/index.js"

const app = express()

app.use(express.json())
app.use(MainRouter)

const PORT = process.env.PORT || 3838

app.use((req, res) => {
    const method = req.method
    const url = req.url
    res.status(404).send(`Cannot ${method} ${url}`)
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})