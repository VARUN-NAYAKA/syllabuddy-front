import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Download, Upload, FileText, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

const Assignments: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [assignmentsData, setAssignmentsData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    file: null as File | null
  });
  const { toast: toastHook } = useToast();

  const isFaculty = profile?.user_type === 'faculty';

  useEffect(() => {
    fetchAssignmentsData();
    if (!isFaculty && user) {
      fetchSubmissions();
    }
  }, [profile, user]);

  const fetchSubmissions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;

      const submissionsMap: Record<string, any> = {};
      data?.forEach(submission => {
        submissionsMap[submission.assignment_id] = submission;
      });
      setSubmissions(submissionsMap);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchAssignmentsData = async () => {
    try {
      let query = supabase
        .from('assignments')
        .select('*')
        .eq('semester', 5)
        .order('created_at', { ascending: false });

      // If faculty, filter by their subject
      if (isFaculty && profile?.subject) {
        query = query.eq('subject', profile.subject);
      }

      const { data, error } = await query;

      if (error) throw error;

      const assignmentsMap: Record<string, any[]> = {};
      
      // If faculty, only show their subject
      if (isFaculty && profile?.subject) {
        assignmentsMap[profile.subject] = data || [];
      } else {
        // For students, show all subjects
        const subjects = [
          'Theory of Computation',
          'Full Stack Development', 
          'Data Base Management System',
          'Software Engineering & Project Management',
          'Block Chain Applications'
        ];
        
        subjects.forEach(subject => {
          assignmentsMap[subject] = [];
        });

        data?.forEach(item => {
          if (assignmentsMap[item.subject]) {
            assignmentsMap[item.subject].push(item);
          }
        });
      }

      setAssignmentsData(assignmentsMap);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFormData({ ...formData, file: selectedFile });
      } else {
        toast.error('Please select a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!formData.file || !user || !profile?.subject) return;

    if (!formData.title.trim()) {
      toast.error('Please enter a title for the assignment');
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileName = `${Date.now()}_${formData.file.name}`;
      const filePath = `${profile.subject.replace(/\s+/g, '_').toLowerCase()}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('assignments')
        .insert([{
          title: formData.title.trim(),
          description: formData.description.trim(),
          subject: profile.subject,
          file_url: publicUrl,
          file_name: formData.file.name,
          uploaded_by: user.id,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
        }]);

      if (dbError) throw dbError;

      // Log activity
      await supabase
        .from('activities')
        .insert([{
          user_id: user.id,
          activity_type: 'assignment_upload',
          subject: profile.subject,
          title: `New assignment: ${formData.title.trim()}`,
          description: formData.description.trim() || null
        }]);

      toast.success('Assignment uploaded successfully!');
      setOpen(false);
      setFormData({ title: '', description: '', dueDate: '', file: null });
      fetchAssignmentsData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload assignment');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Assignment deleted successfully');
      fetchAssignmentsData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const handleSubmissionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setSubmissionFile(selectedFile);
      } else {
        toast.error('Please select a PDF file');
      }
    }
  };

  const handleSubmitAssignment = async () => {
    if (!submissionFile || !selectedAssignment || !user) return;

    setSubmitting(true);

    try {
      // Upload file to storage
      const fileName = `${Date.now()}_${user.id}_${submissionFile.name}`;
      const filePath = `${selectedAssignment.subject.replace(/\s+/g, '_').toLowerCase()}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student_submissions')
        .upload(filePath, submissionFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student_submissions')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: selectedAssignment.id,
          student_id: user.id,
          file_url: publicUrl,
          file_name: submissionFile.name,
          subject: selectedAssignment.subject
        }]);

      if (dbError) throw dbError;

      // Log activity
      await supabase
        .from('activities')
        .insert([{
          user_id: user.id,
          activity_type: 'assignment_submit',
          subject: selectedAssignment.subject,
          title: `Submitted assignment: ${selectedAssignment.title}`,
          description: `Student submitted answer for ${selectedAssignment.title}`
        }]);

      toast.success('Assignment submitted successfully!');
      setSubmissionDialogOpen(false);
      setSubmissionFile(null);
      setSelectedAssignment(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Assignments</h1>
          <p className="text-muted-foreground">
            {isFaculty ? 'Upload and manage assignments for your students' : 'Download assignments for 5th Semester'}
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(assignmentsData).map(([subject, assignments]) => (
            <Card key={subject}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{subject}</CardTitle>
                      <CardDescription>
                        {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} available
                      </CardDescription>
                    </div>
                  </div>
                  {isFaculty && profile?.subject === subject && (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Assignment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Assignment - {subject}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Enter assignment title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Enter assignment description (optional)"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                              id="dueDate"
                              type="datetime-local"
                              value={formData.dueDate}
                              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="file">PDF File *</Label>
                            <Input
                              id="file"
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleUpload} 
                              disabled={!formData.file || !formData.title.trim() || uploading}
                            >
                              {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No assignments available for this subject</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="flex-1">
                          <h4 className="font-medium">{assignment.title}</h4>
                          {assignment.description && (
                            <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                          )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>Uploaded: {new Date(assignment.created_at).toLocaleDateString()}</span>
                            {assignment.due_date && (
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1 text-foreground/80 dark:text-foreground" />
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(assignment.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          
                          {!isFaculty && (
                            <>
                              {submissions[assignment.id] ? (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-green-600 font-medium">✓ Submitted</span>
                                  {submissions[assignment.id].marks !== null && (
                                    <span className="text-sm text-primary font-medium">
                                      Marks: {submissions[assignment.id].marks}/10
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAssignment(assignment);
                                    setSubmissionDialogOpen(true);
                                  }}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Submit
                                </Button>
                              )}
                            </>
                          )}
                          
                          {isFaculty && assignment.uploaded_by === user?.id && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assignment Submission Dialog */}
        <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
            </DialogHeader>
            {selectedAssignment && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedAssignment.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedAssignment.subject}</p>
                  {selectedAssignment.due_date && (
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="submissionFile">Upload your solution (PDF only)</Label>
                  <Input
                    id="submissionFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleSubmissionFileChange}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSubmissionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitAssignment} 
                    disabled={!submissionFile || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Assignments;