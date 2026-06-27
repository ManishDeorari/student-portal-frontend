import { Camera } from "lucide-react";
import { useState } from "react";
import BannerEditorModal from "./Banner/BannerEditorModal";
import ImageViewerModal from "./ImageViewerModal";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { getOptimizedImageUrl, getFocalImageUrl } from "../../utils/cloudinaryHelper";

export default function ProfileBanner({ image, focus, onUpload, userId, isPublicView, user }) {
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
  const finalImageSrc = getFocalImageUrl(bannerImg, 1200, 400, focus) || getOptimizedImageUrl(bannerImg);

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-lg">
      <div className={`w-full h-full relative ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
        <Image
          src={finalImageSrc}
          alt="Banner"
          fill
          unoptimized={bannerImg === "/default_banner.jpg"}
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
        <div className="absolute bottom-2 right-2 p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg z-10">
          <button
            onClick={() => setShowEditor(true)}
            className={`p-2 rounded-[calc(9999px-2px)] cursor-pointer transition-colors ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
            title="Edit banner"
          >
            <Camera size={20} />
          </button>
        </div>
      )}

      {showEditor && (
        <BannerEditorModal
          userId={userId}
          currentImage={bannerImg}
          currentFocus={focus}
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
          downloadName={user?.name ? `${user.name.replace(/\s+/g, '_')}_Banner.jpg` : "Profile_Banner.jpg"}
        />
      )}
    </div>
  );
}

