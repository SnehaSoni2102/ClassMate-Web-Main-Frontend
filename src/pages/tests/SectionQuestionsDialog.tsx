import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetQuestions } from "@/lib/api/queries/use-get-questions";
import CreateQuestionDialog from "./CreateQuestionDialog";
import { MathText } from "@/math/MathText";

export default function SectionQuestionsDialog({
  open,
  onOpenChange,
  initialSelected,
  onSave,
  onCreateQuestion,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelected: any[]; // now full question objects
  onSave: (selected: any[]) => void;
  onCreateQuestion: (q: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  // Use a map for selected questions by _id
  const [selectedMap, setSelectedMap] = useState<{ [id: string]: any }>({});
  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("section-question-search-lang") as 'en' | 'hi') || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    // Populate selectedMap from initialSelected
    const map: { [id: string]: any } = {};
    (initialSelected || []).forEach((q: any) => { map[q._id] = q; });
    setSelectedMap(map);
  }, [initialSelected, open]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("section-question-search-lang", lang);
    }
  }, [lang]);

  const { data, isLoading } = useGetQuestions({
    questionType: "all",
    searchTerm: debouncedSearch,
    page,
  });

  // Map questions to options with both EN and HI labels
  const options: any[] = (data?.data?.questions || []);
  const totalPages = data?.data?.pagination?.totalPages || 1;

  // Selection logic
  const isSelected = (id: string) => !!selectedMap[id];
  const toggleSelect = (q: any) => {
    setSelectedMap((prev) => {
      const copy = { ...prev };
      if (copy[q._id]) {
        delete copy[q._id];
      } else {
        copy[q._id] = q;
      }
      return copy;
    });
  };

  const handleSave = () => {
    onSave(Object.values(selectedMap));
    onOpenChange(false);
  };

  const handleCreateQuestion = (q: any) => {
    setSelectedMap((prev) => ({ ...prev, [q._id]: q }));
    onCreateQuestion(q);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Section Questions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder={lang === 'en' ? "Search questions (English)..." : "Search questions (Hindi)..."}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-64"
            />
            <div className="flex gap-1 items-center">
              <Button
                type="button"
                size="sm"
                variant={lang === 'en' ? 'default' : 'outline'}
                onClick={() => setLang('en')}
              >EN</Button>
              <Button
                type="button"
                size="sm"
                variant={lang === 'hi' ? 'default' : 'outline'}
                onClick={() => setLang('hi')}
              >HI</Button>
            </div>
            <CreateQuestionDialog
              trigger={<Button type="button" size="sm" variant="outline">+ New Question</Button>}
              onSuccess={handleCreateQuestion}
            />
            <p className="text-xs text-muted-foreground">
              {Object.keys(selectedMap).length} questions selected
            </p>
          </div>
          {/* Question list with checkboxes */}
          <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No questions found.</div>
            ) : options.map((q) => (
              <label key={q._id} className="flex items-center justify-between gap-2 px-4 py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected(q._id)}
                    onChange={() => toggleSelect(q)}
                    className="accent-blue-600"
                  />
                  <span>
                    <MathText
                      text={lang === 'hi' && q.text_hi ? q.text_hi : q.text}
                      inline
                    />
                  </span>
                </div>
                {q?.serial_no && (
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded flex-shrink-0">
                    {q.serial_no}
                  </span>
                )}
              </label>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex justify-end items-center mt-2 gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 