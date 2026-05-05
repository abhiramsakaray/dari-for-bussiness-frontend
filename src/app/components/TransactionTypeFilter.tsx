import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TransactionType } from "../../types/api.types";

interface TransactionTypeFilterProps {
  value: "all" | TransactionType;
  onChange: (value: "all" | TransactionType) => void;
}

export function TransactionTypeFilter({ value, onChange }: TransactionTypeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Transactions</SelectItem>
        <SelectItem value="payment">Regular Payments</SelectItem>
        <SelectItem value="subscription">Subscriptions</SelectItem>
      </SelectContent>
    </Select>
  );
}
