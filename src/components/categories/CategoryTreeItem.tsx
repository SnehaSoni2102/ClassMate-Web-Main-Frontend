import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, FolderPlus } from "lucide-react";
import { CategoryTree } from "@/lib/api/queries/use-get-category-tree";
import { CreateExamFromCategoryModal } from "@/components/modals/CreateExamFromCategoryModal";
import { EditCategoryModal } from "@/components/modals/EditCategoryModal";
import { CreateChildCategoryModal } from "@/components/modals/CreateChildCategoryModal";
import moment from "moment";

interface CategoryTreeItemProps {
  category: CategoryTree;
  level?: number;
  onExamCreated?: () => void;
}

export function CategoryTreeItem({ category, level = 0, onExamCreated }: CategoryTreeItemProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateChildModalOpen, setIsCreateChildModalOpen] = useState(false);
  
  const isLeafCategory = (category.children?.length ?? 0) === 0;
  const canCreateChild = category.exams.length === 0; // Can create child only if no exams
  const marginLeft = level * 16; // 16px per level

  const handleCreateExam = () => {
    setIsCreateModalOpen(true);
  };

  const handleExamCreated = () => {
    onExamCreated?.();
    setIsCreateModalOpen(false);
  };

  const handleEditCategory = () => {
    setIsEditModalOpen(true);
  };

  const handleCreateChildCategory = () => {
    setIsCreateChildModalOpen(true);
  };

  return (
    <>
      <div 
        className="border rounded-lg p-4 mb-4"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg border bg-white p-2 ${level === 0 ? 'h-12 w-12' : level === 1 ? 'h-10 w-10' : 'h-8 w-8'}`}>
              <img
                src={category.logo}
                alt={category.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h4 className={`font-medium text-gray-900 ${level === 0 ? 'text-lg' : level === 1 ? 'text-base' : 'text-sm'}`}>
                {category.name}
              </h4>
              <p className={`text-gray-500 ${level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-xs'}`}>
                {category.name_hi}
              </p>
            </div>
            {category.exams.length > 0 && (
              <Badge variant="outline" className={level > 1 ? 'text-xs' : ''}>
                {category.exams.length} Exams
              </Badge>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 ml-4">
            {/* Edit Category Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditCategory}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            {/* Create Child Category Button - only if no exams */}
            {canCreateChild && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateChildCategory}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            )}
            
            {/* Create Exam Button for leaf categories */}
            {isLeafCategory && (
              <Button
                size="sm"
                onClick={handleCreateExam}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            )}
          </div>
        </div>
        
        {/* Show exams in this category */}
        {category.exams.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-4 ${
              level === 0 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
              level === 1 ? 'grid-cols-1 md:grid-cols-2' : 
              'grid-cols-1 md:grid-cols-2'
            }`}>
              {category.exams.map((exam) => (
                <Link
                  key={exam._id}
                  to={`/exams/${exam._id}`}
                  className="group"
                >
                  <div className={`flex items-center gap-3 border rounded-lg hover:border-blue-500 transition-colors ${
                    level === 0 ? 'p-4' : level === 1 ? 'p-3' : 'p-2'
                  }`}>
                    <div className={`rounded-lg border bg-white p-2 ${
                      level === 0 ? 'h-16 w-16' : level === 1 ? 'h-12 w-12' : 'h-8 w-8'
                    }`}>
                      <img
                        src={exam.logo}
                        alt={exam.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`font-medium text-gray-900 group-hover:text-blue-600 truncate ${
                        level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-xs'
                      }`}>
                        {exam.name}
                      </h5>
                      <p className={`text-gray-500 truncate ${
                        level === 0 ? 'text-sm' : 'text-xs'
                      }`}>
                        {exam.name_hi}
                      </p>
                      {level === 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Added {moment(exam.createdAt).format("MMM D, YYYY")}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recursively render children */}
        {(category.children?.length ?? 0) > 0 && (
          <div className="space-y-4">
            {category.children!.map((child) => (
              <CategoryTreeItem
                key={child._id}
                category={child}
                level={level + 1}
                onExamCreated={onExamCreated}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {isLeafCategory && (
        <CreateExamFromCategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          category={category}
          onSuccess={handleExamCreated}
        />
      )}

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={category}
        onSuccess={onExamCreated}
      />

      {/* Create Child Category Modal */}
      <CreateChildCategoryModal
        isOpen={isCreateChildModalOpen}
        onClose={() => setIsCreateChildModalOpen(false)}
        parentCategory={category}
        onSuccess={onExamCreated}
      />
    </>
  );
} 