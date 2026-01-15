import logoImage from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-16",
  };

  return (
    <div className="flex items-center gap-2">
      <img 
        src={logoImage} 
        alt="BetAnalyzer Logo" 
        className={`${sizeClasses[size]} w-auto`}
      />
    </div>
  );
}
