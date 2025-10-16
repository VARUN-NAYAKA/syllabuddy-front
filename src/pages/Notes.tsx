import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, FileText, ExternalLink, Calendar, Trash2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/FileUpload';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Notes: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [notesFiles, setNotesFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const subjects = [
    'Theory of Computation',
    'Full Stack Development', 
    'Data Base Management System',
    'Software Engineering & Project Management',
    'Block Chain Applications'
  ];

  const fetchNotesFiles = async () => {
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('semester', 5)
        .order('created_at', { ascending: false });

      // If faculty, filter by their subject
      if (isFaculty && profile?.subject) {
        query = query.eq('subject', profile.subject);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotesFiles(data || []);
    } catch (error) {
      console.error('Error fetching notes files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast.success('Note deleted successfully');
      fetchNotesFiles(); // Refresh data
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  useEffect(() => {
    fetchNotesFiles();
  }, []);

  const getNotesForSubject = (subject: string) => {
    return notesFiles.filter(note => note.subject === subject);
  };

  const handleNoteClick = (noteUrl: string) => {
    window.open(noteUrl, '_blank');
  };

  const isFaculty = profile?.user_type === 'faculty';

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Notes for 5th Semester</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(isFaculty && profile?.subject ? [profile.subject] : subjects).map((subject, index) => {
                const subjectNotes = getNotesForSubject(subject);
                return (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">{subject}</h3>
                      {isFaculty && profile?.subject === subject && (
                        <FileUpload
                          type="notes"
                          subject={subject}
                          onUploadSuccess={fetchNotesFiles}
                        />
                      )}
                    </div>
                    
                    {subjectNotes.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {subjectNotes.map((note) => (
                          <div 
                            key={note.id}
                            className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => handleNoteClick(note.file_url)}
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <span className="font-medium text-sm">{note.title}</span>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{note.file_name}</p>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(new Date(note.created_at), 'MMM dd, yyyy')}</span>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(note.file_url, '_blank');
                                  }}
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                {isFaculty && note.uploaded_by === user?.id && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNote(note.id);
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No notes uploaded for this subject yet</p>
                        {!isFaculty && <p className="text-sm">Check back later for study materials</p>}
                      </div>
                    )}
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

export default Notes;