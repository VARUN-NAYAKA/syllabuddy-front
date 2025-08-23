import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface FacultyHeaderProps {
  onMenuToggle: () => void;
}

const FacultyHeader: React.FC<FacultyHeaderProps> = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = [
    'Theory of Computation',
    'Full Stack Development', 
    'Data Base Management System',
    'Software Engineering & Project Management',
    'Block Chain Applications'
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Teaching is the profession that teaches all other professions.",
      "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
      "The art of teaching is the art of assisting discovery.",
      "What the teacher is, is more important than what he teaches.",
      "The best teachers are those who show you where to look but don't tell you what to see.",
      "Teaching is not a lost art, but the regard for it is a lost tradition.",
      "The influence of a good teacher can never be erased."
    ];
    
    const today = new Date().toDateString();
    const stored = localStorage.getItem('dailyFacultyQuote');
    const storedData = stored ? JSON.parse(stored) : null;
    
    if (storedData && storedData.date === today) {
      return storedData.quote;
    }
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    localStorage.setItem('dailyFacultyQuote', JSON.stringify({ date: today, quote: randomQuote }));
    return randomQuote;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="bg-background border-b border-border p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu and Greeting */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">
              {getGreeting()}, Prof. {profile?.full_name?.split(' ')[0] || 'Faculty'}!
            </h1>
            <p className="text-sm text-muted-foreground italic">
              "{getMotivationalQuote()}"
            </p>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Search Results */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => {
                      navigate('/faculty-dashboard/syllabus');
                      setSearchQuery('');
                    }}
                  >
                    {subject}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No subjects found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - User Info */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">
              {profile?.usn_or_employee_id}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile?.full_name}
            </p>
          </div>
          
          <Avatar 
            className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => navigate('/faculty-dashboard/profile')}
          >
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.full_name ? getInitials(profile.full_name) : 'FC'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default FacultyHeader;