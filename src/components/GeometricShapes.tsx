import q2Image from "@assets/image_1769371777902.png";

interface GeometricShapeProps {
  type: string;
  className?: string;
}

const imageMap: Record<string, string> = {
  "q2-triangle-obtuse": q2Image,
};

export function GeometricShape({ type, className = "" }: GeometricShapeProps) {
  const imageSrc = imageMap[type];
  
  if (imageSrc) {
    return (
      <div className={`flex justify-center ${className}`}>
        <img 
          src={imageSrc} 
          alt="شكل هندسي" 
          className="max-w-full h-auto object-contain"
          style={{ maxHeight: '150px' }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-accent/50 rounded-lg text-center text-muted-foreground">
      [شكل هندسي]
    </div>
  );
}
