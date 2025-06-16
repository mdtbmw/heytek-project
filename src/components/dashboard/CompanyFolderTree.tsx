
'use client';

import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, FolderPlus, FilePlus, Brain } from 'lucide-react'; // Added Brain
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export interface FolderStructureItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FolderStructureItem[];
  path?: string; // Full path for files, or path to folder
  documentId?: string; // Link to document in dashboard state
  aiHint?: string; // For AI generation context
}

interface CompanyFolderTreeProps {
  structure: FolderStructureItem[];
  onFileClick?: (file: FolderStructureItem) => void;
  onFolderCreate?: (parentId: string | null) => void; // null for root
  onFileCreate?: (folderId: string) => void;
  onAIAssist?: (item: FolderStructureItem) => void; // New prop for AI assist
}

interface TreeItemProps extends CompanyFolderTreeProps {
  item: FolderStructureItem;
  level: number;
}

const TreeItem: React.FC<TreeItemProps> = ({ item, level, structure, onFileClick, onFolderCreate, onFileCreate, onAIAssist }) => {
  const [isOpen, setIsOpen] = useState(item.type === 'folder' && level < 1); // Auto-open top-level folders
  const { toast } = useToast();

  const handleToggle = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = () => {
    if (item.type === 'file' && onFileClick) {
      onFileClick(item);
    } else if (item.type === 'folder') {
      handleToggle();
    }
  };

  const Icon = item.type === 'folder' ? (isOpen ? ChevronDown : ChevronRight) : File;
  const ItemIcon = item.type === 'folder' ? Folder : File;

  return (
    <TooltipProvider delayDuration={300}>
      <div>
        <div
          className={cn(
            "flex items-center py-1.5 px-2 rounded-md hover:bg-muted/50 dark:hover:bg-muted/20 cursor-pointer group",
            level > 0 && "ml-2" 
          )}
          style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }} 
          onClick={handleItemClick}
        >
          {item.type === 'folder' && (
            <Icon className="h-4 w-4 mr-2 text-muted-foreground shrink-0" onClick={(e) => { e.stopPropagation(); handleToggle(); }}/>
          )}
          <ItemIcon className={cn("h-4 w-4 mr-2 shrink-0", item.type === 'folder' ? 'text-primary' : 'text-muted-foreground')} />
          <span className="text-sm truncate flex-1">{item.name}</span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 ml-auto">
            {item.type === 'folder' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => {e.stopPropagation(); onFileCreate ? onFileCreate(item.id) : toast({title: "Add File (Mock)", description: `Would add a file to ${item.name}`})}}>
                        <FilePlus size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top"><p className="text-xs">Add File to {item.name}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => {e.stopPropagation(); onFolderCreate ? onFolderCreate(item.id) : toast({title: "Add Folder (Mock)", description: `Would add a subfolder to ${item.name}`})}}>
                        <FolderPlus size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top"><p className="text-xs">Add Subfolder to {item.name}</p></TooltipContent>
                </Tooltip>
              </>
            )}
            {onAIAssist && (
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => {e.stopPropagation(); onAIAssist(item)}}>
                        <Brain size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top"><p className="text-xs">AI Assist with {item.name}</p></TooltipContent>
                </Tooltip>
            )}
          </div>
        </div>
        {item.type === 'folder' && isOpen && item.children && item.children.length > 0 && (
          <div className="pl-4 border-l border-dashed border-border ml-3.5"> 
            {item.children.map((child) => (
              <TreeItem key={child.id} item={child} level={level + 1} structure={structure} onFileClick={onFileClick} onFolderCreate={onFolderCreate} onFileCreate={onFileCreate} onAIAssist={onAIAssist}/>
            ))}
          </div>
        )}
        {item.type === 'folder' && isOpen && (!item.children || item.children.length === 0) && (
          <p className="text-xs text-muted-foreground italic" style={{ paddingLeft: `${(level + 1) * 1.25 + 1}rem` }}>
              (Empty folder)
          </p>
        )}
      </div>
    </TooltipProvider>
  );
};

const CompanyFolderTree: React.FC<CompanyFolderTreeProps> = ({ structure, onFileClick, onFolderCreate, onFileCreate, onAIAssist }) => {
   const { toast } = useToast();

   const handleRootFolderCreate = () => {
      if (onFolderCreate) onFolderCreate(null);
      else toast({title: "Add Root Folder (Mock)"});
   }

  if (!structure || structure.length === 0) {
    return (
        <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No folder structure defined yet.</p>
            <Button variant="outline" size="sm" onClick={handleRootFolderCreate}>
                <FolderPlus size={14} className="mr-2"/> Create Root Folder (Mock)
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {structure.map((item) => (
        <TreeItem key={item.id} item={item} level={0} structure={structure} onFileClick={onFileClick} onFolderCreate={onFolderCreate} onFileCreate={onFileCreate} onAIAssist={onAIAssist} />
      ))}
    </div>
  );
};

export default CompanyFolderTree;
