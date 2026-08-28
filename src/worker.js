export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/state") {
      if (request.method === "GET") {
        return handleGet(env);
      }
      if (request.method === "POST") {
        return handlePost(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Qualquer outra rota: serve os arquivos estáticos (public/index.html etc.). O sistema
    // é atualizado com frequência, então desligamos o cache da página principal — sem isso,
    // tanto o navegador quanto a rede da Cloudflare podiam continuar servindo uma versão
    // antiga por um tempo depois de um novo deploy.
    const resp = await env.ASSETS.fetch(request);
    const tipo = resp.headers.get("content-type") || "";
    if (tipo.indexOf("text/html") !== -1) {
      const semCache = new Response(resp.body, resp);
      semCache.headers.set("Cache-Control", "no-store, must-revalidate");
      return semCache;
    }
    return resp;
  }
};

async function handleGet(env) {
  try {
    const row = await env.DB
      .prepare("SELECT dados, atualizado_em FROM estado WHERE id = 1")
      .first();
    if (!row) {
      return json({ dados: null, atualizado_em: null });
    }
    return json({ dados: row.dados, atualizado_em: row.atualizado_em });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

async function handlePost(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "JSON inválido" }, 400);
  }
  if (!body || typeof body.dados !== "string") {
    return json({ error: "Campo 'dados' é obrigatório" }, 400);
  }
  const agora = new Date().toISOString();
  try {
    await env.DB
      .prepare(
        "INSERT INTO estado (id, dados, atualizado_em) VALUES (1, ?, ?) " +
        "ON CONFLICT(id) DO UPDATE SET dados = excluded.dados, atualizado_em = excluded.atualizado_em"
      )
      .bind(body.dados, agora)
      .run();
    return json({ ok: true, atualizado_em: agora });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
