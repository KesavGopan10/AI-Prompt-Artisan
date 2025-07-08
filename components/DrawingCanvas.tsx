import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface DrawingCanvasProps {
  onDrawEnd: (isEmpty: boolean) => void;
}

export interface DrawingCanvasRef {
  getImageData: () => string;
  clearCanvas: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ onDrawEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.lineCap = 'round';
    context.strokeStyle = '#f9fafb'; // text-primary
    context.lineWidth = 3;
    contextRef.current = context;

    // Handle resize
    const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if(parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            // Redraw or clear context properties after resize
            if(contextRef.current) {
                contextRef.current.lineCap = 'round';
                contextRef.current.strokeStyle = '#f9fafb';
                contextRef.current.lineWidth = 3;
            }
        }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // initial size

    return () => window.removeEventListener('resize', resizeCanvas);

  }, []);

  const getEventCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in event) {
        return {
            offsetX: event.touches[0].clientX - rect.left,
            offsetY: event.touches[0].clientY - rect.top
        };
    }
    return { offsetX: event.nativeEvent.offsetX, offsetY: event.nativeEvent.offsetY };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const { offsetX, offsetY } = getEventCoordinates(event);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    if (!hasDrawn) setHasDrawn(true);
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
    onDrawEnd(!hasDrawn);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { offsetX, offsetY } = getEventCoordinates(event);
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      onDrawEnd(true);
    }
  };

  useImperativeHandle(ref, () => ({
    getImageData: () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) return "";
        // Create a temporary canvas with a white background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if(!tempCtx) return "";
        tempCtx.fillStyle = '#111827'; // bg-base-100
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);

        return tempCanvas.toDataURL('image/jpeg').split(',')[1];
    },
    clearCanvas: clearCanvas,
  }));

  return (
    <div className="w-full h-full bg-base-200/50 rounded-lg border-2 border-dashed border-base-300/50 relative">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        className="touch-none"
      />
      {!hasDrawn && (
        <div className="absolute inset-0 flex items-center justify-center text-text-secondary pointer-events-none">
          <p>Draw something here...</p>
        </div>
      )}
    </div>
  );
});

export default DrawingCanvas;