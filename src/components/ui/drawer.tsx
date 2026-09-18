import { Drawer as VaulDrawer } from "vaul";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

function Drawer(props: ComponentProps<typeof VaulDrawer.Root>) {
  return <VaulDrawer.Root shouldScaleBackground={false} {...props} />;
}

function DrawerOverlay({ className, ...props }: ComponentProps<typeof VaulDrawer.Overlay>) {
  return (
    <VaulDrawer.Overlay
      className={cn("fixed inset-0 z-40 bg-ink/40", className)}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  title,
  ...props
}: ComponentProps<typeof VaulDrawer.Content> & { title: string; children: ReactNode }) {
  return (
    <VaulDrawer.Portal>
      <DrawerOverlay />
      <VaulDrawer.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex drawer-max max-w-lg flex-col rounded-t-2xl bg-paper outline-none",
          "pb-drawer-safe",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-line" />
        <VaulDrawer.Title className="px-5 pt-4 font-display text-lg font-medium tracking-tight text-ink">
          {title}
        </VaulDrawer.Title>
        <VaulDrawer.Description className="sr-only">
          Форма планировщика домашних заданий
        </VaulDrawer.Description>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-2 pt-4">
          {children}
        </div>
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  );
}

export { Drawer, DrawerContent, DrawerOverlay };
