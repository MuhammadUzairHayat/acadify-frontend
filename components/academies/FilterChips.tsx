import { Button } from "@/components/ui/Button";

export type FilterOption = {
  id: string;
  label: string;
};

type FilterChipsProps = {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
};

export function FilterChips({ label, options, value, onChange }: FilterChipsProps) {
  return (
    <div>
      <p className="text-sm font-medium text-text-secondary mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.id || "all"}
            type="button"
            size="sm"
            variant={value === option.id ? "primary" : "outline"}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
