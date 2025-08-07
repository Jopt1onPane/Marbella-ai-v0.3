import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon, Move } from "lucide-react"
import { cn } from "@/lib/utils"

const DraggableDialog = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Root ref={ref} {...props} />
))
DraggableDialog.displayName = DialogPrimitive.Root.displayName

const DraggableDialogTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Trigger ref={ref} className={cn(className)} {...props} />
))
DraggableDialogTrigger.displayName = DialogPrimitive.Trigger.displayName

const DraggableDialogPortal = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Portal ref={ref} className={cn(className)} {...props} />
))
DraggableDialogPortal.displayName = DialogPrimitive.Portal.displayName

const DraggableDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)'
    }}
    {...props}
  />
))
DraggableDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DraggableDialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    // 初始位置居中
    if (dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      const centerX = (window.innerWidth - rect.width) / 2;
      const centerY = (window.innerHeight - rect.height) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('[data-dialog-close]') || e.target.closest('button')) {
      return;
    }
    
    setIsDragging(true);
    const rect = dialogRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // 限制在窗口范围内
    const maxX = window.innerWidth - (dialogRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (dialogRef.current?.offsetHeight || 0);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <DraggableDialogPortal>
      <DraggableDialogOverlay />
      <DialogPrimitive.Content
        ref={(node) => {
          // 合并refs
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          dialogRef.current = node;
        }}
        className={cn(
          "fixed z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxHeight: '90vh',
          overflowY: 'auto',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        {...props}
      >
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-gray-400 cursor-move" />
            <span className="text-sm text-gray-500">拖拽移动</span>
          </div>
          <DialogPrimitive.Close 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            data-dialog-close
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DraggableDialogPortal>
  );
});
DraggableDialogContent.displayName = DialogPrimitive.Content.displayName

const DraggableDialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DraggableDialogHeader.displayName = "DraggableDialogHeader"

const DraggableDialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DraggableDialogFooter.displayName = "DraggableDialogFooter"

const DraggableDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DraggableDialogTitle.displayName = DialogPrimitive.Title.displayName

const DraggableDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DraggableDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  DraggableDialog,
  DraggableDialogTrigger,
  DraggableDialogContent,
  DraggableDialogHeader,
  DraggableDialogFooter,
  DraggableDialogTitle,
  DraggableDialogDescription,
}
