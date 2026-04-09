"use client";
import React from "react";
import MemberSearchModal from "./MemberSearchModal";

export default function InviteMembersModal({ isOpen, onClose, onInvite, groupId, existingMemberIds = [] }) {
    if (!isOpen) return null;

    const handleSelect = (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            onInvite(groupId, data);
        } else {
            onInvite(groupId, { userIds: data });
        }
    };

    return (
        <MemberSearchModal
            isOpen={isOpen}
            onClose={onClose}
            onSelect={handleSelect}
            title="Invite New Members"
            multiSelect={true}
            excludeIds={existingMemberIds}
        />
    );
}
