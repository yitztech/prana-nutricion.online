import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ as: Comp = "div", variant = "default", className, ...props }) {
  return (
    <Comp
      data-slot="card"
      data-variant={variant}
      className={cn(
        variant === "service"
          ? "flex flex-col gap-3 text-card-foreground"
          : "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ as: Comp = "div", className, ...props }) {
  return (
    <Comp
      data-slot="card-title"
      className={cn(
        "font-serif text-2xl leading-normal transition-colors group-hover:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ as: Comp = "div", className, ...props }) {
  return (
    <Comp
      data-slot="card-description"
      className={cn("font-light text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
