import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, FileText, Clipboard, TrendingUp, Clock, FileCheck, Trophy, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const StudentDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignmentsUploaded, setAssignmentsUploaded] = useState(0);
  const [assignmentsCompleted, setAssignmentsCompleted] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate('/login/student');
    } else if (!loading && profile && profile.user_type !== 'student') {
      navigate('/faculty-dashboard');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      // Delete expired assignments
      deleteExpiredAssignments();
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const activitiesChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignment_submissions'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activitiesChannel);
    };
  }, [user]);

  const deleteExpiredAssignments = async () => {
    try {
      await supabase.rpc('delete_expired_assignments');
    } catch (error) {
      console.error('Error deleting expired assignments:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch assignment submissions count
      const { count: submissionsCount } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id);

      setAssignmentsUploaded(submissionsCount || 0);

      // Fetch graded submissions count
      const { count: gradedCount } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id)
        .not('marks', 'is', null);

      setAssignmentsCompleted(gradedCount || 0);

      // Fetch recent activities (assignments, syllabus uploads, notes uploads)
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivities(activitiesData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

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
        { icon: BookOpen, label: 'Syllabus', path: '/syllabus', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
        { icon: Calendar, label: "Today's Updates", path: '/student-dashboard/updates', color: 'bg-gradient-to-br from-green-500 to-green-600' },
        { icon: FileText, label: 'Notes', path: '/notes', color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
        { icon: Clipboard, label: 'Assignments', path: '/assignments', color: 'bg-gradient-to-br from-orange-500 to-orange-600' }
      ]
    },
    {
      title: 'Recent Activity',
      description: 'Latest updates from faculty and your submissions',
      items: recentActivities
    },
    {
      title: 'Progress Overview',
      description: 'Track your academic journey',
      stats: [
        { label: 'Subjects Enrolled', value: '5', icon: BookOpen },
        { label: 'Assignments Uploaded', value: assignmentsUploaded.toString(), icon: Upload },
        { label: 'Assignments Completed', value: assignmentsCompleted.toString(), icon: Clipboard }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-2 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
              {/* Quick Access Card */}
              <Card className="xl:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle>{dashboardCards[0].title}</CardTitle>
                  <CardDescription>{dashboardCards[0].description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {dashboardCards[0].items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-20 sm:h-24 flex-col space-y-1 sm:space-y-2 hover:bg-muted/50 transition-colors border-2 hover:border-primary/50 p-2"
                          onClick={() => navigate(item.path)}
                        >
                          <div className={`p-2 sm:p-3 rounded-xl ${item.color} text-white shadow-lg`}>
                            <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-center leading-tight">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Progress Overview Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>{dashboardCards[2].title}</CardTitle>
                  <CardDescription>{dashboardCards[2].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {dashboardCards[2].stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="xl:col-span-3">
                <CardHeader className="pb-4">
                  <CardTitle>{dashboardCards[1].title}</CardTitle>
                  <CardDescription>{dashboardCards[1].description}</CardDescription>
                </CardHeader>
                <CardContent>
                {dashboardCards[1].items.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activities to display</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {dashboardCards[1].items.map((item: any, index: number) => {
                      const getActivityIcon = (activityType: string) => {
                        switch (activityType) {
                          case 'assignment_upload':
                            return Clipboard;
                          case 'assignment_submit':
                            return Upload;
                          case 'syllabus_upload':
                            return BookOpen;
                          case 'notes_upload':
                            return FileText;
                          default:
                            return Clock;
                        }
                      };

                      const ActivityIcon = getActivityIcon(item.activity_type);
                      return (
                        <div key={index} className="flex items-start sm:items-center space-x-3 sm:space-x-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <ActivityIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground break-words">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.subject}</p>
                            <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              </Card>
            </div>

            {/* Motivational Quote Section */}
            <Card className="mt-4 lg:mt-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-4 lg:p-6">
                <div className="text-center">
                  <blockquote className="text-base lg:text-lg font-medium text-primary italic mb-2">
                    "Success is the sum of small efforts repeated day in and day out."
                  </blockquote>
                  <cite className="text-sm text-muted-foreground">— Robert Collier</cite>
                </div>
              </CardContent>
            </Card>

            {/* Welcome Section */}
            <Card className="mt-4 lg:mt-6">
              <CardContent className="p-4 lg:p-6">
                <div className="text-center">
                  <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                    Welcome to Your Learning Hub!
                  </h2>
                  <p className="text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto">
                    Track your progress across subjects, stay updated with daily announcements, 
                    access study materials, and manage assignments - all in one place. 
                    Your academic success starts here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;