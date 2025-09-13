import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  onGraded: () => void;
}

const GradingModal: React.FC<GradingModalProps> = ({ isOpen, onClose, submission, onGraded }) => {
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const handleGrade = async () => {
    if (!marks || parseInt(marks) < 0 || parseInt(marks) > 10) {
      toast.error('Please enter marks between 0 and 10');
      return;
    }

    setGrading(true);
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          marks: parseInt(marks),
          feedback: feedback.trim() || null,
          graded_at: new Date().toISOString(),
          graded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', submission.id);

      if (error) throw error;

      // Log activity for student dashboard
      await supabase
        .from('activities')
        .insert({
          user_id: submission.student_id,
          activity_type: 'assignment_graded',
          title: `Assignment Graded: ${submission.assignments.title}`,
          subject: submission.assignments.subject,
          description: `Your assignment "${submission.assignments.title}" has been graded: ${marks}/10`
        });

      toast.success('Assignment graded successfully!');
      setMarks('');
      setFeedback('');
      onClose();
      onGraded();
    } catch (error) {
      console.error('Error grading assignment:', error);
      toast.error('Failed to grade assignment');
    } finally {
      setGrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Grade Assignment</DialogTitle>
        </DialogHeader>
        {submission && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Student:</strong> {submission.profiles?.full_name}
              </p>
              <p className="text-sm">
                <strong>Assignment:</strong> {submission.assignments?.title}
              </p>
              <p className="text-sm">
                <strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marks">Marks (0-10) *</Label>
              <Input
                id="marks"
                type="number"
                min="0"
                max="10"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="Enter marks out of 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter feedback for the student"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleGrade} 
                disabled={!marks || grading}
              >
                {grading ? 'Grading...' : 'Grade Assignment'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GradingModal;