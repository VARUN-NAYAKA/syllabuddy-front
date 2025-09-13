import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FacultyHeader from '@/components/layout/FacultyHeader';
import FacultySidebar from '@/components/layout/FacultySidebar';
import StudentListModal from '@/components/StudentListModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, FileText, Clipboard, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const FacultyDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentsCount, setStudentsCount] = useState(0);
  const [students, setStudents] = useState<any[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [notesCount, setNotesCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate('/login/faculty');
    } else if (!loading && profile && profile.user_type !== 'faculty') {
      navigate('/student-dashboard');
    }
  }, [user, profile, loading, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, usn_or_employee_id')
          .eq('user_type', 'student');
        
        if (studentsError) throw studentsError;
        
        setStudents(studentsData || []);
        setStudentsCount(studentsData?.length || 0);

        // Fetch notes count for faculty's subject
        if (profile?.subject) {
          const { count: notesCount, error: notesError } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('subject', profile.subject)
            .eq('uploaded_by', user.id);
          
          if (!notesError) {
            setNotesCount(notesCount || 0);
          }

          // Fetch assignments count for faculty's subject
          const { count: assignmentsCount, error: assignmentsError } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('subject', profile.subject)
            .eq('uploaded_by', user.id);
          
          if (!assignmentsError) {
            setAssignmentsCount(assignmentsCount || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStudentsCount(0);
        setNotesCount(0);
        setAssignmentsCount(0);
      }
    };

    if (user && profile) {
      fetchDashboardData();
    }
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect
  }

  const dashboardCards = [
    {
      title: 'Quick Access',
      description: 'Jump to your most used sections',
      items: [
        { icon: BookOpen, label: 'Syllabus', path: '/faculty-dashboard/syllabus', color: 'bg-blue-500' },
        { icon: Calendar, label: "Today's Updates", path: '/faculty-dashboard/updates', color: 'bg-green-500' },
        { icon: FileText, label: 'Upload Notes', path: '/faculty-dashboard/notes', color: 'bg-purple-500' },
        { icon: Clipboard, label: 'Assign Tasks', path: '/faculty-dashboard/assignments', color: 'bg-orange-500' }
      ]
    },
    {
      title: 'Teaching Overview',
      description: 'Track your teaching activities',
      stats: [
        { 
          label: 'Students Enrolled', 
          value: studentsCount.toString(), 
          icon: Users,
          clickable: true,
          onClick: () => setShowStudentModal(true)
        },
        { label: 'Notes Uploaded', value: notesCount.toString(), icon: FileText },
        { label: 'Tasks Assigned', value: assignmentsCount.toString(), icon: Clipboard }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <FacultySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
        <FacultyHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Subject Display */}
            {profile.subject && (
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold text-primary dark:text-primary-foreground drop-shadow-lg mb-2">
                  {profile.subject}
                </h2>
                <p className="text-lg font-medium text-foreground bg-background/80 px-4 py-2 rounded-lg inline-block shadow-sm">
                  Subject you're teaching
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Quick Access Card */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>{dashboardCards[0].title}</CardTitle>
                  <CardDescription>{dashboardCards[0].description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {dashboardCards[0].items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-24 flex-col space-y-2 hover:bg-muted/50 transition-colors"
                          onClick={() => navigate(item.path)}
                        >
                          <div className={`p-2 rounded-lg ${item.color} text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium text-center">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Teaching Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{dashboardCards[1].title}</CardTitle>
                  <CardDescription>{dashboardCards[1].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardCards[1].stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-xl font-bold text-foreground p-0 h-auto"
                          onClick={stat.clickable ? stat.onClick : undefined}
                          disabled={!stat.clickable}
                        >
                          {stat.value}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Motivational Quote Section */}
            <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <blockquote className="text-lg font-medium text-primary italic mb-2">
                    "Teaching is the profession that teaches all other professions."
                  </blockquote>
                  <cite className="text-sm text-muted-foreground">— Teaching Wisdom</cite>
                </div>
              </CardContent>
            </Card>

            {/* Welcome Section */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome to Your Teaching Hub!
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Manage your course content, upload study materials, assign tasks to students, 
                    and track teaching progress - all in one place. Empower your students' learning journey.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <StudentListModal 
        isOpen={showStudentModal} 
        onClose={() => setShowStudentModal(false)} 
        students={students} 
      />
    </div>
  );
};

export default FacultyDashboard;