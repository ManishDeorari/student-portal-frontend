// components/Post/usePostSocket.js
// Socket.io replaced with Supabase Realtime.
// Live post updates (reactions, comments) are now handled via postgres_changes
// subscriptions in the PostCard component itself. This hook is kept as a no-op
// for backwards compatibility but performs no side effects.

export default function usePostSocket(_postId, _currentUser, _setSomeoneTyping, _setPosts) {
  // No-op: all real-time post sync is handled by Supabase Realtime in PostCard
}
