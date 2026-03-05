export interface User {
  id: number;
  shop_id: number;
  name: string;
  email: string;
  role: 'admin' | 'barber';
}

export interface Goal {
  id: number;
  user_id: number;
  type: 'daily' | 'weekly' | 'monthly';
  metric: 'quantity' | 'revenue';
  target_value: number;
  weekly_target?: number;
  bonus_value?: number;
  start_date: string;
  end_date: string;
}

export interface DailyEntry {
  id: number;
  user_id: number;
  barber_name?: string;
  date: string;
  revenue: number;
  quantity: number;
}

export interface DashboardMonthlyData {
  user_id: number;
  barber_name: string;
  total_revenue: number;
  total_quantity: number;
  monthly_revenue_goal: number;
  bonus_value: number;
}

export interface Service {
  id: number;
  user_id: number;
  service_name: string;
  price: number;
  created_at: string;
}

export interface PerformanceData {
  count: number;
  revenue: number;
  date: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
