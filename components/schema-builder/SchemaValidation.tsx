import React, { useState } from 'react';
import Ajv from 'ajv';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SchemaField } from '@/types/schema';
import { CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface SchemaValidationProps {
  fields: SchemaField[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}



export const SchemaValidation: React.FC<SchemaValidationProps> = ({ fields, open, setOpen }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [schemaInput, setSchemaInput] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Import the same convertToJsonSchema logic as in SchemaExport
  const convertToJsonSchema = (fields: SchemaField[]): any => {
    const properties: any = {};
    const required: string[] = [];
    fields.forEach(field => {
      if (field.type === 'Nested' && field.children) {
        const nestedSchema = convertToJsonSchema(field.children);
        properties[field.name] = {
          type: 'object',
          properties: nestedSchema.properties,
          ...(nestedSchema.required && nestedSchema.required.length > 0 ? { required: nestedSchema.required } : {})
        };
      } else if (field.type === 'String') {
        properties[field.name] = {
          type: 'string',
          default: field.value || ''
        };
      } else if (field.type === 'Number') {
        properties[field.name] = {
          type: 'number',
          default: field.value || 0
        };
      }
      if (field.required === undefined ? true : field.required) {
        required.push(field.name);
      }
    });
    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {})
    };
  };

  const ajv = new Ajv({ allErrors: true, strict: false });

  const handleValidation = () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data to validate');
      return;
    }

    let schema;
    if (schemaInput.trim()) {
      try {
        schema = JSON.parse(schemaInput);
      } catch (e) {
        setValidationResult({ isValid: false, errors: ['Invalid JSON Schema format'], warnings: [] });
        toast.error('Invalid JSON Schema format');
        return;
      }
    } else {
      schema = convertToJsonSchema(fields);
    }

    try {
      const jsonData = JSON.parse(jsonInput);
      const validate = ajv.compile(schema);
      const valid = validate(jsonData);
      if (valid) {
        setValidationResult({ isValid: true, errors: [], warnings: [] });
        toast.success('JSON is valid!');
      } else {
        setValidationResult({
          isValid: false,
          errors: (validate.errors || []).map(e => `At ${e.instancePath || '/'}: ${e.message}`),
          warnings: []
        });
        toast.error(`Validation failed with ${(validate.errors || []).length} error(s)`);
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['Invalid JSON format'],
        warnings: []
      });
      toast.error('Invalid JSON format');
    }
  };

  const generateSampleJson = () => {
    const generateSample = (fields: SchemaField[]): any => {
      const result: any = {};
      fields.forEach(field => {
        if (field.type === 'Nested' && field.children) {
          result[field.name] = generateSample(field.children);
        } else {
          result[field.name] = field.value;
        }
      });
      return result;
    };

    const sample = generateSample(fields);
    setJsonInput(JSON.stringify(sample, null, 2));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Validate JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            JSON Schema Validation
          </DialogTitle>
          <span id="schema-validation-desc" className="sr-only">Validate your JSON data against the current schema.</span>
        </DialogHeader>
        <div aria-describedby="schema-validation-desc">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Enter JSON data to validate against your schema or a custom JSON Schema
              </p>
              <Button variant="outline" size="sm" onClick={generateSampleJson}>
                Generate Sample
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium mb-1">JSON Schema (optional)</label>
                <Textarea
                  placeholder="Paste your JSON Schema here (optional, overrides builder schema)"
                  value={schemaInput}
                  onChange={e => setSchemaInput(e.target.value)}
                  className="min-h-[200px] font-mono text-xs mb-2"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium mb-1">
                  JSON Data
                  <span className="text-[10px] text-muted-foreground ml-1">(if no schema is provided, validates against builder schema)</span>
                </label>
                <Textarea
                  placeholder="Enter your JSON data here..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleValidation}>
                Validate JSON
              </Button>
              <Button variant="outline" onClick={() => setJsonInput('')}>
                Clear
              </Button>
            </div>
            {validationResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {validationResult.isValid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <Badge variant="default" className="bg-green-500">Valid</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <Badge variant="destructive">Invalid</Badge>
                    </>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {validationResult.errors.length} error(s), {validationResult.warnings.length} warning(s)
                  </span>
                </div>
                {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                  <ScrollArea className="h-48 w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {validationResult.errors.map((error, index) => (
                        <div key={`error-${index}`} className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                        </div>
                      ))}
                      {validationResult.warnings.map((warning, index) => (
                        <div key={`warning-${index}`} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-600 dark:text-yellow-400">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};