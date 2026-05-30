import { supabase } from './client';
import { Post, Comment, Profile, Connection, CommunityGroup, GroupMessage, Event, EventRegistration } from '../../types';

// =========================================================================
// AUTHENTICATION GATEWAY FUNCTIONS
// =========================================================================

/**
 * Registers a new user via Supabase Auth
 */
export async function signUpUser(
  email: string,
  password: string,
  metadata: Record<string, any>
): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Authenticates user via Supabase Auth. Supports email, enrollment number, and employee ID.
 */
export async function signInUser(
  identifier: string,
  password: string
): Promise<{ data: any; error: any }> {
  try {
    let emailToUse = identifier;
    if (!identifier.includes('@')) {
      const { data, error } = await supabase
        .from('profile')
        .select('email')
        .or(`enrollment_number.eq."${identifier}",employee_id.eq."${identifier}"`)
        .maybeSingle();

      if (error) throw error;
      if (data && data.email) {
        emailToUse = data.email;
      } else {
        throw new Error('User not found with this ID');
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    });

    if (error) throw error;

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('approved, role, is_admin')
        .eq('profile_id', data.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.approved && profile.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Your account has not been approved by admin yet.');
      }

      return {
        data: {
          user: data.user,
          session: data.session,
          role: profile.role,
          approved: profile.approved,
          isAdmin: profile.is_admin,
        },
        error: null,
      };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}


// =========================================================================
// PROFILE GATEWAY FUNCTIONS
// =========================================================================

/**
 * Retrieves current authenticated user's profile info
 */
export async function fetchCurrentUserProfile(): Promise<Profile | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('profile_id', user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (err) {
    console.error('❌ Error in fetchCurrentUserProfile:', err);
    return null;
  }
}

/**
 * Retrieves student/faculty profile by profile_id UUID
 */
export async function fetchProfile(profileId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (err) {
    console.error('❌ Error in fetchProfile:', err);
    return null;
  }
}

/**
 * Retrieves student profile by public_id slug
 */
export async function fetchProfileBySlug(publicId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('public_id', publicId)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (err) {
    console.error('❌ Error in fetchProfileBySlug:', err);
    return null;
  }
}

/**
 * Retrieves all approved profiles for student/faculty directories
 */
export async function fetchApprovedProfiles(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('approved', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Profile[];
  } catch (err) {
    console.error('❌ Error in fetchApprovedProfiles:', err);
    return [];
  }
}

// =========================================================================
// SOCIAL FEED GATEWAY FUNCTIONS
// =========================================================================

/**
 * Creates and submits a post securely using Supabase RPC boundary
 */
export async function submitPost(
  content: string,
  images: Array<{ url: string; public_id: string }>,
  video: { url: string; public_id: string } | null,
  type: string,
  sessionDetails: any = null,
  announcementDetails: any = null
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('submit_student_post', {
      p_content: content,
      p_images: JSON.stringify(images),
      p_video: video ? JSON.stringify(video) : null,
      p_type: type,
      p_session_details: sessionDetails ? JSON.stringify(sessionDetails) : null,
      p_announcement_details: announcementDetails ? JSON.stringify(announcementDetails) : null,
    });

    if (error) throw error;
    return data as string; // Returns new post ID
  } catch (err) {
    console.error('❌ Error in submitPost RPC:', err);
    return null;
  }
}

/**
 * Fetches all posts in chronological order
 */
export async function fetchPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Post[];
  } catch (err) {
    console.error('❌ Error in fetchPosts:', err);
    return [];
  }
}

/**
 * Paged and filtered retrieval of posts or events natively via Supabase
 */
