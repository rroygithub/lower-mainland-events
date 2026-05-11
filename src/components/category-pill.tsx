import { Badge } from "@/components/ui/badge";

export function CategoryPill({ category }: { category: string }) {
  return <Badge className="bg-orange-50 text-orange-700">{category}</Badge>;
}
