"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Document {
  id: string;
  name: string;
  createdAt: string;
}

export default function FaqManagement() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    // In a real app, you would fetch the list of documents from the backend
    // For now, we'll just use a dummy list
    setDocuments([
      { id: '1', name: 'Campus Policy.pdf', createdAt: new Date().toISOString() },
      { id: '2', name: 'Fee Structure.pdf', createdAt: new Date().toISOString() },
    ]);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pdf/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to upload file.');
      }

      // Refresh the list of documents
      fetchDocuments();
      setFile(null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQ & Document Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Upload New Document</h3>
            <div className="flex items-center gap-2 mt-2">
              <Input type="file" accept=".pdf" onChange={handleFileChange} />
              <Button onClick={handleUpload} disabled={isLoading || !file}>
                {isLoading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div>
            <h3 className="font-semibold">Uploaded Documents</h3>
            <ul className="mt-2 space-y-2">
              {documents.map(doc => (
                <li key={doc.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span>{doc.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
