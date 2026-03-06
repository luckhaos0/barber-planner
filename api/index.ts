import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// Conexão com o Banco de Dados
const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Configure as chaves do Supabase na Vercel!");
  return createClient(url, key);
};

// Criamos um roteador para organizar as rotas
const router = express.Router();

router.get("/health", (req, res) => res.json({ status: "ok", message: "API ONLINE!" }));

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await getSupabase()
      .from("users").select("*").eq("email", email).eq("password", password).single();
    if (data && !error) {
      const { password: _, ...user } = data;
      res.json(user);
    } else {
      res.status(401).json({ error: "Email ou senha incorretos" });
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get("/all-users", async (req, res) => {
  try {
    const { data, error } = await getSupabase().from("users").select("id, name, email, role");
    if (error) return res.status(500).json(error);
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// O SEGREDO: Montamos as rotas em dois caminhos para garantir que a Vercel as encontre
app.use("/api", router);
app.use("/", router);

export default app;
