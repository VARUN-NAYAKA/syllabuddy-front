import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, User } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  usn_or_employee_id: string;
}

interface StudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

const StudentListModal: React.FC<StudentListModalProps> = ({ isOpen, onClose, students }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Enrolled Students ({students.length})</span>
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto space-y-3">
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students enrolled yet
            </div>
          ) : (
            students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{student.full_name}</p>
                  <p className="text-sm text-muted-foreground">USN: {student.usn_or_employee_id}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentListModal;