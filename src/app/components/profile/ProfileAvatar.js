import { Camera } from "lucide-react";
import { useState } from "react";
import ProfileEditorModal from "./Avatar/ProfileEditorModal";
import ImageViewerModal from "./ImageViewerModal"; // import here
import Image from "next/image";

export default function ProfileAvatar({ image, onUpload, userId, isPublicView }) {
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const profileImg = image || "/default-profile.jpg";

  const currentUserRole = typeof window !== 'undefined' ? localStorage.getItem("role") : null;
  const isRestricted = isPublicView && currentUserRole !== 'admin';

  return (
    <div className="relative group">
      <div className="p-[3px] bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 rounded-full shadow-2xl transition-transform duration-300 group-hover:scale-105">
        <Image
          src={profileImg}
          alt="Profile"
          width={160}
          height={160}
          priority={true}
          onClick={() => setShowViewer(true)} // open full view
          onContextMenu={(e) => isRestricted && e.preventDefault()}
          onDragStart={(e) => isRestricted && e.preventDefault()}
          className={`rounded-full object-cover w-40 h-40 cursor-pointer ${isRestricted ? 'select-none' : ''}`}
        />
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
