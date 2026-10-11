import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-white text-black border-slate-200 border-2 border-b-4 active:border-b-2 hover:bg-slate-100 text-slate-500",
        primary: "bg-sky-400 text-primary-foreground houver:bg-sky-400/90 border-sky-500 border-b-4 active:border-b-0",
        primaryOutline: "bg-white text-sky-500 hover:bg-slate-100",
        secondary: "bg-green-500 text-primary-foreground houver:bg-sky-500/90 border-sky-600 border-b-4 active:border-b-0",
        secondaryOutline: "bg-white text-green-500 hover:bg-slate-100",
        danger: "bg-rose-500 text-primary-foreground houver:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0",
        dangerOutline: "bg-white text-rose-500 hover:bg-slate-100",
        super: "bg-indigo-500 text-primary-foreground houver:bg-indigo-500/90 border-indigo-600 border-b-4 active:border-b-0",
        superOutline: "bg-white text-indigo-500 hover:bg-slate-100",
        ghost: "bg-transparent text-slate-500 border-transparent border-0 hover::bg-slate-100",
        sidebar: "bg-tranparent text-slave-500 border-2 border-transparent hover:bg-slave-100 transition-none",
        sidebarOutline: "bg-sky-500/15 text-sky-500 border-sky-300 border-2 hover:bg-sky-500/20 transition-none"
      },
      size: {
        default:
          "h-11 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]: has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-12 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-9",
        rouded: "rounded-full",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
