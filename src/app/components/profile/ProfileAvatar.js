import { Camera } from "lucide-react";
import { useState } from "react";
import ProfileEditorModal from "./Avatar/ProfileEditorModal";
import ImageViewerModal from "./ImageViewerModal"; // import here
import Image from "next/image";
import { getOptimizedImageUrl } from "../../utils/cloudinaryHelper";

export default function ProfileAvatar({ image, onUpload, userId, isPublicView }) {
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const profileImg = image || "/default-profile.jpg";

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

  return (
    <div className="relative group">
      <div className="p-[3px] bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 rounded-full shadow-2xl transition-transform duration-300 group-hover:scale-105">
        <Image
          src={getOptimizedImageUrl(profileImg)}
          alt="Profile"
          width={160}
          height={160}
          unoptimized={profileImg === "/default-profile.jpg"}
          onClick={() => setShowViewer(true)} // open full view
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          className={`rounded-full object-cover w-40 h-40 cursor-pointer ${isRestricted ? 'select-none pointer-events-none [-webkit-touch-callout:none]' : ''}`}
        />
        {isRestricted && (
          <div 
            className="absolute inset-0 z-10 cursor-pointer rounded-full [-webkit-touch-callout:none]"
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => setShowViewer(true)}
          />
        )}
      </div>

      {!isPublicView && (
        <button
          onClick={() => setShowEditor(true)}
          className="absolute bottom-1 right-1 bg-[#FAFAFA] p-1 rounded-full shadow cursor-pointer"
          title="Edit photo"
        >
          <Camera size={18} className="text-gray-700" />
        </button>
      )}

      {showEditor && (
        <ProfileEditorModal
          userId={userId}
          currentImage={profileImg}
          onClose={() => setShowEditor(false)}
          onUploaded={() => {
            setShowEditor(false);
            onUpload();
          }}
        />
      )}

      {showViewer && (
        <ImageViewerModal
          imageUrl={profileImg}
          onClose={() => setShowViewer(false)}
          isRestricted={isRestricted}
        />
      )}
    </div>
  );
}

