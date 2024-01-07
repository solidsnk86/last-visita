import { Hono } from "https://deno.land/x/hono@v3.12.0/mod.ts";
import { cors, serveStatic } from "https://deno.land/x/hono@v3.12.0/middleware.ts";
import { streamSSE } from "https://deno.land/x/hono@v3.12.0/helper/streaming/index.ts"; // Server Side Events

const db = await Deno.openKv();
const app = new Hono();
let i = 0;

interface LastVisit {
  country: string;
  city: string;
  flag: string;
}

app.use(cors())
app.get("/", serveStatic({ path: "./index.html" }));

app.post("/visit", async (c) => {
  const { city, flag, country } = await c.req.json<LastVisit>(); // Lo que tiene que parsear el json es la interface con strings
  await db
    .atomic()
    .set(["lastVisit"], {
      country,
      city,
      flag,
    })
    .sum(["visits"], 1n)
    .commit();
  return c.json({ message: "ok" });
});

app.get("/visit", (c) => {
  return streamSSE(c, async (stream) => {
    const watcher = db.watch([["lastVisit"]]);

    for await (const entry of watcher) {
      const { value } = entry[0];
      if (value !== null) {
        await stream.writeSSE({
          data: JSON.stringify(value),
          event: "update",
          id: String(i++),
        }); // Pasarle la información del servidor al cliente no podemos pasar un número, siempre son strings en el data
      }
    }
  });
});

Deno.serve(app.fetch);
