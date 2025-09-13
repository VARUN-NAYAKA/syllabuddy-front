import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import Profile from "./pages/Profile";
import FacultyProfile from "./pages/FacultyProfile";
import Syllabus from "./pages/Syllabus";
import Notes from "./pages/Notes";
import Assignments from "./pages/Assignments";
import Assessment from "./pages/Assessment";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login/:type" element={<Login />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/student-dashboard/profile" element={<Profile />} />
              <Route path="/student-dashboard/syllabus" element={<Syllabus />} />
              <Route path="/student-dashboard/updates" element={<PlaceholderPage title="Today's Updates" description="Daily announcements and updates will appear here." />} />
              <Route path="/student-dashboard/notes" element={<Notes />} />
              <Route path="/student-dashboard/assignments" element={<Assignments />} />
              <Route path="/student-dashboard/help" element={<PlaceholderPage title="Help & Feedback" description="Get help and provide feedback about the platform." />} />
              <Route path="/syllabus" element={<Syllabus />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty-dashboard/profile" element={<FacultyProfile />} />
              <Route path="/faculty-dashboard/syllabus" element={<Syllabus />} />
              <Route path="/faculty-dashboard/updates" element={<PlaceholderPage title="Today's Updates" description="Post daily announcements and updates here." />} />
              <Route path="/faculty-dashboard/notes" element={<Notes />} />
              <Route path="/faculty-dashboard/assignments" element={<Assignments />} />
              <Route path="/faculty-dashboard/help" element={<PlaceholderPage title="Help & Feedback" description="Get help and provide feedback about the platform." />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
