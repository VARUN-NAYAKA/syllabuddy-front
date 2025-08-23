import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Clipboard, 
  Settings, 
  HelpCircle,
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface FacultySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FacultySidebar: React.FC<FacultySidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { 
      icon: BookOpen, 
      label: 'Syllabus', 
      path: '/faculty-dashboard/syllabus',
      description: 'Manage curriculum'
    },
    { 
      icon: Calendar, 
      label: "Today's Update", 
      path: '/faculty-dashboard/updates',
      description: 'Post announcements'
    },
    { 
      icon: FileText, 
      label: 'Upload Notes', 
      path: '/faculty-dashboard/notes',
      description: 'Share study materials'
    },
    { 
      icon: Clipboard, 
      label: 'Assign Tasks', 
      path: '/faculty-dashboard/assignments',
      description: 'Create assignments'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">FACULTY PORTAL</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.path}
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 flex-col items-start",
                  active && "bg-primary/10 text-primary border-primary/20"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Settings Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={toggleTheme}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              alert(`For more information contact the development team of 5th C:\n- Varun Nayaka G\n- Sudeep S Bingolli\n- Vasundhara S Kanchi\n- Suravi BC\n- Tanish M S`);
            }}
          >
            <HelpCircle className="h-5 w-5 mr-3" />
            <span>Help & Feedback</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default FacultySidebar;