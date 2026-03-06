import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// Inicialização do Supabase
const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Variáveis do Supabase faltando.");
  return createClient(url, key);
};

// --- TODAS AS ROTAS DA API ---

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await getSupabase()
      .from("users").select("*").eq("email", email).eq("password", password).single();
    if (user && !error) {
      const { password: _, ...userWithoutPassword } = user;
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

app.get("/api/barbers", async (req, res) => {
  try {
    const { data, error } = await getSupabase().from("users").select("id, name, email, role").eq("role", "barber");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/daily-entries", async (req, res) => {
  try {
    const { data, error } = await getSupabase().from("daily_entries").select("*, users(name)").order("date", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(e => ({ ...e, barber_name: (e.users as any)?.name })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Exporta para a Vercel
export default app;
