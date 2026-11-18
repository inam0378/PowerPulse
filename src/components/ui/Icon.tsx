import {
  BarChart3, Boxes, Briefcase, Building2, Calendar, Cloud, Cpu, Factory, GraduationCap, Headset, HeartPulse,
  IdCard, Layers, Pill, ShieldCheck, ShoppingCart, Sparkles, Store, TrendingUp, Truck, Users, Utensils, Wallet,
  Zap, type LucideIcon, type LucideProps,
} from "lucide-react";

// Curated icon set an admin can pick from (by name) for products and categories.
export const iconMap: Record<string, LucideIcon> = {
  "bar-chart": BarChart3, boxes: Boxes, briefcase: Briefcase, "building-2": Building2, calendar: Calendar,
  cloud: Cloud, cpu: Cpu, factory: Factory, "graduation-cap": GraduationCap, headset: Headset,
  "heart-pulse": HeartPulse, "id-card": IdCard, layers: Layers, pill: Pill, "shield-check": ShieldCheck,
  "shopping-cart": ShoppingCart, sparkles: Sparkles, store: Store, "trending-up": TrendingUp, truck: Truck,
  users: Users, utensils: Utensils, wallet: Wallet, zap: Zap,
};

export const iconNames = Object.keys(iconMap);

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = iconMap[name] ?? Boxes;
  return <Cmp aria-hidden="true" {...props} />;
}
