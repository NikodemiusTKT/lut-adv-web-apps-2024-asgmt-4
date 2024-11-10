import {Request, Response, Router} from "express"
import fs from "fs"
import { compile } from "morgan"

const router: Router = Router()

let poems: string[] = []

fs.readFile("data/poems.json", "utf8", (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
        console.error(err)
        return
    }
    try {
        poems = JSON.parse(data)
    } catch (error: any) {
        console.error(`Error parsing JSON: ${error}`)
    }
})

router.get("/", (req: Request, res: Response) => {
    res.json(poems)
})

router.get("/:id", (req: Request, res: Response) => {
    let id: number = parseInt(req.params.id)
    try{
        res.json(poems[id])
    } catch (error: any) {
        console.error(`Error parsing JSON: ${error}`)
    }
   
})

router.post("/:id", (req: Request, res: Response) => {
    let poem: string = req.body
    console.log(poem)
    poems.push(poem)

    fs.writeFile("data/poems.json", JSON.stringify(poems), (err: NodeJS.ErrnoException | null) => {
        if (err) {
            console.error(err)
            return
        }
        res.json(poems)

    })
    
})



export default router