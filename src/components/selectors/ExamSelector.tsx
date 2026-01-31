import MultipleSelector, { Option } from "../ui/multiple-selector";
import { useState } from "react";
import { useSearchExams } from "@/lib/api/queries/use-search-exams";

interface Props {
  value: Option[];
  onChange: (val: Option[]) => void;
  multiple?: boolean;
}

const ExamSelector: React.FC<Props> = ({ value, onChange, multiple = true }) => {
  const [search, setSearch] = useState("");
  const { data } = useSearchExams(search);

  const options: Option[] = data?.data?.map((obj) => ({
    label: obj.name,
    value: obj?._id,
  }));

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
      placeholder={multiple ? "Select exams..." : "Select an exam..."}
    />
  );
};

export default ExamSelector;
