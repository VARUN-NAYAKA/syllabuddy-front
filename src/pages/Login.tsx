import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { signIn, signUp, user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "", // Email for both signup and signin
    password: "",
    fullName: "",
    usnOrEmployeeId: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const isStudent = type === "student";
  const userType = isStudent ? "student" : "faculty";
  const title = isStudent ? "Student Portal" : "Faculty Portal";
  const description = isStudent 
    ? "Access your personalized learning dashboard" 
    : "Manage your classroom and track student progress";
  const Icon = isStudent ? GraduationCap : Users;
  const idLabel = isStudent ? "USN" : "Employee ID";

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.user_type === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/faculty-dashboard');
      }
    }
  }, [user, profile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(formData.email, formData.password, userType);
    
    if (!error) {
      // Navigation will be handled by useEffect when profile loads
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.usnOrEmployeeId,
      userType
    );
    
    if (!error) {
      setIsSignUp(false);
      setFormData({
        email: "",
        password: "",
        fullName: "",
        usnOrEmployeeId: "",
        confirmPassword: ""
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="glass"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        
        <Card className="bg-black/40 border-white/30 backdrop-blur-lg shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-white text-2xl font-bold drop-shadow-lg">{title}</CardTitle>
            <CardDescription className="text-white/90 font-medium">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => setIsSignUp(value === "signup")}>
              <TabsList className="grid w-full grid-cols-2 bg-black/30 border border-white/20">
                <TabsTrigger value="signin" className="text-white data-[state=active]:bg-primary/50 data-[state=active]:text-white font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-white data-[state=active]:bg-primary/50 data-[state=active]:text-white font-medium">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:bg-white/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                    <Input 
                      id="password"
                      name="password"
                      type="password" 
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:bg-white/30"
                      required
                    />
                  </div>
                  <Button variant="hero" size="lg" className="w-full bg-primary/80 hover:bg-primary text-white font-semibold shadow-lg" type="submit" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white font-medium">Full Name</Label>
                    <Input 
                      id="fullName"
                      name="fullName"
                      type="text" 
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:bg-white/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usnOrEmployeeId" className="text-white font-medium">{idLabel}</Label>
                    <Input 
                      id="usnOrEmployeeId"
                      name="usnOrEmployeeId"
                      type="text" 
                      value={formData.usnOrEmployeeId}
                      onChange={handleInputChange}
                      placeholder={`Enter your ${idLabel.toLowerCase()}`}
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:bg-white/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-white font-medium">Email</Label>
                    <Input 
                      id="signupEmail"
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:bg-white/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-white font-medium">Password</Label>
                    <Input 
                      id="signupPassword"
                      name="password"
                      type="password" 
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:bg-white/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="bg-white/20 border-white/40 text-white placeholder:text-white/70 focus:bg-white/30"
                      required
                    />
                  </div>
                  <Button variant="hero" size="lg" className="w-full bg-primary/80 hover:bg-primary text-white font-semibold shadow-lg" type="submit" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;