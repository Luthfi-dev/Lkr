import { Post, User, Circle } from '../types';

/**
 * Determines whether a post is visible to the given user session.
 * 
 * Rules:
 * 1. If a post has `isGroupPrivate === true` or `visibility === 'group_only'`:
 *    - Must be authenticated.
 *    - User must have joined the group (`joinedCircleIds.includes(post.circleId)`)
 *      or be in the group's members list, or be the author, or be a superadmin.
 *    - Unauthenticated visitors or non-members CANNOT see it.
 * 
 * 2. If a post is general/public (default wawasan):
 *    - Visible to everyone (authenticated or public visitors).
 */
export function isPostVisibleToUser(
  post: Post,
  isAuthenticated: boolean,
  currentUser?: User | null,
  circles?: Circle[]
): boolean {
  // Check if post is strictly private to a group
  const isPrivateGroupPost = post.isGroupPrivate === true || post.visibility === 'group_only';

  if (!isPrivateGroupPost) {
    return true;
  }

  // If it is private to a group, unauthenticated users can never view it
  if (!isAuthenticated || !currentUser) {
    return false;
  }

  // Superadmin can view
  if (currentUser.systemRole === 'superadmin') {
    return true;
  }

  // Author can always view their own post
  if (post.author && post.author.id === currentUser.id) {
    return true;
  }

  // Check if current user has joined this circle
  if (post.circleId && currentUser.joinedCircleIds && currentUser.joinedCircleIds.includes(post.circleId)) {
    return true;
  }

  // Check if current user is in circle members
  if (post.circleId && circles) {
    const circle = circles.find((c) => c.id === post.circleId);
    if (circle && circle.members.some((m) => m.id === currentUser.id)) {
      return true;
    }
  }

  return false;
}
