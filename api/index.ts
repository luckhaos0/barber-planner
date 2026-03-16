import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Chaves do Supabase não encontradas!");
  return createClient(url, key);
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor Ativado!" });
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await getSupabase()
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (data && !error) {
      const { password: _, ...user } = data;
      return res.json(user);
    }
    return res.status(401).json({ error: "Credenciais inválidas" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default app;
