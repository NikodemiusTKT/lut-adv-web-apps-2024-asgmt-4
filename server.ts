import express, {Express} from "express"
import path from "path"
import router from "./src/index"
import morgan from "morgan"

const app: Express = express()
const port = 8000

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(morgan("dev"))


app.use(express.static(path.join(__dirname, "../public")))
app.use("/", router)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)

})