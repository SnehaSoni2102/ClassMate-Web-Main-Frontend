import MultipleSelector, { Option } from "../ui/multiple-selector";
import { useState } from "react";
import { useSearchClasses } from "@/lib/api/queries/use-search-classes";

interface Props {
  value: Option[];
  onChange: (val: Option[]) => void;
}

const ClassSelector: React.FC<Props> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const { data } = useSearchClasses(search);

  const options: Option[] = data?.data?.map((obj) => ({
    label: obj.name,
    value: obj?._id,
  }));

  return (
    <MultipleSelector
      defaultOptions={options}
      value={value}
      onChange={onChange}
      placeholder="Select classes..."
      onSearch={setSearch}
    />
  );
};

export default ClassSelector;
