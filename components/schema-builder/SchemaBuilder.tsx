
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SchemaField, SavedSchema } from '@/types/schema';
import { NestedFields } from './NestedFields';
import { JsonPreview } from './JsonPreview';
import { SavedSchemas } from './SavedSchemas';
import { AIAssistant } from './AIAssistant';
import { SchemaExport } from './SchemaExport';
import { SchemaValidation } from './SchemaValidation';
import { SchemaTemplates } from './SchemaTemplates';
import { SchemaHistory } from './SchemaHistory';
import { Save, Sparkles, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';

// ImportSchemaButton component
interface ImportSchemaButtonProps {
  onImport: (fields: SchemaField[]) => void;
}

function ImportSchemaButton({ onImport }: ImportSchemaButtonProps) {
  const [open, setOpen] = useState(false);
  const [schemaText, setSchemaText] = useState('');
  const [error, setError] = useState('');

  // Convert JSON Schema to SchemaField[]
  const convertJsonSchemaToFields = (schema: any): SchemaField[] => {
    if (!schema || typeof schema !== 'object' || schema.type !== 'object' || !schema.properties) return [];
    const required = Array.isArray(schema.required) ? schema.required : [];
    return Object.entries(schema.properties).map(([name, prop]: [string, any]) => {
      if (prop.type === 'object' && prop.properties) {
        return {
          id: generateId(),
          name,
          type: 'Nested',
          required: required.includes(name),
          children: convertJsonSchemaToFields(prop)
        };
      } else if (prop.type === 'string') {
        return {
          id: generateId(),
          name,
          type: 'String',
          required: required.includes(name),
          value: prop.default || ''
        };
      } else if (prop.type === 'number' || prop.type === 'integer') {
        return {
          id: generateId(),
          name,
          type: 'Number',
          required: required.includes(name),
          value: prop.default || 0
        };
      } else {
        // fallback to string
        return {
          id: generateId(),
          name,
          type: 'String',
          required: required.includes(name),
          value: ''
        };
      }
    });
  };

  const handleImport = () => {
    setError('');
    try {
      const json = JSON.parse(schemaText);
      const fields = convertJsonSchemaToFields(json);
      if (fields.length === 0) {
        setError('No valid fields found in schema.');
        return;
      }
      onImport(fields);
      setOpen(false);
      setSchemaText('');
    } catch (e) {
      setError('Invalid JSON Schema.');
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Import Schema
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import 3rd Party JSON Schema</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full min-h-[120px] font-mono text-xs border rounded p-2"
            placeholder="Paste your JSON Schema here..."
            value={schemaText}
            onChange={e => setSchemaText(e.target.value)}
          />
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleImport}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// MobileActions component
import { useState as useReactState } from 'react';
type MobileActionsProps = {
  onAIGenerate: () => void;
  onLoadTemplate: () => void;
  onExport: () => void;
  onValidate: () => void;
  onHistory: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};
function MobileActions({
  onAIGenerate,
  onLoadTemplate,
  onExport,
  onValidate,
  onHistory,
  open,
  setOpen
}: MobileActionsProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center bg-black/40 transition ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
      onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-2xl p-4 pb-8 shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={onAIGenerate} className="w-full">AI Assistant</Button>
          <Button variant="outline" onClick={onLoadTemplate} className="w-full">Templates</Button>
          <Button variant="outline" onClick={onExport} className="w-full">Export</Button>
          <Button variant="outline" onClick={onValidate} className="w-full">Validate</Button>
          <Button variant="outline" onClick={onHistory} className="w-full">History</Button>
          <Button variant="ghost" onClick={() => setOpen(false)} className="w-full mt-2">Close</Button>
        </div>
      </div>
    </div>
  );
}

export const SchemaBuilder: React.FC = () => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [savedSchemas, setSavedSchemas] = useState<SavedSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [schemaName, setSchemaName] = useState('');
  const [tabValue, setTabValue] = useState('builder');

  useEffect(() => {
    fetchSavedSchemas();
  }, []);

  const fetchSavedSchemas = async () => {
    try {
      const response = await fetch('/api/schemas');
      if (response.ok) {
        const data = await response.json();
        setSavedSchemas(data.schemas);
      }
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
    }
  };

  const handleFieldsChange = (newFields: SchemaField[]) => {
    setFields(newFields);
  };

  const handleSaveSchema = async () => {
    if (!schemaName.trim()) {
      toast.error('Please enter a schema name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/schemas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: schemaName,
          schema: fields,
        }),
      });

      if (response.ok) {
        toast.success('Schema saved successfully!');
        setSaveDialogOpen(false);
        setSchemaName('');
        fetchSavedSchemas();
      } else {
        toast.error('Failed to save schema');
      }
    } catch (error) {
      toast.error('Failed to save schema');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSchema = (schema: SavedSchema) => {
    setFields(schema.schema);
    toast.success(`Loaded schema: ${schema.name}`);
  };

  const handleAIGenerate = (generatedFields: SchemaField[]) => {
    setFields(generatedFields);
    toast.success('Schema generated successfully!');
  };

  // Mobile action sheet state
  const [mobileActionsOpen, setMobileActionsOpen] = useReactState(false);
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [validateOpen, setValidateOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Handlers for mobile action sheet that open the actual dialogs
  const handleMobileAIGenerate = () => {
    setMobileActionsOpen(false);
    setAIAssistantOpen(true);
  };
  const handleMobileTemplates = () => {
    setMobileActionsOpen(false);
    setTemplatesOpen(true);
  };
  const handleMobileExport = () => {
    setMobileActionsOpen(false);
    setExportOpen(true);
  };
  const handleMobileValidate = () => {
    setMobileActionsOpen(false);
    setValidateOpen(true);
  };
  const handleMobileHistory = () => {
    setMobileActionsOpen(false);
    setHistoryOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-1 sm:p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          {/* Desktop actions */}
          <div className="hidden sm:flex w-full justify-center">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 items-center">
              <div className="flex gap-2 items-center">
                <AIAssistant onGenerate={handleAIGenerate} open={aiAssistantOpen} setOpen={setAIAssistantOpen} />
                <SchemaTemplates onLoadTemplate={handleFieldsChange} open={templatesOpen} setOpen={setTemplatesOpen} />
                <SchemaExport fields={fields} open={exportOpen} setOpen={setExportOpen} />
                <SchemaValidation fields={fields} open={validateOpen} setOpen={setValidateOpen} />
                <SchemaHistory fields={fields} onRestore={handleFieldsChange} open={historyOpen} setOpen={setHistoryOpen} />
              </div>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 min-h-[44px]">
                    <Save className="h-4 w-4" />
                    Save Schema
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Schema</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter schema name..."
                      value={schemaName}
                      onChange={(e) => setSchemaName(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveSchema} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {/* Mobile actions: Save and More */}
          <div className="flex sm:hidden gap-2 w-full">
            <Button className="flex-1 min-h-[44px]" onClick={() => setSaveDialogOpen(true)}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button className="flex-1 min-h-[44px]" variant="outline" onClick={() => setMobileActionsOpen(true)}>
              More
            </Button>
          </div>
        </div>
        {/* Mobile action sheet */}
        <MobileActions
          open={mobileActionsOpen}
          setOpen={setMobileActionsOpen}
          onAIGenerate={handleMobileAIGenerate}
          onLoadTemplate={handleMobileTemplates}
          onExport={handleMobileExport}
          onValidate={handleMobileValidate}
          onHistory={handleMobileHistory}
        />

        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <div className="sticky top-[56px] z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <TabsList className="grid w-full grid-cols-3 mb-1 sm:mb-6 gap-1">
              <TabsTrigger value="builder" className="text-xs sm:text-lg py-2 sm:py-2 rounded-md sm:rounded-lg">Schema Builder</TabsTrigger>
              <TabsTrigger value="preview" className="text-xs sm:text-lg py-2 sm:py-2 rounded-md sm:rounded-lg">JSON Preview</TabsTrigger>
              <TabsTrigger value="saved" className="text-xs sm:text-lg flex items-center gap-2 py-2 sm:py-2 rounded-md sm:rounded-lg">
                <FolderOpen className="h-4 w-4" />
                Saved Schemas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="builder" className="space-y-2 sm:space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base sm:text-2xl">Build Your Schema</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-base">Add, edit, and organize your JSON schema fields</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={() => setFields([])}>
                    Reset
                  </Button>
                  <Button variant="outline" onClick={() => setTabValue('saved')}>
                    Load Existing Schema
                  </Button>
                  <ImportSchemaButton onImport={setFields} />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh] sm:h-[calc(100vh-400px)] w-full pr-1 sm:pr-4">
                  <NestedFields
                    fields={fields}
                    onFieldsChange={handleFieldsChange}
                    level={0}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-2 sm:space-y-6">
            <div className="text-xs sm:text-base">
              <JsonPreview fields={fields} />
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-2 sm:space-y-6">
            <div className="text-xs sm:text-base">
              <SavedSchemas 
                schemas={savedSchemas} 
                onLoad={handleLoadSchema}
                onRefresh={fetchSavedSchemas}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};