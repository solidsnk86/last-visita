import { Hono } from "https://deno.land/x/hono@v3.12.0/mod.ts"
import { serveStatic } from "https://deno.land/x/hono@v3.12.0/middleware.ts"
import { streamSSE } from "https://deno.land/x/hono@v3.12.0/helper/streaming/index.ts"

const db = await Deno.openKv()
const app = new Hono()
let i = 0
app.get('/', serveStatic({ path: './index.html' }))

app.post('/counter', async (c) => {
    await db.atomic().sum(["visits"], 1n).commit()
    return c.json({ message: 'ok' })
})

app.get('/counter', (c) => {
    return streamSSE(c, async (stream) => {
        while (true) {
            const message = `Son las ${new Date().toLocaleTimeString()}`
            await stream.writeSSE({ data: message, event: 'update', id: String(i++) })
            await stream.sleep(1000)
        }
    })
})


Deno.serve(app.fetch)