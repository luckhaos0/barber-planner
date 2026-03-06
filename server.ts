import express from "express";
import { createServer as createViteServer } from "vite";
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
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase URL/Key faltando.");
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const app = express();
app.use(express.json());

// --- ROTAS DA API (DEFINIDAS FORA DA FUNÇÃO ASYNC) ---

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await getSupabase()
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (user && !error) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/all-users", async (req, res) => {
  try {
    const { data, error } = await getSupabase().from("users").select("id, name, email, role");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/daily-entries", async (req, res) => {
  try {
    const { data, error } = await getSupabase().from("daily_entries").select("*, users(name)").order("date", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Outras rotas podem ser adicionadas aqui da mesma forma...

// --- CONFIGURAÇÃO DE SERVIDOR / VITE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  }
}

startServer();
