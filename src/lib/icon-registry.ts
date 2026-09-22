import { Building2, Landmark, Banknote, Code2, CreditCard, type LucideIcon } from "lucide-react";

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

export function getCategoryIcon(slug: string): LucideIcon {
  switch (slug) {
    case "business-formation":
      return Building2;
    case "business-banking":
      return Banknote;
    case "payment-platforms":
      return CreditCard;
    case "digital-technology":
      return Code2;
    default:
      return Building2;
  }
}
