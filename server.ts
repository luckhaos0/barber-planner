import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Client Initialization
let supabaseClient: any = null;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY) are missing. Please configure them in the Secrets panel.");
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

async function startServer() {
  const app = express();
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
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/barbers", async (req, res) => {
    try {
      const { data: barbers, error } = await getSupabase()
        .from("users")
        .select("id, name, email, role")
        .eq("role", "barber");
      
      if (error) return res.status(500).json({ error: error.message });
      res.json(barbers);
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

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { error } = await getSupabase()
        .from("users")
        .delete()
        .eq("id", req.params.id);
      
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/daily-entries", async (req, res) => {
    try {
      const { data: entries, error } = await getSupabase()
        .from("daily_entries")
        .select(`
          *,
          users (name)
        `)
        .order("date", { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      
      // Flatten the join result
      const flattened = entries.map(e => ({
        ...e,
        barber_name: (e.users as any)?.name
      }));
      
      res.json(flattened);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/daily-entries", async (req, res) => {
    try {
      const { user_id, date, revenue, quantity } = req.body;
      const { error } = await getSupabase()
        .from("daily_entries")
        .upsert({ user_id, date, revenue, quantity }, { onConflict: "user_id, date" });
      
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/dashboard-monthly", async (req, res) => {
    try {
      const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const { data: barbers, error: bError } = await getSupabase()
        .from("users")
        .select("id, name")
        .eq("role", "barber");

      if (bError) return res.status(500).json({ error: bError.message });

      const results = await Promise.all(barbers.map(async (barber) => {
        const { data: entries } = await getSupabase()
          .from("daily_entries")
          .select("revenue, quantity")
          .eq("user_id", barber.id)
          .like("date", `${month}%`);

        const { data: goals } = await getSupabase()
          .from("goals")
          .select("target_value, bonus_value")
          .eq("user_id", barber.id)
          .eq("type", "monthly")
          .eq("metric", "revenue")
          .limit(1);

        const total_revenue = entries?.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
        const total_quantity = entries?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
        const goal = goals?.[0];

        return {
          user_id: barber.id,
          barber_name: barber.name,
          total_revenue,
          total_quantity,
          monthly_revenue_goal: goal?.target_value || 0,
          bonus_value: goal?.bonus_value || 0
        };
      }));

      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/barbers", async (req, res) => {
    try {
      const { name, email, password, shop_id } = req.body;
      const { data, error } = await getSupabase()
        .from("users")
        .insert({ shop_id: shop_id || 1, name, email, password, role: 'barber' })
        .select()
        .single();
      
      if (error) return res.status(400).json({ error: error.message });
      res.json({ id: data.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/goals/:userId", async (req, res) => {
    try {
      const { data: goals, error } = await getSupabase()
        .from("goals")
        .select("*")
        .eq("user_id", req.params.userId);
      
      if (error) return res.status(500).json({ error: error.message });
      res.json(goals);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const { user_id, type, metric, target_value, weekly_target, bonus_value, start_date, end_date } = req.body;
      
      const { error } = await getSupabase()
        .from("goals")
        .upsert({ 
          user_id, 
          type, 
          metric, 
          target_value, 
          weekly_target, 
          bonus_value, 
          start_date, 
          end_date 
        }, { onConflict: "user_id, type, metric" });
      
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/performance/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const { data: services, error } = await getSupabase()
        .from("services")
        .select("price, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) return res.status(500).json({ error: error.message });

      const grouped: Record<string, { count: number, revenue: number, date: string }> = {};
      services.forEach(s => {
        const date = new Date(s.created_at).toISOString().split('T')[0];
        if (!grouped[date]) {
          grouped[date] = { count: 0, revenue: 0, date };
        }
        grouped[date].count += 1;
        grouped[date].revenue += s.price;
      });

      const result = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const { user_id, service_name, price } = req.body;
      const date = new Date().toISOString().slice(0, 10);
      
      const { error: sError } = await getSupabase()
        .from("services")
        .insert({ user_id, service_name, price });
      
      if (sError) return res.status(500).json({ error: sError.message });

      const { data: existing } = await getSupabase()
        .from("daily_entries")
        .select("revenue, quantity")
        .eq("user_id", user_id)
        .eq("date", date)
        .single();

      const { error: deError } = await getSupabase()
        .from("daily_entries")
        .upsert({
          user_id,
          date,
          revenue: (existing?.revenue || 0) + price,
          quantity: (existing?.quantity || 0) + 1
        }, { onConflict: "user_id, date" });

      if (deError) return res.status(500).json({ error: deError.message });
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { data: notifications, error } = await getSupabase()
        .from("notifications")
        .select("*")
        .eq("user_id", req.params.userId)
        .order("created_at", { ascending: false });
      
      if (error) return res.status(500).json({ error: error.message });
      res.json(notifications);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
