import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/shared/types/ui.types";
import { useState } from "react";

interface FormFieldProps {
  fieldConfig: FieldConfig;
  formField: any;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#64748b",
  "#000000", "#ffffff"
];

export default function FieldColorPicker({ fieldConfig, formField }: FormFieldProps) {
  const [customColor, setCustomColor] = useState(formField.value || "#000000");

  const handleColorSelect = (color: string) => {
    setCustomColor(color);
    formField.onChange(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    formField.onChange(color);
  };

  return (
    <FormItem className={fieldConfig.className}>
      <FormLabel className="w-fit">
        {fieldConfig.label} {fieldConfig.required && <span className="text-red-400">*</span>}
      </FormLabel>

      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start font-normal",
                !formField.value && "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className="h-6 w-6 rounded border-2 border-gray-300 shrink-0"
                  style={{ backgroundColor: formField.value || "#000000" }}
                />
                <span className="flex-1 text-left">
                  {formField.value || "Selecciona un color"}
                </span>
              </div>
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Color Grid */}
            <div className="grid grid-cols-10 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "h-8 w-8 rounded border-2 transition-all hover:scale-110",
                    formField.value === color
                      ? "border-gray-900 ring-2 ring-gray-400"
                      : "border-gray-300"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="space-y-2 pt-2 border-t">
              <label className="text-sm font-medium">Color personalizado</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="h-10 w-14 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  placeholder="#000000"
                  className="flex-1 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <FormMessage />
    </FormItem>
  );
}