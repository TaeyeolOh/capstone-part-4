import type { ReactNode } from "react";
import Spinner from "./Spinner";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  accentColor?: "blue" | "green" | "purple" | "orange";
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  change,
  changeType,
  accentColor = "blue",
  isLoading = false,
}: StatCardProps) => {
  const getAccentColor = () => {
    switch (accentColor) {
      case "green":
        return "from-green-600 to-green-800";
      case "purple":
        return "from-accent3-DEFAULT to-accent3-light";
      case "orange":
        return "from-accent1-DEFAULT to-accent1-light";
      default:
        return "from-accent2-DEFAULT to-accent2-light";
    }
  };

  const getShadowColor = () => {
    switch (accentColor) {
      case "green":
        return "shadow-[0_0_15px_rgba(22,163,74,0.2)]";
      case "purple":
        return "shadow-neon-purple";
      case "orange":
        return "shadow-neon-red";
      default:
        return "shadow-neon";
    }
  };

  return (
    <div className="bg-dark-200 rounded-xl p-5 border border-dark-100 hover-scale transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-light-500 text-sm font-medium">{title}</h3>
        <div
          className={`p-2.5 rounded-lg bg-gradient-to-br ${getAccentColor()} ${getShadowColor()}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <div className="py-2 flex justify-start">
            <Spinner size="sm" />
          </div>
        ) : (
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        )}
        <p
          className={`text-sm mt-2 flex items-center ${
            changeType === "increase"
              ? "text-green-500"
              : changeType === "decrease"
              ? "text-red-500"
              : "text-light-500"
          }`}
        >
          {change}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
