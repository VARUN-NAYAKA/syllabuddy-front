import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/FileUpload';
import { toast } from 'sonner';

const Syllabus: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [syllabusFiles, setSyllabusFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const subjects = [
    'Theory of Computation',
    'Full Stack Development', 
    'Data Base Management System',
    'Software Engineering & Project Management',
    'Block Chain Applications'
  ];

  const fetchSyllabusFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('syllabus')
        .select('*')
        .eq('semester', 5);

      if (error) throw error;
      setSyllabusFiles(data || []);
    } catch (error) {
      console.error('Error fetching syllabus files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabusFiles();
  }, []);

  const getSyllabusFile = (subject: string) => {
    return syllabusFiles.find(file => file.subject === subject);
  };

  const handleSubjectClick = (subject: string) => {
    const syllabusFile = getSyllabusFile(subject);
    if (syllabusFile) {
      window.open(syllabusFile.file_url, '_blank');
    }
  };

  const isFaculty = profile?.user_type === 'faculty';

  const handleDeleteSyllabus = async (syllabusId: string) => {
    try {
      const { error } = await supabase
        .from('syllabus')
        .delete()
        .eq('id', syllabusId);

      if (error) throw error;

      toast.success('Syllabus deleted successfully');
      fetchSyllabusFiles();
    } catch (error) {
      console.error('Error deleting syllabus:', error);
      toast.error('Failed to delete syllabus');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Syllabus for 5th Semester</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjects.map((subject, index) => {
                const syllabusFile = getSyllabusFile(subject);
                return (
                  <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleSubjectClick(subject)}
                      >
                        <h3 className="font-medium text-foreground flex items-center">
                          {syllabusFile && <FileText className="w-4 h-4 mr-2 text-primary" />}
                          {subject}
                          {syllabusFile && <ExternalLink className="w-4 h-4 ml-2 text-muted-foreground" />}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {syllabusFile ? 'Click to view syllabus PDF' : 'No syllabus uploaded yet'}
                        </p>
                      </div>
                      {isFaculty && profile?.subject === subject && (
                        <div className="flex space-x-2">
                          <FileUpload
                            type="syllabus"
                            subject={subject}
                            existingFile={syllabusFile}
                            onUploadSuccess={fetchSyllabusFiles}
                          />
                          {syllabusFile && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSyllabus(syllabusFile.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Syllabus;