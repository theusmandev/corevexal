import {
  Building2,
  Landmark,
  Banknote,
  Code2,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export const iconRegistry: Record<string, LucideIcon> = {
  Building2,
  Landmark,
  Banknote,
  Code2,
  CreditCard,
};

export function getIcon(name: string): LucideIcon {
  return iconRegistry[name] || Building2;
}
