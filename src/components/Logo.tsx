import { forwardRef } from "react";
import logoImage from "@/assets/logo.png";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ size = "md", showText = true, className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-16",
      md: "h-24",
      lg: "h-32",
    };

    return (
      <div ref={ref} className={`flex items-center ${className || ""}`} {...props}>
        <img 
          src={logoImage} 
          alt="Bet Analizer Logo" 
          className={`${sizeClasses[size]} w-auto`}
        />
      </div>
    );
  }
);

Logo.displayName = "Logo";
