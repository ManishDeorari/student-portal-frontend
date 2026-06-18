// components/Post/ImageGallery.js
import Image from "next/image";
import { getProxiedMediaUrl } from "../../../utils/mediaProxy";

export default function ImageGallery({ images, onImageClick, isRestricted }) {
  if (!images?.length) return null;

  return (
    <div className="mt-2 flex gap-2 overflow-x-auto max-w-full pb-2 custom-scrollbar snap-x snap-mandatory">
      {images.map((image, index) => {
        const proxiedUrl = getProxiedMediaUrl(image.url);
        return (
          <div key={index} className="relative flex-shrink-0 h-48 sm:h-64 w-64 sm:w-80 rounded-lg border overflow-hidden snap-center">
            <Image
              src={proxiedUrl}
              alt={`image-${index}`}
              fill
              unoptimized={proxiedUrl?.includes("/api/files/proxy")}
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
        );
      })}
    </div>
  );
}
