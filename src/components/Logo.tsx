import { forwardRef } from "react";
import logoImage from "@/assets/logo.png";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "header";
  showText?: boolean;
}

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ size = "md", showText = true, className, ...props }, ref) => {
    // Fixed pixel heights for each size
    const sizeStyles: Record<string, React.CSSProperties> = {
      header: {}, // Handled via inline style below for precision
      sm: { height: 64 },
      md: { height: 96 },
      lg: { height: 128 },
    };

    // For header size, we use responsive inline styles
    if (size === "header") {
      return (
        <div ref={ref} className={`flex items-center ${className || ""}`} {...props}>
          <img 
            src={logoImage} 
            alt="Bet Analizer Logo" 
            className="w-auto h-[36px] sm:h-[48px]"
            style={{ maxHeight: "none" }}
          />
        </div>
      );
    }

    return (
      <div ref={ref} className={`flex items-center ${className || ""}`} {...props}>
        <img 
          src={logoImage} 
          alt="Bet Analizer Logo" 
          style={{ ...sizeStyles[size], width: "auto", maxHeight: "none" }}
        />
      </div>
    );
  }
);

Logo.displayName = "Logo";
