import MultipleSelector, { Option } from "../ui/multiple-selector";
import { useSearchTopics } from "@/lib/api/queries/use-search-topics";
import { useState } from "react";

interface Props {
  value: Option[];
  onChange: (val: Option[]) => void;
}

const TopicSelector: React.FC<Props> = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const { data } = useSearchTopics(search);

  const options: Option[] = data?.data?.map((t) => ({
    label: t.name,
    value: t._id,
  }));

  return (
    <MultipleSelector
      defaultOptions={options}
      value={value}
      onChange={onChange}
      placeholder="Select topics..."
      onSearch={setSearch}
    />
  );
};

export default TopicSelector;
