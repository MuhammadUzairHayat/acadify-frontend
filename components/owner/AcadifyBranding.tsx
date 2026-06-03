"use client";

type AcadifyBrandingProps = {
  whiteLabel: boolean;
  className?: string;
};

export function AcadifyBranding({ whiteLabel, className = "" }: AcadifyBrandingProps) {
  if (whiteLabel) return null;

  return (
    <p className={`text-xs text-text-tertiary ${className}`}>
      Powered by{" "}
      <a
        href="https://acadify.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-secondary hover:text-text-primary"
      >
        Acadify
      </a>
    </p>
  );
}
