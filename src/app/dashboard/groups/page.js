"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import GroupSidebar from "../../components/groups/GroupSidebar";
import GroupChatWindow from "../../components/groups/GroupChatWindow";
import GroupDetailsPanel from "../../components/groups/GroupDetailsPanel";
import { useTheme } from "@/context/ThemeContext";
import { GooeyGradientBackground } from "../../components/GooeyGradientBackground";
import CreateGroupModal from "../../components/groups/modals/CreateGroupModal";
import EditGroupModal from "../../components/groups/modals/EditGroupModal";
import InviteMembersModal from "../../components/groups/modals/InviteMembersModal";
import GroupDetailsModal from "../../components/groups/modals/GroupDetailsModal";
import GroupMembersModal from "../../components/groups/modals/GroupMembersModal";
import GroupMediaModal from "../../components/groups/modals/GroupMediaModal";
import ImageViewerModal from "../../components/groups/modals/ImageViewerModal";
import { toast } from "react-hot-toast";

export default function GroupsPage() {
    const { darkMode } = useTheme();
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [viewerImageUrl, setViewerImageUrl] = useState(null);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const selectedGroupRef = useRef(selectedGroup);
    const realtimeChannelRef = useRef(null);

    useEffect(() => {
        selectedGroupRef.current = selectedGroup;
    }, [selectedGroup]);

    // 1. Fetch current user and groups on load via Supabase
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { fetchCurrentUserProfile, fetchUserGroups } = await import("@/services/database/gateway");

                // Load from cache first for instant UI
                let user = JSON.parse(localStorage.getItem("user") || "null");
                const role = localStorage.getItem("role");

                if (!user) {
                    const profile = await fetchCurrentUserProfile();
                    if (profile) {
                        user = { ...profile, _id: profile.profile_id, enrollmentNumber: profile.enrollment_number };
                        localStorage.setItem("user", JSON.stringify(user));
                    }
                }

                setCurrentUser(user);
                setIsAdmin(user?.is_admin || user?.isAdmin || user?.role === "admin" || role === "admin");

                const userId = user?.profile_id || user?._id || localStorage.getItem("userId") || "";
                const data = await fetchUserGroups(userId);
                setGroups(data);
                setFilteredGroups(data);
            } catch (err) {
                console.error("Error fetching initial data:", err);
            }
        };

        fetchData();
    }, []);

    // 2. Fetch full group details when a group is selected
    const fetchGroupDetails = useCallback(async (groupId) => {
        try {
            const { fetchGroupDetailsById } = await import("@/services/database/gateway");
            const data = await fetchGroupDetailsById(groupId);
            if (data) {
                setSelectedGroup(data);
                const user = JSON.parse(localStorage.getItem("user") || "null");
                const isGroupAdmin = data.admin?._id === (user?._id || user?.profile_id) || user?.role === "admin" || user?.isAdmin || user?.is_admin;
                setIsAdmin(isGroupAdmin);
            }
        } catch (err) {
            console.error("Error fetching group details:", err);
        }
    }, []);

    // 3. Load messages + subscribe to Supabase Realtime when group changes
    useEffect(() => {
        if (!selectedGroup?._id) return;

        const loadMessages = async () => {
            try {
                const { fetchGroupMessages } = await import("@/services/database/gateway");
                const data = await fetchGroupMessages(selectedGroup._id);
                setMessages(data);
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        loadMessages();

        const setupRealtime = async () => {
            const { supabase } = await import("@/services/database/client");

            if (realtimeChannelRef.current) {
                await supabase.removeChannel(realtimeChannelRef.current);
            }

            const channel = supabase
                .channel(`group-messages-${selectedGroup._id}`)
                .on(
                    "postgres_changes",
                    { event: "INSERT", schema: "public", table: "group_message", filter: `group_id=eq.${selectedGroup._id}` },
                    async (payload) => {
                        const { data: msgData, error } = await supabase
                            .from("group_message")
                            .select(`*, sender:profile(profile_id, name, public_id, role, profile_picture)`)
                            .eq("group_message_id", payload.new.group_message_id)
                            .single();

                        if (error || !msgData) return;
                        const formatted = {
                            ...msgData,
                            _id: msgData.group_message_id,
                            groupId: msgData.group_id,
                            sender: msgData.sender
                                ? { _id: msgData.sender.profile_id, name: msgData.sender.name, role: msgData.sender.role, profilePicture: msgData.sender.profile_picture }
                                : { name: "Unknown" },
                            createdAt: msgData.created_at,
                        };
                        setMessages((prev) => {
                            if (prev.find((m) => m._id === formatted._id)) return prev;
                            return [...prev, formatted];
                        });
                    }
                )
                .on(
                    "postgres_changes",
                    { event: "UPDATE", schema: "public", table: "group_message", filter: `group_id=eq.${selectedGroup._id}` },
                    (payload) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m._id === payload.new.group_message_id
                                    ? { ...m, reactions: payload.new.reactions }
                                    : m
                            )
                        );
                    }
                )
                .on(
                    "postgres_changes",
                    { event: "DELETE", schema: "public", table: "group_message", filter: `group_id=eq.${selectedGroup._id}` },
                    (payload) => {
                        setMessages((prev) => prev.filter((m) => m._id !== payload.old.group_message_id));
                    }
                )
                .subscribe();

            realtimeChannelRef.current = channel;
        };

        setupRealtime();

        return () => {
            const cleanup = async () => {
                if (realtimeChannelRef.current) {
                    const { supabase } = await import("@/services/database/client");
                    await supabase.removeChannel(realtimeChannelRef.current);
                    realtimeChannelRef.current = null;
                }
            };
            cleanup();
        };
    }, [selectedGroup?._id]);

    // 4. Action Handlers — all routed through Supabase gateway
    const handleSendMessage = async (text, mediaData = {}) => {
        if (!selectedGroup) return;
        try {
            const { sendGroupMessage } = await import("@/services/database/gateway");
            const user = JSON.parse(localStorage.getItem("user") || "null");
            const senderId = user?.profile_id || user?._id || "";
            await sendGroupMessage(
                selectedGroup._id,
                senderId,
                text,
                mediaData.mediaUrl,
                mediaData.mediaPublicId,
                mediaData.type || "text"
            );
            // Realtime INSERT event will update state automatically
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error("Error sending message");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            const { removeGroupMember } = await import("@/services/database/gateway");
            const ok = await removeGroupMember(selectedGroup._id, memberId);
            if (ok) {
                toast.success("Member removed");
                fetchGroupDetails(selectedGroup._id);
            } else {
                toast.error("Failed to remove member");
            }
        } catch (err) {
            console.error("Error removing member:", err);
        }
    };

    const handleConnect = async (userId) => {
        try {
            const { updateConnectionCycle } = await import("@/services/database/gateway");
            const ok = await updateConnectionCycle(userId, "SEND");
            if (ok) {
                toast.success("Connection request sent!");
            } else {
                toast.error("Failed to send connection request");
            }
        } catch (err) {
            console.error("Error connecting:", err);
            toast.error("Connection failed");
        }
    };

    const handleDeleteMedia = async (messageId) => {
        if (!window.confirm("Are you sure you want to delete this media?")) return;
        try {
            const { deleteGroupMessage } = await import("@/services/database/gateway");
            const ok = await deleteGroupMessage(messageId);
            if (ok) {
                toast.success("Media deleted");
                // Realtime DELETE event will update state automatically
            } else {
                toast.error("Failed to delete media");
            }
        } catch (err) {
            console.error("Error deleting media:", err);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("CRITICAL: This will permanently delete the group and all its messages. Are you absolutely sure?")) return;
        try {
            const { deleteGroup } = await import("@/services/database/gateway");
            const ok = await deleteGroup(groupId);
            if (ok) {
                toast.success("Group deleted successfully");
                setGroups(prev => prev.filter(g => g._id !== groupId));
                setFilteredGroups(prev => prev.filter(g => g._id !== groupId));
                setSelectedGroup(null);
                setShowEditModal(false);
            } else {
                toast.error("Failed to delete group");
            }
        } catch (err) {
            console.error("Error deleting group:", err);
            toast.error("Error deleting group");
        }
    };

    const handleCreateGroup = async (groupData) => {
        try {
            const { createGroup } = await import("@/services/database/gateway");
            const newGroup = await createGroup(groupData);
            if (newGroup) {
                setGroups(prev => [newGroup, ...prev]);
                setFilteredGroups(prev => [newGroup, ...prev]);
                setShowCreateModal(false);
                toast.success("Group created successfully!");
            } else {
                toast.error("Failed to create group");
            }
        } catch (err) {
            console.error("Error creating group:", err);
            toast.error("Failed to create group");
        }
    };

    const handleUpdateGroup = async (groupId, updateData) => {
        try {
            const { updateGroup } = await import("@/services/database/gateway");
            const updatedGroup = await updateGroup(groupId, updateData);
            if (updatedGroup) {
                setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
                setFilteredGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
                setSelectedGroup(updatedGroup);
                setShowEditModal(false);
                toast.success("Group updated!");
            } else {
                toast.error("Failed to update group");
            }
        } catch (err) {
            console.error("Error updating group:", err);
            toast.error("Failed to update group");
        }
    };

    const SidebarComponent = isAdmin ? AdminSidebar : Sidebar;

    // Mobile: show chat if group selected, otherwise show group list
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const handleMobileSelectGroup = (g) => {
        fetchGroupDetails(g._id);
        setShowDetailsModal(false);
        setMobileShowChat(true);
    };

    const handleMobileBack = () => {
        setMobileShowChat(false);
    };

    return (
        <GooeyGradientBackground className="min-h-screen text-white overflow-hidden" darkMode={darkMode}>
            <SidebarComponent />

            <main className="p-2 sm:p-3 max-w-6xl mx-auto h-[calc(100dvh-64px)] flex flex-col justify-center pb-20 md:pb-4">
                <div className="relative p-[2px] sm:p-[2.5px] rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                    <div className={`relative flex flex-col md:flex-row gap-0 md:gap-4 px-3 py-4 sm:px-6 sm:py-6 rounded-[calc(1rem-2px)] sm:rounded-[calc(2.5rem-2.5px)] transition-colors duration-300 h-full ${darkMode ? "bg-black/90" : "bg-white/90"}`}>
                        
                        {/* Group Sidebar — hidden on mobile when chat is active */}
                        <div className={`${mobileShowChat ? 'hidden' : 'flex'} md:flex w-full md:w-[30%] flex-shrink-0 h-full`}>
                            <GroupSidebar
                                groups={filteredGroups}
                                selectedGroup={selectedGroup}
                                onSelectGroup={(g) => {
                                    // Desktop: normal select; Mobile: switch panel
                                    if (window.innerWidth < 768) {
                                        handleMobileSelectGroup(g);
                                    } else {
                                        fetchGroupDetails(g._id);
                                        setShowDetailsModal(false);
                                    }
                                }}
                                onSearch={(term) => {
                                    const filtered = groups.filter(g => g.name.toLowerCase().includes(term.toLowerCase()));
                                    setFilteredGroups(filtered);
                                }}
                                isAdmin={isAdmin}
                                onCreateGroup={() => setShowCreateModal(true)}
                                onViewImage={(url) => { setViewerImageUrl(url); setShowImageViewer(true); }}
                            />
                        </div>

                        {/* Modern Vertical Separator — desktop only */}
                        <div className="hidden md:block w-[1.5px] h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />

                        {/* Chat Window — hidden on mobile when group list is active */}
                        <div className={`${mobileShowChat ? 'flex' : 'hidden'} md:flex w-full md:w-[68%] flex-shrink-0 h-full flex-col`}>
                            <GroupChatWindow
                                selectedGroup={selectedGroup}
                                messages={messages}
                                currentUser={currentUser}
                                onSendMessage={handleSendMessage}
                                isAdmin={isAdmin}
                                onEditGroup={() => setShowEditModal(true)}
                                onInviteMembers={() => setShowInviteModal(true)}
                                onToggleDetails={() => setShowDetailsModal(true)}
                                onViewImage={(url) => { setViewerImageUrl(url); setShowImageViewer(true); }}
                                onDeleteMessage={handleDeleteMedia}
                                onReact={async (msgId, emoji) => {
                                    try {
                                        const { reactToGroupMessage } = await import("@/services/database/gateway");
                                        const user = JSON.parse(localStorage.getItem("user") || "null");
                                        const userId = user?.profile_id || user?._id || "";
                                        await reactToGroupMessage(msgId, userId, emoji);
                                        // Realtime UPDATE event will sync reactions
                                    } catch (err) {
                                        console.error("Error reacting:", err);
                                    }
                                }}
                                onBack={handleMobileBack}
                                showBackButton={mobileShowChat}
                            />
                        </div>

                        <GroupDetailsModal
                            isOpen={showDetailsModal}
                            onClose={() => setShowDetailsModal(false)}
                            group={selectedGroup}
                            memberCount={selectedGroup?.members?.length || 0}
                            mediaCount={messages.filter(m => m.type === "image").length}
                            onOpenMembers={() => { setShowDetailsModal(false); setShowMembersModal(true); }}
                            onOpenMedia={() => { setShowDetailsModal(false); setShowMediaModal(true); }}
                            onViewImage={(url) => { setViewerImageUrl(url); setShowImageViewer(true); }}
                        />
                    </div>
                </div>
            </main>

            {/* Modals */}
            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateGroup}
            />

            {showEditModal && (
                <EditGroupModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdateGroup}
                    group={selectedGroup}
                    onRemoveMember={handleRemoveMember}
                    onDeleteGroup={handleDeleteGroup}
                    currentUser={currentUser}
                />
            )}

            {showInviteModal && (
                <InviteMembersModal
                    isOpen={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    onInvite={async (groupId, data) => {
                        try {
                            const { addGroupMembers } = await import("@/services/database/gateway");
                            const memberIds = Array.isArray(data.memberIds) ? data.memberIds : (data.members || []);
                            const ok = await addGroupMembers(groupId, memberIds);
                            if (ok) {
                                toast.success("Members added");
                                setShowInviteModal(false);
                                fetchGroupDetails(groupId);
                            } else {
                                toast.error("Failed to add members");
                            }
                        } catch (err) {
                            console.error("Error inviting members:", err);
                        }
                    }}
                    groupId={selectedGroup?._id}
                    existingMemberIds={selectedGroup?.members?.map(m => m._id || m) || []}
                />
            )}

            <GroupMembersModal
                isOpen={showMembersModal}
                onClose={() => setShowMembersModal(false)}
                members={selectedGroup?.members || []}
                currentUser={currentUser}
                onConnect={handleConnect}
            />

            <GroupMediaModal
                isOpen={showMediaModal}
                onClose={() => setShowMediaModal(false)}
                mediaList={messages.filter(m => m.type === "image")}
                isAdmin={isAdmin}
                onDelete={handleDeleteMedia}
                onViewImage={(url) => { setViewerImageUrl(url); setShowImageViewer(true); }}
            />

            <ImageViewerModal 
                isOpen={showImageViewer}
                onClose={() => setShowImageViewer(false)}
                imageUrl={viewerImageUrl}
            />
        </GooeyGradientBackground>
    );
}
