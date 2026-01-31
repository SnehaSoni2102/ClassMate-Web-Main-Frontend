import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useGetCategories } from "@/lib/api/queries/use-get-categories";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const CategorySelector: React.FC<Props> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const { data } = useGetCategories(search);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 pb-2">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        {data?.data?.map((category) => (
          <SelectItem key={category._id} value={category._id}>
            <div className="flex items-center gap-2">
              {category.logo && (
                <img
                  src={category.logo}
                  alt={category.name}
                  className="h-4 w-4 object-contain"
                />
              )}
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector; 