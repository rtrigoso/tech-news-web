const kv = await Deno.openKv();

for await (const entry of kv.list({ prefix: ["post"] })) {
  console.log(entry.key, entry.value);
}

kv.close();
