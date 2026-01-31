import MultipleSelector, { Option } from "../ui/multiple-selector";
import { useSearchSubjects } from "@/lib/api/queries/use-search-subjects";
import { useState } from "react";

interface Props {
  value: Option[];
  onChange: (val: Option[]) => void;
}

const SubjectSelector: React.FC<Props> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const { data } = useSearchSubjects(search);

  const options: Option[] = data?.data?.map((t) => ({
    label: t.name,
    value: t._id,
  }));

  return (
    <MultipleSelector
      defaultOptions={options}
      value={value}
      onChange={onChange}
      placeholder="Select subjects..."
      onSearch={setSearch}
    />
  );
};

export default SubjectSelector;
