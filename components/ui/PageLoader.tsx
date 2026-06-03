import { Loader } from "@/components/ui/Loader";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function PageLoader({ size = "lg", className = "" }: Props) {
  return (
    <div
      className={`flex items-center justify-center min-h-[200px] w-full ${className}`}
    >
      <Loader size={size} />
    </div>
  );
}
