import logoImage from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-12",
    md: "h-16",
    lg: "h-24",
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
