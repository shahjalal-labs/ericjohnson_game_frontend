import React from "react";

type ButtonVariant = "primary" | "secondary" | "game";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyle =
    "relative flex items-center justify-center gap-2 px-6 py-3  rounded-xl font-semibold transition-all duration-150 active:translate-y-1";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_5px_0_#1e40af] active:shadow-inner",

    secondary:
      "bg-gray-200 hover:bg-gray-300 text-black shadow-[0_5px_0_#9ca3af] active:shadow-inner",

    game: "text-white shadow-[0_6px_0_#7a0c12] active:shadow-inner",
  };

  const gameStyle: React.CSSProperties =
    variant === "game"
      ? {
          background: "linear-gradient(180deg, #DC2626 0%, #991B1B 100%)",
        }
      : {};

  return (
    <button
      className={` cursor-pointer ${baseStyle} ${variants[variant]} ${className}`}
      style={gameStyle}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
