import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SchemaField } from '@/types/schema';
import { History, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SchemaHistoryProps {
  fields: SchemaField[];
  onRestore: (fields: SchemaField[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  fields: SchemaField[];
  action: string;
}

// Removed duplicate/old implementation
export const SchemaHistory: React.FC<SchemaHistoryProps> = ({ fields, onRestore, open, setOpen }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // Save current state to history when fields change
    if (fields.length > 0) {
      const newEntry: HistoryEntry = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        fields: JSON.parse(JSON.stringify(fields)), // Deep clone
        action: 'Schema modified'
      };

      setHistory(prev => {
        const updated = [newEntry, ...prev.slice(0, 19)]; // Keep last 20 entries
        return updated;
      });
    }
  }, [fields]);

  const handleRestore = (entry: HistoryEntry) => {
    onRestore(entry.fields);
  const getFieldSummary = (fields: SchemaField[]): { total: number; nested: number; string: number; number: number } => {
    let total = 0;
    let nested = 0;
    let string = 0;
    let number = 0;
    for (const field of fields) {
      total += 1;
      if (field.type === 'Nested' && field.children) {
        nested += 1;
        const childSummary = getFieldSummary(field.children);
        total += childSummary.total;
        nested += childSummary.nested;
        string += childSummary.string;
        number += childSummary.number;
      } else if (field.type === 'String') {
        string += 1;
      } else if (field.type === 'Number') {
        number += 1;
      }
    }
    return { total, nested, string, number };
  };
    setOpen(false);
    setOpen(false);
    toast.success('Schema restored from history');
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Only keep the correct getFieldSummary version
  const getFieldSummary = (fields: SchemaField[]): { total: number; nested: number; string: number; number: number } => {
    let total = 0;
    let nested = 0;
    let string = 0;
    let number = 0;
    for (const field of fields) {
      total += 1;
      if (field.type === 'Nested' && field.children) {
        nested += 1;
        const childSummary = getFieldSummary(field.children);
        total += childSummary.total;
        nested += childSummary.nested;
        string += childSummary.string;
        number += childSummary.number;
      } else if (field.type === 'String') {
        string += 1;
      } else if (field.type === 'Number') {
        number += 1;
      }
    }
    return { total, nested, string, number };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          History
          {history.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {history.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <span id="schema-history-desc" className="sr-only">View and restore previous versions of your schema.</span>
        <div aria-describedby="schema-history-desc">
          <ScrollArea>
            <div className="space-y-3">
              {history.map((entry, index) => {
                const summary = getFieldSummary(entry.fields);
                const isCurrentState = index === 0;
                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      isCurrentState 
                        ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {entry.action}
                          </span>
                          {isCurrentState && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(entry.timestamp)}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {summary.total} total fields
                          </span>
                          {summary.nested > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              {summary.nested} nested
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {summary.string} strings
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            {summary.number} numbers
                          </span>
                        </div>
                      </div>
                      {!isCurrentState && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(entry)}
                          className="hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};