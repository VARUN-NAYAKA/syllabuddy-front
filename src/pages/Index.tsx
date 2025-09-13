import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import { Users, BookOpen, Clock, HelpCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Students",
      description: "Revise based on actual class flow."
    },
    {
      icon: HelpCircle,
      title: "Feedback",
      description: "Request revision or flag unclear topics."
    },
    {
      icon: Clock,
      title: "SyllabusProtocols, ModuleDeadlines",
      description: "Track what you have learned in each class, across subjects and modules."
    },
    {
      icon: BookOpen,
      title: "Course Structure",
      description: "Who teaches what, and how it's structured."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-6xl font-bold text-white">
            CLASSROOM
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Track what you have learned in each class, across subjects and modules, 
            while aligning with syllabus deadlines and protocols.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* Action Buttons - Mobile first layout */}
        <div className="flex flex-col gap-4 justify-center items-center md:flex-row md:gap-6">
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/login/student")}
            className="w-full max-w-xs px-8 py-4 text-lg md:w-auto"
          >
            Student Login
          </Button>
          <Button
            variant="glass"
            size="lg"
            onClick={() => navigate("/login/faculty")}
            className="w-full max-w-xs px-8 py-4 text-lg md:w-auto"
          >
            Faculty Login
          </Button>
        </div>

        {/* Footer Text */}
        <p className="text-white/70 text-sm">
          Challenge your learning knowledge with friends or learn solo!
        </p>
      </div>
    </div>
  );
};

export default Index;
