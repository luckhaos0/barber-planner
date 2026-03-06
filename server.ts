import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialização do Supabase
let supabaseClient: any = null;
function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) throw new Error("Variáveis do Supabase faltando.");
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const app = express();
app.use(express.json());

// --- ROTAS DA API ---
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await getSupabase()
      .from("users").select("*").eq("email", email).eq("password", password).single();

    if (user && !error) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/all-users", async (req, res) => {
  try {
    const { data, error } = await getSupabase().from("users").select("id, name, email, role");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- CONFIGURAÇÃO DE AMBIENTE ---
async function setup() {
  if (process.env.NODE_ENV !== "production") {
    // Carrega o Vite apenas em desenvolvimento
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    // Em produção (Vercel), serve os arquivos estáticos da pasta dist
    app.use(express.static(path.join(__dirname, "dist")));
  }
}

setup();

// Só inicia o servidor se não estiver na Vercel
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => console.log(`Rodando em http://localhost:${PORT}`));
}
