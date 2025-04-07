import React from "react";
import { Dialog, DialogContent, DialogOverlay } from "./dialog";
import { cn } from "@/lib/utils";

export const Modal = React.forwardRef(
  ({ children, isOpen, onClose, className, ...props }, ref) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay />
        <DialogContent 
          ref={ref} 
          className={cn("p-0 border-0 bg-transparent shadow-none", className)}
          {...props}
        >
          {children}
        </DialogContent>
      </Dialog>
    );
  }
);

Modal.displayName = "Modal"; 