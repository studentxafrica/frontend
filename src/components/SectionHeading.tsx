import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Short label that names the section before the headline states it. */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Sits opposite the headline on wide screens, e.g. a "View all" link. */
  action?: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * One heading shape for every section on the landing page, so the page reads
 * as a single document rather than a stack of unrelated blocks.
 */
const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  action,
  tone = "light",
  className,
}) => (
  <div
    className={cn(
      "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
      className
    )}
  >
    <div className="max-w-2xl">
      {eyebrow && (
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-[0.2em]",
            tone === "dark" ? "text-neutral-400" : "text-neutral-500"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-4xl",
          eyebrow && "mt-4",
          tone === "dark" ? "text-white" : "text-neutral-900"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            tone === "dark" ? "text-neutral-400" : "text-neutral-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default SectionHeading;
