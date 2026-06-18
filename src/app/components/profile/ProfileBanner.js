import { Camera } from "lucide-react";
import { useState } from "react";
import BannerEditorModal from "./Banner/BannerEditorModal";
import ImageViewerModal from "./ImageViewerModal";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { getOptimizedImageUrl } from "../../utils/cloudinaryHelper";
import { getProxiedMediaUrl } from "../../utils/mediaProxy";

export default function ProfileBanner({ image, onUpload, userId, isPublicView }) {
  const { darkMode } = useTheme();
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  let isAdmin = false;
  if (typeof window !== 'undefined') {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        isAdmin = u.role === 'admin' || u.isAdmin === true || u.isMainAdmin === true || u.email === "manishdeorari377@gmail.com";
      }
    } catch(e) {}
  }
  const isRestricted = isPublicView && !isAdmin;

  const bannerImg = image || "/default_banner.jpg";
  const finalImageSrc = getProxiedMediaUrl(getOptimizedImageUrl(bannerImg));

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg">
      <div className={`w-full h-full relative ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
        <Image
          src={finalImageSrc}
          alt="Banner"
          fill
          unoptimized={bannerImg === "/default_banner.jpg" || finalImageSrc.includes("/api/files/proxy")}
          className={`object-cover cursor-pointer ${isRestricted ? 'select-none pointer-events-none' : ''}`}
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          onClick={() => setShowViewer(true)}
        />
        {/* Protective Overlay */}
        {isRestricted && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => setShowViewer(true)}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>

      {!isPublicView && (
        <button
          onClick={() => setShowEditor(true)}
          className={`absolute bottom-2 right-2 p-2 rounded-full shadow cursor-pointer z-10 transition-colors ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-[#FAFAFA] text-gray-700 hover:bg-gray-50'}`}
          title="Edit banner"
        >
          <Camera size={20} />
        </button>
      )}

      {showEditor && (
        <BannerEditorModal
          userId={userId}
          currentImage={bannerImg}
          onClose={() => setShowEditor(false)}
          onUploaded={() => {
            setShowEditor(false);
            onUpload();
          }}
        />
      )}

      {showViewer && (
        <ImageViewerModal
          imageUrl={bannerImg}
          onClose={() => setShowViewer(false)}
          isRestricted={isRestricted}
        />
      )}
    </div>
  );
}

