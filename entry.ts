const db = await Deno.openKv()
const entries = db.list({ prefix: ["preferences"]}) // podemos listar todas las keys que empiecen con preferences

for await (const entry of entries)

console.log(entry)

await db.delete(["preferences", "gabriel"])