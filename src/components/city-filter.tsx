import { cities } from "@/lib/constants";
import { Select } from "@/components/ui/select";

export function CityFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Filter by city">
      <option value="all">All cities</option>
      {cities.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </Select>
  );
}
