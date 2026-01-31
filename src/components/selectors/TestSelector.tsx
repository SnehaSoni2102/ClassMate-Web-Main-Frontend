import MultipleSelector, { Option } from "../ui/multiple-selector";
import { useState } from "react";
import { useSearchTests } from "@/lib/api/queries/use-search-tests";

interface Props {
  value: Option[];
  onChange: (val: Option[]) => void;
  multiple?: boolean;
}

const TestSelector: React.FC<Props> = ({ value, onChange, multiple = true }) => {
  const [search, setSearch] = useState("");
  const { data } = useSearchTests(search);

  const options: Option[] = data?.data?.tests?.map((obj) => ({
    label: obj.title,
    value: obj?._id,
  })) || [];

  const handleChange = (newValue: Option[]) => {
    if (!multiple && newValue.length > 1) {
      onChange([newValue[newValue.length - 1]]);
    } else {
      onChange(newValue);
    }
  };

  return (
    <MultipleSelector
      defaultOptions={options}
      value={value}
      onChange={handleChange}
      onSearch={setSearch}
      placeholder={multiple ? "Select tests..." : "Select a test..."}
    />
  );
};

export default TestSelector;


