// ... (mantenha o resto do código acima igual)
import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Client Initialization
let supabaseClient: any = null;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing.");
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const app = express();
app.use(express.json());

// API Routes
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
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/all-users", async (req, res) => {
  try {
    const { data: users, error } = await getSupabase()
      .from("users")
      .select("id, name, email, role");
    if (error) return res.status(500).json({ error: error.message });
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Servir arquivos estáticos (Frontend)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
} else {
  // Em desenvolvimento, as rotas do Vite serão tratadas pelo dev server
  app.get("/", (req, res) => {
    res.send("API is running. Use Vite dev server for frontend.");
  });
}

// Inicialização do Servidor (Configurado para Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