export async function fetchPostsPaged(
  userId: string,
  tab: string,
  pageNum: number,
  limit: number,
  announcementSubtype: string = 'all',
  announcementSearch: string = ''
): Promise<{ posts: any[]; hasMore: boolean }> {
  try {
    const fromIndex = (pageNum - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    if (tab === 'Event') {
      let query = supabase
        .from('event')
        .select(`
          *,
          user:profile(profile_id, name, public_id, role, profile_picture)
        `)
        .order('start_date', { ascending: true })
        .range(fromIndex, toIndex);

      const { data, error } = await query;
      if (error) throw error;

      const formattedEvents = (data || []).map((ev: any) => ({
        ...ev,
        _id: ev.event_id,
        user: ev.user ? {
          _id: ev.user.profile_id,
          name: ev.user.name,
          publicId: ev.user.public_id,
          role: ev.user.role,
          profilePicture: ev.user.profile_picture,
        } : { name: 'Unknown Creator' },
        createdAt: ev.created_at,
        updatedAt: ev.created_at,
      }));

      return { posts: formattedEvents, hasMore: data.length === limit };
    }

    let query = supabase
      .from('post')
      .select(`
        *,
        user:profile(profile_id, name, public_id, role, profile_picture)
      `)
      .order('created_at', { ascending: false })
      .range(fromIndex, toIndex);

    if (tab === 'my') {
      query = query.eq('author_id', userId);
    } else if (tab !== 'all') {
      query = query.eq('type', tab);
    }

    if (tab === 'Announcement') {
      if (announcementSubtype === 'winner') {
        query = query.eq('announcement_details->isWinnerAnnouncement', true);
      }
      if (announcementSearch) {
        query = query.ilike('content', `%${announcementSearch}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const formattedPosts = (data || []).map((po: any) => ({
      ...po,
      _id: po.post_id,
      user: po.user ? {
        _id: po.user.profile_id,
        name: po.user.name,
        publicId: po.user.public_id,
        role: po.user.role,
        profilePicture: po.user.profile_picture,
      } : { name: 'Anonymous' },
      createdAt: po.created_at,
      updatedAt: po.updated_at,
    }));

    return { posts: formattedPosts, hasMore: data.length === limit };
  } catch (err) {
    console.error('❌ Error in fetchPostsPaged:', err);
    return { posts: [], hasMore: false };
  }
}

/**
 * Fetches comment threads (including nested replies) for a post or event
 */
export async function fetchComments(
  postId: string | null,
  eventId: string | null
): Promise<Comment[]> {
  try {
    let query = supabase.from('comment').select('*');

    if (postId) {
      query = query.eq('post_id', postId);
    } else if (eventId) {
      query = query.eq('event_id', eventId);
    } else {
      return [];
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;
    return data as Comment[];
  } catch (err) {
    console.error('❌ Error in fetchComments:', err);
    return [];
  }
}

// =========================================================================
// NETWORKING CONNECTION GATEWAY FUNCTIONS
// =========================================================================

/**
 * Dispatches or updates a connection lifecycle request (SEND, ACCEPT, REJECT, CANCEL)
 */
export async function updateConnectionCycle(
  targetId: string,
  action: 'SEND' | 'ACCEPT' | 'REJECT' | 'CANCEL'
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('handle_connection_cycle', {
      p_target_id: targetId,
      p_action: action,
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('❌ Error in updateConnectionCycle RPC:', err);
    return false;
  }
}

/**
 * Retrieves all active connections or pending requests for a user
 */
export async function fetchUserConnections(userId: string): Promise<Connection[]> {
  try {
    const { data, error } = await supabase
      .from('connection')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) throw error;
    return data as Connection[];
  } catch (err) {
    console.error('❌ Error in fetchUserConnections:', err);
    return [];
  }
}

// =========================================================================
// CAMPUS EVENT GATEWAY FUNCTIONS
// =========================================================================

/**
 * Fetches all upcoming and past events
 */
export async function fetchEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data as Event[];
  } catch (err) {
    console.error('❌ Error in fetchEvents:', err);
    return [];
  }
}

/**
 * Registers a student/user for an event
 */
export async function registerForEvent(
  eventId: string,
  isGroup: boolean,
  groupMembers: any[],
  answers: any
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('register_for_event', {
      p_event_id: eventId,
      p_is_group: isGroup,
      p_group_members: JSON.stringify(groupMembers),
      p_answers: JSON.stringify(answers),
    });

    if (error) throw error;
    return data as string; // Returns new registration ID
  } catch (err) {
    console.error('❌ Error in registerForEvent RPC:', err);
    return null;
  }
}

/**
 * Fetches all registrations for a given event ID
 */
export async function fetchEventRegistrations(eventId: string): Promise<{ totalCount: number; registrations: any[] }> {
  try {
    const { data, error } = await supabase
      .from('event_registration')
      .select('*, profile:user_id(profile_id, name, email, enrollment_number, profile_picture)')
      .eq('event_id', eventId);

    if (error) throw error;

    const formatted = (data || []).map((reg: any) => ({
      _id: reg.registration_id,
      event_id: reg.event_id,
      isGroup: reg.is_group,
      groupMembers: reg.group_members,
      answers: reg.answers,
      registeredAt: reg.registered_at,
      userId: reg.profile ? {
        _id: reg.profile.profile_id,
        name: reg.profile.name,
        email: reg.profile.email,
        enrollmentNumber: reg.profile.enrollment_number,
        profilePicture: reg.profile.profile_picture,
      } : null,
    }));

    return {
      totalCount: formatted.length,
      registrations: formatted,
    };
  } catch (err) {
    console.error('❌ Error in fetchEventRegistrations:', err);
    return { totalCount: 0, registrations: [] };
  }
}

// =========================================================================
// COLLABORATIVE CHAT GROUPS GATEWAY FUNCTIONS
// =========================================================================

/**
 * Fetches collaborative groups that the user has joined
 */
export async function fetchUserGroups(userId: string): Promise<any[]> {
  try {
    const { data: memberGroups, error: memberError } = await supabase
      .from('group_member')
      .select('group_id')
      .eq('profile_id', userId);

    if (memberError) throw memberError;

    const groupIds = memberGroups.map((g) => g.group_id);

    const { data: groups, error: groupsError } = await supabase
      .from('community_group')
      .select('*')
      .or(`group_id.in.(${groupIds.length > 0 ? groupIds.join(',') : '""'}),is_all_member_group.eq.true`);

    if (groupsError) throw groupsError;
    
    // Map IDs to match MongoDB expectations
    return (groups || []).map((g: any) => ({
      ...g,
      _id: g.group_id
    }));
  } catch (err) {
    console.error('❌ Error in fetchUserGroups:', err);
    return [];
  }
}

/**
 * Fetches collaborative group detailed info by ID (including members list)
 */
export async function fetchGroupDetailsById(groupId: string): Promise<any | null> {
  try {
    const { data: group, error: groupError } = await supabase
      .from('community_group')
      .select(`
        *,
        admin:profile(profile_id, name, public_id, role, profile_picture)
      `)
      .eq('group_id', groupId)
      .single();

    if (groupError) throw groupError;

    // Fetch members of this group
    const { data: members, error: membersError } = await supabase
      .from('group_member')
      .select(`
        profile:profile(profile_id, name, public_id, role, profile_picture, approved)
      `)
      .eq('group_id', groupId);

    if (membersError) throw membersError;

    // Format to match MERN schema structure
    const formattedMembers = (members || [])
      .filter((m: any) => m.profile !== null)
      .map((m: any) => ({
        _id: m.profile.profile_id,
        name: m.profile.name,
        publicId: m.profile.public_id,
        role: m.profile.role,
        profilePicture: m.profile.profile_picture,
        approved: m.profile.approved,
      }));

    return {
      ...group,
      _id: group.group_id,
      admin: group.admin ? {
        _id: group.admin.profile_id,
        name: group.admin.name,
      } : null,
      members: formattedMembers,
    };
  } catch (err) {
    console.error('❌ Error in fetchGroupDetailsById:', err);
    return null;
  }
}

/**
 * Retrieves chat history for a group
 */
export async function fetchGroupMessages(groupId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('group_message')
      .select(`
        *,
        sender:profile(profile_id, name, public_id, role, profile_picture)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Map IDs to match MongoDB expectations
    return (data || []).map((m: any) => ({
      ...m,
      _id: m.group_message_id,
      groupId: m.group_id,
      sender: m.sender ? {
        _id: m.sender.profile_id,
        name: m.sender.name,
        role: m.sender.role,
        profilePicture: m.sender.profile_picture,
      } : { name: 'Unknown' },
      createdAt: m.created_at
    }));
  } catch (err) {
    console.error('❌ Error in fetchGroupMessages:', err);
    return [];
  }
}

/**
 * Inserts a new group chat message inside Supabase
 */
export async function sendGroupMessage(
  groupId: string,
  senderId: string,
  content: string,
  mediaUrl?: string,
  mediaPublicId?: string,
  type: 'text' | 'image' = 'text'
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('group_message')
      .insert({
        group_id: groupId,
        sender_id: senderId,
        content: content,
        media_url: mediaUrl || null,
        media_public_id: mediaPublicId || null,
        type: type,
      })
      .select(`
        *,
        sender:profile(profile_id, name, public_id, role, profile_picture)
      `)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      _id: data.group_message_id,
      groupId: data.group_id,
      sender: data.sender ? {
        _id: data.sender.profile_id,
        name: data.sender.name,
        role: data.sender.role,
        profilePicture: data.sender.profile_picture,
      } : { name: 'Unknown' },
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('❌ Error in sendGroupMessage:', err);
    return null;
  }
}

/**
 * Deletes a group chat message
 */
export async function deleteGroupMessage(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('group_message')
      .delete()
      .eq('group_message_id', messageId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('❌ Error in deleteGroupMessage:', err);
    return false;
  }
}

/**
 * Adds or removes a reaction reaction to/from a group chat message
 */
export async function reactToGroupMessage(
  messageId: string,
  userId: string,
  emoji: string
): Promise<any[] | null> {
  try {
    // Fetch message reactions
    const { data, error } = await supabase
      .from('group_message')
      .select('reactions')
      .eq('group_message_id', messageId)
      .single();

    if (error) throw error;

    let reactions: any[] = data.reactions || [];
    const existingEmojiReaction = reactions.find((r: any) => r.emoji === emoji);

    if (existingEmojiReaction) {
      const userIndex = existingEmojiReaction.users.indexOf(userId);
      if (userIndex > -1) {
        // Toggle off reaction (remove user)
        existingEmojiReaction.users.splice(userIndex, 1);
        if (existingEmojiReaction.users.length === 0) {
          reactions = reactions.filter((r: any) => r.emoji !== emoji);
        }
      } else {
        // Toggle on reaction
        existingEmojiReaction.users.push(userId);
      }
    } else {
      // New reaction emoji
      reactions.push({ emoji, users: [userId] });
    }

    const { error: updateError } = await supabase
      .from('group_message')
      .update({ reactions })
      .eq('group_message_id', messageId);

    if (updateError) throw updateError;
    return reactions;
  } catch (err) {
    console.error('❌ Error in reactToGroupMessage:', err);
    return null;
  }
}

/**
 * Creates a new collaborative group
 */
export async function createGroup(groupData: {
  name: string;
  description?: string;
  is_all_member_group?: boolean;
  image_url?: string;
}): Promise<any | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('community_group')
      .insert({
        name: groupData.name,
        description: groupData.description || null,
        is_all_member_group: groupData.is_all_member_group || false,
        image_url: groupData.image_url || null,
        admin_id: user.id,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Also add the creator as a member
    await supabase.from('group_member').insert({ group_id: data.group_id, profile_id: user.id });

    return { ...data, _id: data.group_id };
  } catch (err) {
    console.error('❌ Error in createGroup:', err);
    return null;
  }
}

/**
 * Updates group name, description, or image
 */
export async function updateGroup(
  groupId: string,
  updateData: { name?: string; description?: string; image_url?: string }
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('community_group')
      .update(updateData)
      .eq('group_id', groupId)
      .select('*')
      .single();

    if (error) throw error;
    return { ...data, _id: data.group_id };
  } catch (err) {
    console.error('❌ Error in updateGroup:', err);
    return null;
  }
}

/**
 * Permanently deletes a group and all its messages (cascade via FK)
 */
export async function deleteGroup(groupId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('community_group')
      .delete()
      .eq('group_id', groupId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('❌ Error in deleteGroup:', err);
    return false;
  }
}

/**
 * Removes a member from a group
 */
export async function removeGroupMember(groupId: string, profileId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('group_member')
      .delete()
      .eq('group_id', groupId)
      .eq('profile_id', profileId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('❌ Error in removeGroupMember:', err);
    return false;
  }
}

/**
 * Adds one or more members to a group by profile_id array
 */
export async function addGroupMembers(groupId: string, profileIds: string[]): Promise<boolean> {
  try {
    const rows = profileIds.map((pid) => ({ group_id: groupId, profile_id: pid }));
    const { error } = await supabase.from('group_member').upsert(rows, { onConflict: 'group_id,profile_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('❌ Error in addGroupMembers:', err);
    return false;
  }
}

// =========================================================================
// REAL-TIME NOTIFICATIONS GATEWAY FUNCTIONS
// =========================================================================

/**
 * Fetches active notifications for recipient_id
 */
export async function fetchNotifications(recipientId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notification')
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('❌ Error in fetchNotifications:', err);
    return [];
  }
}

/**
 * Marks all notifications for a user as read
 */
export async function markNotificationsRead(recipientId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification')
      .update({ is_read: true })
      .eq('recipient_id', recipientId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('❌ Error in markNotificationsRead:', err);
    return false;
  }
}

/**
 * Marks a single notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification')
      .update({ is_read: true })
      .eq('notification_id', notificationId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('❌ Error in markNotificationRead:', err);
    return false;
  }
}

/**
 * Fetches the leaderboard sorted by current points total
 */
export async function fetchCurrentLeaderboard(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('approved', true);

    if (error) throw error;
    
    // Sort in JS to ensure clean numeric ordering on jsonb
    const sorted = (data || []).sort((a: any, b: any) => {
      const aTotal = a.points?.total || 0;
      const bTotal = b.points?.total || 0;
      return bTotal - aTotal;
    });

    return sorted;
  } catch (err) {
    console.error('❌ Error in fetchCurrentLeaderboard:', err);
    return [];
  }
}

/**
 * Fetches the historical leaderboard sorted by last year's points total
 */
export async function fetchHistoricalLeaderboard(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('approved', true)
      .not('last_year_points', 'is', null);

    if (error) throw error;

    const sorted = (data || []).sort((a: any, b: any) => {
      const aTotal = a.last_year_points?.total || 0;
      const bTotal = b.last_year_points?.total || 0;
      return bTotal - aTotal;
    });

    return sorted;
  } catch (err) {
    console.error('❌ Error in fetchHistoricalLeaderboard:', err);
    return [];
  }
}

/**
 * Fetches all users eligible for admin point assignments (all approved student profiles)
 */
export async function fetchAwardEligibleUsers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('approved', true)
      .eq('role', 'student')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Profile[];
  } catch (err) {
    console.error('❌ Error in fetchAwardEligibleUsers:', err);
    return [];
  }
}

