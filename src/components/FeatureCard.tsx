import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-glass border border-glass backdrop-blur-md rounded-xl p-6 shadow-glass hover:bg-white/20 transition-smooth">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-accent/20">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
          <p className="text-white/80 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;