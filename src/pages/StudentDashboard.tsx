import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, FileText, Clipboard, TrendingUp, Clock, FileCheck, Trophy } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      navigate('/login/student');
    } else if (!loading && profile && profile.user_type !== 'student') {
      navigate('/faculty-dashboard');
    }
  }, [user, profile, loading, navigate]);

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

  const subjects = [
    'Theory of Computation',
    'Full Stack Development', 
    'Data Base Management System',
    'Software Engineering & Project Management',
    'Block Chain Applications'
  ];

  const dashboardCards = [
    {
      title: 'Quick Access',
      description: 'Jump to your most used sections',
      items: [
        { icon: BookOpen, label: 'Syllabus', path: '/syllabus', color: 'bg-blue-500' },
        { icon: Calendar, label: "Today's Updates", path: '/student-dashboard/updates', color: 'bg-green-500' },
        { icon: FileText, label: 'Notes', path: '/notes', color: 'bg-purple-500' },
        { icon: Clipboard, label: 'Assignments', path: '/assignments', color: 'bg-orange-500' }
      ]
    },
    {
      title: 'Recent Activity',
      description: 'Your latest learning activities',
      items: []
    },
    {
      title: 'Progress Overview',
      description: 'Track your academic journey',
      stats: [
        { label: 'Subjects Enrolled', value: '5', icon: BookOpen },
        { label: 'Assignments Completed', value: '0', icon: Clipboard },
        { label: 'Study Hours This Week', value: '0', icon: TrendingUp }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Subject Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {subjects.map((subject, index) => (
                <Card key={subject} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/60 hover:border-l-primary">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{subject}</CardTitle>
                        <CardDescription>5th Semester</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/syllabus')}
                        className="flex items-center space-x-2 hover:bg-primary/10 hover:border-primary/50"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Syllabus</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/notes')}
                        className="flex items-center space-x-2 hover:bg-primary/10 hover:border-primary/50"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Notes</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/assignments')}
                        className="flex items-center space-x-2 hover:bg-primary/10 hover:border-primary/50"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Assignments</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/assessment')}
                        className="flex items-center space-x-2 hover:bg-primary/10 hover:border-primary/50"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Assessment</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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

              {/* Progress Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{dashboardCards[2].title}</CardTitle>
                  <CardDescription>{dashboardCards[2].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <span className="text-xl font-bold text-foreground">{stat.value}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="xl:col-span-3">
                <CardHeader>
                  <CardTitle>{dashboardCards[1].title}</CardTitle>
                  <CardDescription>{dashboardCards[1].description}</CardDescription>
                </CardHeader>
              <CardContent>
                {dashboardCards[1].items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activities to display</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardCards[1].items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="p-2 bg-muted rounded-lg">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              </Card>
            </div>

            {/* Motivational Quote Section */}
            <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <blockquote className="text-lg font-medium text-primary italic mb-2">
                    "Success is the sum of small efforts repeated day in and day out."
                  </blockquote>
                  <cite className="text-sm text-muted-foreground">— Robert Collier</cite>
                </div>
              </CardContent>
            </Card>

            {/* Welcome Section */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome to Your Learning Hub!
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
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