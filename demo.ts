const db = await Deno.openKv()

// await db.set(["visits"], new Deno.KvU64(0n))

await db.atomic()
.sum(["visits"], 1n)
.commit()


const result = await db.get<Deno.KvU64>(["visits"])

console.log(result.value)