/**
 * Assigns points to a user profile securely (admin-only function)
 */
export async function assignPointsToUser(
  userId: string,
  category: string,
  amount: number
): Promise<boolean> {
  try {
    // 1. Fetch current profile to get current points
    const { data: profile, error: fetchError } = await supabase
      .from('profile')
      .select('points')
      .eq('profile_id', userId)
      .single();

    if (fetchError || !profile) throw fetchError || new Error('Profile not found');

    const currentPoints = profile.points as any || { total: 0 };
    const newTotal = (currentPoints.total || 0) + amount;
    const categoryTotal = (currentPoints[category] || 0) + amount;

    const newPoints = {
      ...currentPoints,
      total: newTotal,
      [category]: categoryTotal
    };

    // 2. Perform updates
    const { error: updateError } = await supabase
      .from('profile')
      .update({ points: newPoints })
      .eq('profile_id', userId);

    if (updateError) throw updateError;

    // 3. Log the points transaction
    const { error: logError } = await supabase
      .from('points_log')
      .insert({
        profile_id: userId,
        amount: amount,
        category: category,
        description: `Admin assigned points for category: ${category}`
      });

    if (logError) throw logError;

    return true;
  } catch (err) {
    console.error('❌ Error in assignPointsToUser:', err);
    return false;
  }
}


