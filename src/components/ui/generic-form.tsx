import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GenericForm } from "@/components/ui/generic-form";
export interface FormField<T> {
  name: keyof T;
  label: string;
  type?: "text" | "email" | "number" | "password" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[]; // for select
  render?: (value: unknown, onChange: (v: unknown) => void) => React.ReactNode;
}

interface GenericFormProps<T> {
  fields: FormField<T>[];
  initialValues: Partial<T>;
  onSubmit: (values: T) => void;
  submitLabel?: string;
  className?: string;
}

export function GenericForm<T extends Record<string, any>>({
  fields,
  initialValues,
  onSubmit,
  submitLabel = "Enregistrer",
  className = "",
}: GenericFormProps<T>) {
  const [values, setValues] = React.useState<Partial<T>>(initialValues);

  const handleChange = (name: keyof T, value: any) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values as T);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "bg-[#fdfdfc] border border-[#e6e0d6] rounded-2xl p-8 shadow-md space-y-8",
        className
      )}
    >
      {/* Section title */}
      <h2 className="text-2xl font-serif text-[#008c95] border-b border-[#e6e0d6] pb-2 mb-6">
        Ajouter un partenaire
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        {fields.map((field) => (
          <div key={String(field.name)} className="space-y-1">
            <Label
              htmlFor={String(field.name)}
              className="text-sm font-serif text-[#5c5046]"
            >
              {field.label}
              {field.required && <span className="text-[#b38e5d] ml-1">*</span>}
            </Label>

            {field.render ? (
              field.render(values[field.name], (v) =>
                handleChange(field.name, v)
              )
            ) : field.type === "select" && field.options ? (
              <Select
                value={(values[field.name] as string) || ""}
                onValueChange={(v) => handleChange(field.name, v)}
              >
                <SelectTrigger
                  id={String(field.name)}
                  className="bg-white border-[#e6e0d6] placeholder-[#aaa] text-[#5c5046]"
                >
                  <SelectValue
                    placeholder={field.placeholder || "Sélectionner…"}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#e6e0d6]">
                  {field.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "textarea" ? (
              <Textarea
                id={String(field.name)}
                placeholder={field.placeholder}
                required={field.required}
                value={values[field.name] as string}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="bg-white border-[#e6e0d6] placeholder-[#ccc]"
                rows={3}
              />
            ) : (
              <Input
                id={String(field.name)}
                type={field.type || "text"}
                placeholder={field.placeholder}
                required={field.required}
                value={values[field.name] as string}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="bg-white border-[#e6e0d6] placeholder-[#ccc] text-[#5c5046]"
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[#e6e0d6] flex justify-end">
        <Button
          type="submit"
          className="bg-[#008c95] hover:bg-[#007b83] text-white font-medium"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
