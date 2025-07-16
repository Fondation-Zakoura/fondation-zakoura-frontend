import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Card } from './card';
import dayjs from 'dayjs';

// Helper components for input, select, and datepicker fields to reduce repetition
export interface InputFieldProps {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}
export const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', required, placeholder }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
      required={required}
    />
  </div>
);

export type SelectOption = string | { label: string; value: string | number };

export interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
}
export const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange, required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Select value={String(value)} onValueChange={onChange} required={required}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Sélectionner" />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt =>
          typeof opt === 'string'
            ? <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            : <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
        )}
      </SelectContent>
    </Select>
  </div>
);


export interface DatePickerFieldProps {
  label: string;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  required?: boolean;
}
export const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, selected, onSelect }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left">
          {selected ? format(selected, 'yyyy-MM-dd') : 'Sélectionner la date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          initialFocus
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear() + 5}
        />
      </PopoverContent>
    </Popover>
  </div>
);
export const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value ?? '-'}</p>
  </div>
);

export const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="shadow bg-white rounded-xl p-6 space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">{title}</h3>
    {children}
  </Card>
);

export const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('DD/MM/YYYY');
};
