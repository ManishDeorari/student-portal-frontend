// components/Post/ImageGallery.js
import Image from "next/image";

export default function ImageGallery({ images, onImageClick, isRestricted }) {
  if (!images?.length) return null;

  return (
    <div className="mt-2 flex gap-2 overflow-x-auto max-w-full pb-2 custom-scrollbar">
      {images.map((image, index) => (
        <div key={index} className="relative flex-shrink-0 h-48 w-64 rounded-lg border overflow-hidden">
          <Image
            src={image.url}
            alt={`image-${index}`}
            fill
            className={`cursor-pointer object-cover ${isRestricted ? 'select-none' : ''}`}
            onContextMenu={(e) => isRestricted && e.preventDefault()}
            onDragStart={(e) => isRestricted && e.preventDefault()}
            onClick={() => onImageClick(index)}
          />
          {/* Protective Overlay */}
          {isRestricted && (
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={() => onImageClick(index)}
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>
      ))}
    </div>
  );
}
