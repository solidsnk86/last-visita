const db = await Deno.openKv()

const [
    neoPreferences,
    gabrielPreferences,
    ]
    = await db.getMany([            // Con db.getMany([]) con una sola lectura conseguimos dos campos 
        ["preferences", "neo"],
        ["preferences", "gabriel"]
    ])

console.log(neoPreferences)
console.log(gabrielPreferences)