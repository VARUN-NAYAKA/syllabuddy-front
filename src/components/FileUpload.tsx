import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FileUploadProps {
  type: 'syllabus' | 'notes';
  subject: string;
  existingFile?: {
    id: string;
    file_name: string;
    file_url: string;
  };
  onUploadSuccess?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ type, subject, existingFile, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/json' || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/jpg') {
        setFile(selectedFile);
      } else {
        toast.error('Please select a PDF, JSON, or JPG file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    if (type === 'notes' && !title.trim()) {
      toast.error('Please enter a title for the notes');
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${subject.replace(/\s+/g, '_').toLowerCase()}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(type)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(type)
        .getPublicUrl(filePath);

      // Save to database
      const dbData = {
        subject,
        file_url: publicUrl,
        file_name: file.name,
        uploaded_by: user.id,
        ...(type === 'notes' && { title: title.trim() })
      };

      if (existingFile) {
        // Delete old file from storage first
        const oldFilePath = existingFile.file_url.split('/').pop();
        if (oldFilePath) {
          await supabase.storage
            .from(type)
            .remove([`${subject.replace(/\s+/g, '_').toLowerCase()}/${oldFilePath}`]);
        }
        
        // Update existing record
        const { error: dbError } = await supabase
          .from(type)
          .update(dbData)
          .eq('id', existingFile.id);

        if (dbError) throw dbError;
      } else {
        // Insert new record
        const { error: dbError } = await supabase
          .from(type)
          .insert([dbData]);

        if (dbError) throw dbError;
      }

      // Log activity
      await supabase
        .from('activities')
        .insert([{
          user_id: user.id,
          activity_type: type === 'syllabus' ? 'syllabus_upload' : 'notes_upload',
          subject: subject,
          title: `${type === 'syllabus' ? 'Syllabus' : 'Notes'} ${existingFile ? 'updated' : 'uploaded'}: ${type === 'notes' ? title.trim() : subject}`,
          description: `${existingFile ? 'Updated' : 'Uploaded'} ${type === 'syllabus' ? 'syllabus' : 'notes'} for ${subject}`
        }]);

      toast.success(`${type === 'syllabus' ? 'Syllabus' : 'Notes'} uploaded successfully!`);
      setOpen(false);
      setFile(null);
      setTitle('');
      onUploadSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          {existingFile ? 'Update' : 'Upload'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingFile ? 'Update' : 'Upload'} {type === 'syllabus' ? 'Syllabus' : 'Notes'} - {subject}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {type === 'notes' && (
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notes title"
              />
            </div>
          )}
          <div>
            <Label htmlFor="file">PDF, JSON, or JPG File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.json,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </div>
          {existingFile && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Current: {existingFile.file_name}</span>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading || (type === 'notes' && !title.trim())}
            >
              {uploading ? 'Uploading...' : existingFile ? 'Update' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUpload;