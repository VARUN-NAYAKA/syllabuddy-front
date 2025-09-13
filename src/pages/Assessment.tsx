import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Upload, Download, FileText, Trophy, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [gradingOpen, setGradingOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [formData, setFormData] = useState({
    assignmentId: '',
    file: null as File | null
  });
  const [gradingData, setGradingData] = useState({
    marks: '',
    feedback: ''
  });

  const isFaculty = profile?.user_type === 'faculty';

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      // Fetch assignments
      let assignmentsQuery = supabase
        .from('assignments')
        .select('*')
        .eq('semester', 5)
        .order('created_at', { ascending: false });

      if (isFaculty && profile?.subject) {
        assignmentsQuery = assignmentsQuery.eq('subject', profile.subject);
      }

      const { data: assignmentsData, error: assignmentsError } = await assignmentsQuery;
      if (assignmentsError) throw assignmentsError;

      setAssignments(assignmentsData || []);

      // Fetch submissions
      let submissionsQuery = supabase
        .from('student_submissions')
        .select('*, assignments(title, subject)')
        .order('submitted_at', { ascending: false });

      if (isFaculty && profile?.subject) {
        submissionsQuery = submissionsQuery.eq('subject', profile.subject);
      } else if (!isFaculty) {
        submissionsQuery = submissionsQuery.eq('student_id', user?.id);
      }

      const { data: submissionsData, error: submissionsError } = await submissionsQuery;
      if (submissionsError) throw submissionsError;

      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch assessment data');
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

  const handleSubmissionUpload = async () => {
    if (!formData.file || !user || !formData.assignmentId) return;

    setUploading(true);

    try {
      const selectedAssignment = assignments.find(a => a.id === formData.assignmentId);
      if (!selectedAssignment) throw new Error('Assignment not found');

      // Upload file to storage
      const fileName = `${Date.now()}_${formData.file.name}`;
      const filePath = `${user.id}/${selectedAssignment.subject.replace(/\s+/g, '_').toLowerCase()}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student_submissions')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student_submissions')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('student_submissions')
        .insert([{
          student_id: user.id,
          assignment_id: formData.assignmentId,
          subject: selectedAssignment.subject,
          file_url: publicUrl,
          file_name: formData.file.name
        }]);

      if (dbError) throw dbError;

      toast.success('Submission uploaded successfully!');
      setOpen(false);
      setFormData({ assignmentId: '', file: null });
      fetchData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload submission');
    } finally {
      setUploading(false);
    }
  };

  const handleGrading = async () => {
    if (!selectedSubmission || !gradingData.marks) return;

    const marks = parseInt(gradingData.marks);
    if (marks < 0 || marks > 10) {
      toast.error('Marks must be between 0 and 10');
      return;
    }

    try {
      const { error } = await supabase
        .from('student_submissions')
        .update({
          marks,
          feedback: gradingData.feedback.trim() || null,
          graded_by: user?.id,
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast.success('Submission graded successfully!');
      setGradingOpen(false);
      setSelectedSubmission(null);
      setGradingData({ marks: '', feedback: '' });
      fetchData();
    } catch (error) {
      console.error('Grading error:', error);
      toast.error('Failed to grade submission');
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('student_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Submission deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Assessment Center</h1>
          <p className="text-muted-foreground">
            {isFaculty ? 'Grade student submissions and provide feedback' : 'Submit your assignments and view grades'}
          </p>
        </div>

        <Tabs defaultValue={isFaculty ? "grading" : "submissions"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submissions">
              {isFaculty ? 'Student Submissions' : 'My Submissions'}
            </TabsTrigger>
            <TabsTrigger value="grading">
              {isFaculty ? 'Grading' : 'Upload Work'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>{isFaculty ? 'Student Submissions' : 'My Submissions'}</span>
                </CardTitle>
                <CardDescription>
                  {isFaculty ? 'View and grade student work' : 'Track your submission status and grades'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No submissions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="flex-1">
                          <h4 className="font-medium">{submission.assignments?.title}</h4>
                          <p className="text-sm text-muted-foreground">{submission.assignments?.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                          {submission.marks !== null && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Grade: {submission.marks}/10
                              </span>
                              {submission.feedback && (
                                <p className="text-sm text-muted-foreground mt-1">Feedback: {submission.feedback}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(submission.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          {isFaculty && submission.marks === null && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setGradingOpen(true);
                              }}
                            >
                              Grade
                            </Button>
                          )}
                          {!isFaculty && submission.marks === null && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSubmission(submission.id)}
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
          </TabsContent>

          <TabsContent value="grading">
            {isFaculty ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Grading</CardTitle>
                  <CardDescription>Submissions waiting for your review</CardDescription>
                </CardHeader>
                <CardContent>
                  {submissions.filter(s => s.marks === null).length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No submissions pending grading</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions.filter(s => s.marks === null).map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{submission.assignments?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(submission.file_url, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setGradingOpen(true);
                              }}
                            >
                              Grade
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Submit Assignment</CardTitle>
                      <CardDescription>Upload your completed work for assessment</CardDescription>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Work
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Assignment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="assignment">Select Assignment</Label>
                            <select
                              id="assignment"
                              className="w-full p-2 border rounded-md"
                              value={formData.assignmentId}
                              onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
                            >
                              <option value="">Choose an assignment</option>
                              {assignments.map((assignment) => (
                                <option key={assignment.id} value={assignment.id}>
                                  {assignment.title} - {assignment.subject}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="file">PDF File</Label>
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
                              onClick={handleSubmissionUpload}
                              disabled={!formData.file || !formData.assignmentId || uploading}
                            >
                              {uploading ? 'Uploading...' : 'Submit'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Click "Upload Work" to submit your assignments</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Grading Dialog */}
        <Dialog open={gradingOpen} onOpenChange={setGradingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="marks">Marks (0-10)</Label>
                <Input
                  id="marks"
                  type="number"
                  min="0"
                  max="10"
                  value={gradingData.marks}
                  onChange={(e) => setGradingData({ ...gradingData, marks: e.target.value })}
                  placeholder="Enter marks out of 10"
                />
              </div>
              <div>
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  value={gradingData.feedback}
                  onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                  placeholder="Provide feedback to the student"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setGradingOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGrading}
                  disabled={!gradingData.marks}
                >
                  Submit Grade
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Assessment;