import logoImage from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-16",
    md: "h-20",
    lg: "h-28",
  };

  return (
    <div className="flex items-center">
      <img 
        src={logoImage} 
        alt="BetAnalyzer Logo" 
        className={`${sizeClasses[size]} w-auto`}
      />
    </div>
  );
}
