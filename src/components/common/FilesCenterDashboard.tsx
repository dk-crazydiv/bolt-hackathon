import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export interface FileMeta {
  id: string;
  name: string;
  type: string;
  owner: string;
  lastModified: string;
  size: string;
  status: 'Active' | 'Archived';
}

const mockFiles: FileMeta[] = [
  {
    id: '1',
    name: 'Q1 Financial Report.pdf',
    type: 'PDF',
    owner: 'John Doe',
    lastModified: '2024-05-01',
    size: '2.1 MB',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Employee Handbook.docx',
    type: 'DOCX',
    owner: 'Jane Smith',
    lastModified: '2024-04-15',
    size: '1.2 MB',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Project Plan.xlsx',
    type: 'XLSX',
    owner: 'Alice Johnson',
    lastModified: '2024-03-28',
    size: '3.4 MB',
    status: 'Archived',
  },
];

export const FilesCenterDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Files Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockFiles.map((file) => (
          <Card key={file.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {file.name}
                <Badge variant={file.status === 'Active' ? 'default' : 'secondary'}>
                  {file.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div><strong>Type:</strong> {file.type}</div>
                <div><strong>Owner:</strong> {file.owner}</div>
                <div><strong>Last Modified:</strong> {file.lastModified}</div>
                <div><strong>Size:</strong> {file.size}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline">View</Button>
                <Button size="sm" variant="default">Download</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 