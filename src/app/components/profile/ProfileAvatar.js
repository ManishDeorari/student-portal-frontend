import { Camera } from "lucide-react";
import { useState } from "react";
import ProfileEditorModal from "./Avatar/ProfileEditorModal";
import ImageViewerModal from "./ImageViewerModal";
import UserAvatar from "../ui/UserAvatar";
import { getOptimizedImageUrl, getFocalImageUrl } from "../../utils/cloudinaryHelper";

export default function ProfileAvatar({ user, image, onUpload, userId, isPublicView }) {
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
        <button
          onClick={() => setShowEditor(true)}
          className="absolute z-30 bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
          style={{ 
            width: '28%', 
            height: '28%', 
            minWidth: '1.1rem', 
            minHeight: '1.1rem', 
            maxWidth: '2.5rem', 
            maxHeight: '2.5rem', 
            bottom: '2%', 
            left: '2%' 
          }}
          title="Edit photo"
        >
          <Camera style={{ width: '60%', height: '60%' }} className="text-gray-700 dark:text-gray-300" />
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

