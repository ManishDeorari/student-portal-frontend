"use client";

import React, { useState } from "react";
import SectionCard from "./SectionCard";
import EditJobInfoModal from "./modals/EditJobInfoModal";

export default function ProfileJobInfo({ profile, setProfile }) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedUser) => {
        setProfile((prev) => ({
            ...prev,
            workProfile: updatedUser.workProfile,
            jobPreferences: updatedUser.jobPreferences,
            skills: updatedUser.skills,
        }));
    };

    return (
        <>
            <SectionCard
                title="Current Work Profile"
                hasData={!!profile.workProfile}
                onEdit={() => setIsEditing(true)}
            >
                <p>
                    <strong>Functional Area:</strong>{" "}
                    {profile.workProfile?.functionalArea || "N/A"}
                </p>
                <p>
                    <strong>Sub-functional Area:</strong>{" "}
                    {profile.workProfile?.subFunctionalArea || "None"}
                </p>
                <p>
                    <strong>Experience:</strong> {profile.workProfile?.experience || "N/A"}
                </p>
                <p>
                    <strong>Industry:</strong> {profile.workProfile?.industry || "N/A"}
                </p>
                <p>
                    <strong>Skills:</strong>{" "}
                    {(profile.skills || []).join(", ") || "No skills listed"}
                </p>
            </SectionCard>

            <SectionCard
                title="Job Preferences"
                hasData={!!profile.jobPreferences}
                onEdit={() => setIsEditing(true)}
            >
                <p>
                    <strong>Preferred Functional Area:</strong>{" "}
                    {profile.jobPreferences?.functionalArea || "N/A"}
                </p>
                <p>
                    <strong>Preferred Locations:</strong>{" "}
                    {(profile.jobPreferences?.preferredLocations || []).join(", ") ||
                        "N/A"}
                </p>
                <p>
                    <strong>Notice Period:</strong>{" "}
                    {profile.jobPreferences?.noticePeriod || "N/A"}
                </p>
                <p>
                    <strong>Salary:</strong> {profile.jobPreferences?.salary || "N/A"}
                </p>
                <p>
                    <strong>Resume:</strong>{" "}
                    {profile.jobPreferences?.resumeLink ? (
                        <a
                            href={profile.jobPreferences.resumeLink}
                            className="text-blue-600 underline"
                            target="_blank"
                        >
                            View Resume
                        </a>
                    ) : (
                        "No resume uploaded."
                    )}
                </p>
            </SectionCard>

            <EditJobInfoModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                currentProfile={profile}
                onSave={handleSave}
            />
        </>
    );
}
