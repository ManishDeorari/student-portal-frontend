import { Camera } from "lucide-react";
import { useState } from "react";
import ProfileEditorModal from "./Avatar/ProfileEditorModal";
import ImageViewerModal from "./ImageViewerModal";
import UserAvatar from "../ui/UserAvatar";
import { getOptimizedImageUrl, getFocalImageUrl } from "../../utils/cloudinaryHelper";
import { useTheme } from "@/context/ThemeContext";

export default function ProfileAvatar({ user, image, onUpload, userId, isPublicView }) {
  const { darkMode } = useTheme();
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
    <div className="relative group flex justify-center">
      <div className="p-[3px] bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 rounded-full shadow-2xl transition-transform duration-300 group-hover:scale-105 flex items-center justify-center aspect-square w-fit h-fit">
        <UserAvatar
          user={user}
          src={getFocalImageUrl(profileImg, 400, 400, user?.profileImageFocus)}
          alt="Profile"
          width={160}
          height={160}
          wrapperClassName="w-40 h-40"
          unoptimized={profileImg === "/default-profile.jpg"}
          onClick={() => setShowViewer(true)} // open full view
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          className={`rounded-full object-cover w-full h-full cursor-pointer ${isRestricted ? 'select-none pointer-events-none [-webkit-touch-callout:none]' : ''}`}
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
        <div 
          className="absolute z-30 p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center"
          style={{ 
            width: '28%', 
            height: '28%', 
            minWidth: '1.2rem', 
            minHeight: '1.2rem', 
            maxWidth: '2.6rem', 
            maxHeight: '2.6rem', 
            bottom: '2%', 
            right: '2%' 
          }}
        >
          <button
            onClick={() => setShowEditor(true)}
            className={`w-full h-full rounded-[calc(9999px-2px)] flex items-center justify-center cursor-pointer transition-colors ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
            title="Edit photo"
          >
            <Camera style={{ width: '50%', height: '50%' }} className="text-current" />
          </button>
        </div>
      )}

      {showEditor && (
        <ProfileEditorModal
          userId={userId}
          currentImage={profileImg}
          currentFocus={user?.profileImageFocus}
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
          downloadName={user?.name ? `${user.name.replace(/\s+/g, '_')}_Profile_Picture.jpg` : "Profile_Picture.jpg"}
        />
      )}
    </div>
  );
}

