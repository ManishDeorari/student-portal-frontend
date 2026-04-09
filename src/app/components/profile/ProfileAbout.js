"use client";

import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditAboutModal from "./modals/EditAboutModal";

export default function ProfileAbout({ profile, setProfile, isPublicView }) {
  const [isEditing, setIsEditing] = useState(false);

  // When modal saves, update the parent state
  const handleSave = (updatedUser) => {
    setProfile((prev) => ({
      ...prev,
      bio: updatedUser.bio,
    }));
  };

  return (
    <>
      <SectionCard
        title="About"
        hasData={!!profile.bio}
        onEdit={() => setIsEditing(true)}
        isPublicView={isPublicView}
      >
        <p>{profile.bio || "No bio available."}</p>
      </SectionCard>

      <EditAboutModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        currentBio={profile.bio}
        onSave={handleSave}
      />
    </>
  );
}
