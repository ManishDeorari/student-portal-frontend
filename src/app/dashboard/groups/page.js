"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import GroupSidebar from "../../components/groups/GroupSidebar";
import GroupChatWindow from "../../components/groups/GroupChatWindow";
import GroupDetailsPanel from "../../components/groups/GroupDetailsPanel";
import socket from "@/utils/socket";
import { useTheme } from "@/context/ThemeContext";
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

    useEffect(() => {
        selectedGroupRef.current = selectedGroup;
    }, [selectedGroup]);

    // 1. Fetch current user and groups on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const role = localStorage.getItem("role");

                let user = JSON.parse(localStorage.getItem("user"));

                if (!user && token) {
                    const userRes = await fetch(`${API_URL}/api/user/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (userRes.ok) {
                        user = await userRes.json();
                        localStorage.setItem("user", JSON.stringify(user));
                    }
                }

                setCurrentUser(user);
                setIsAdmin(user?.isAdmin || user?.role === "admin" || role === "admin");

                const res = await fetch(`${API_URL}/api/groups`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setGroups(data);
                    setFilteredGroups(data);
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
            }
        };

        fetchData();
    }, [API_URL]);

    // 2. Fetch full group details and messages when a group is selected
    const fetchGroupDetails = useCallback(async (groupId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedGroup(data);
                
                // Update local isAdmin based on selected group
                const user = JSON.parse(localStorage.getItem("user"));
                const isGroupAdmin = data.admin?._id === user?._id || user?.role === 'admin' || user?.isAdmin;
                setIsAdmin(isGroupAdmin);
            }
        } catch (err) {
            console.error("Error fetching group details:", err);
        }
    }, [API_URL]);

    useEffect(() => {
        if (!selectedGroup?._id) return;

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/api/groups/${selectedGroup._id}/messages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchMessages();

        socket.emit("joinGroup", selectedGroup._id);

        return () => {
            socket.emit("leaveGroup", selectedGroup._id);
        };
    }, [selectedGroup?._id, API_URL]);

    // 3. Socket.io listeners
    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            const currentSelected = selectedGroupRef.current;
            if (currentSelected && String(msg.groupId) === String(currentSelected._id)) {
                setMessages((prev) => {
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        const handleReactionUpdate = ({ messageId, reactions }) => {
            setMessages((prev) => prev.map(m =>
                m._id === messageId ? { ...m, reactions } : m
            ));
        };

        const handleMessageDeleted = (messageId) => {
            setMessages(prev => prev.filter(m => m._id !== messageId));
        };

        socket.on("receiveGroupMessage", handleReceiveMessage);
        socket.on("messageReactionUpdate", handleReactionUpdate);
        socket.on("messageDeleted", handleMessageDeleted);

        return () => {
            socket.off("receiveGroupMessage", handleReceiveMessage);
            socket.off("messageReactionUpdate", handleReactionUpdate);
            socket.off("messageDeleted", handleMessageDeleted);
        };
    }, []);

    // 4. Group Handlers
    const handleSendMessage = async (text, mediaData = {}) => {
        if (!selectedGroup) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    groupId: selectedGroup._id,
                    content: text,
                    ...mediaData
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.message || "Failed to send message");
            }
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error("Error sending message");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            const token = localStorage.getItem("token");
            // Assuming endpoint for removal is DELETE /api/groups/:groupId/members/:memberId
            const res = await fetch(`${API_URL}/api/groups/${selectedGroup._id}/members/${memberId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Member removed");
                fetchGroupDetails(selectedGroup._id); // Refresh details
            } else {
                toast.error("Failed to remove member");
            }
        } catch (err) {
            console.error("Error removing member:", err);
        }
    };

    const handleConnect = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/connect/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ recipientId: userId })
            });
            if (res.ok) {
                toast.success("Connection request sent!");
                fetchGroupDetails(selectedGroup._id);
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to send request");
            }
        } catch (err) {
            console.error("Error connecting:", err);
            toast.error("Connection failed");
        }
    };

    const handleDeleteMedia = async (messageId) => {
        if (!window.confirm("Are you sure you want to delete this media? It will be removed from Cloudinary as well.")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups/${selectedGroup._id}/messages/${messageId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Media deleted");
                setMessages(prev => prev.filter(m => m._id !== messageId));
                socket.emit("deleteMessage", { groupId: selectedGroup._id, messageId });
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete media");
            }
        } catch (err) {
            console.error("Error deleting media:", err);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("CRITICAL: This will permanently delete the group and all its messages. Are you absolutely sure?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups/${groupId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success("Group deleted successfully");
                setGroups(prev => prev.filter(g => g._id !== groupId));
                setFilteredGroups(prev => prev.filter(g => g._id !== groupId));
                setSelectedGroup(null);
                setShowEditModal(false);
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete group");
            }
        } catch (err) {
            console.error("Error deleting group:", err);
            toast.error("Error deleting group");
        }
    };

    const handleCreateGroup = async (groupData) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(groupData),
            });

            if (res.ok) {
                const newGroup = await res.json();
                setGroups(prev => [newGroup, ...prev]);
                setFilteredGroups(prev => [newGroup, ...prev]);
                setShowCreateModal(false);
                toast.success("Group created successfully!");
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to create group");
            }
        } catch (err) {
            console.error("Error creating group:", err);
            toast.error("Failed to create group");
        }
    };

    const handleUpdateGroup = async (groupId, updateData) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/groups/${groupId}/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (res.ok) {
                const updatedGroup = await res.json();
                setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
                setFilteredGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
                setSelectedGroup(updatedGroup);
                setShowEditModal(false);
                toast.success("Group updated!");
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to update group");
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
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-700 relative text-white overflow-hidden">
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
                                onReact={(msgId, emoji) => {
                                    const token = localStorage.getItem("token");
                                    fetch(`${API_URL}/api/groups/${selectedGroup._id}/react`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                        body: JSON.stringify({ messageId: msgId, emoji }),
                                    });
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
                        const token = localStorage.getItem("token");
                        const res = await fetch(`${API_URL}/api/groups/${groupId}/invite`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify(data),
                        });
                        if (res.ok) {
                            toast.success("Members added");
                            setShowInviteModal(false);
                            fetchGroupDetails(groupId);
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
        </div>
    );
}
