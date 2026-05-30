// =========================================================================
// PROFILE & GAMIFICATION CONTRACTS
// =========================================================================
export interface ProfilePoints {
  total: number;
  posts: number;
  connections: number;
  comments: number;
  replies: number;
  login: number;
  attendance: number;
}

export interface Profile {
  profile_id: string; // References Supabase auth.users.id
  name: string;
  public_id: string;
  email: string;
  enrollment_number: string | null;
  employee_id: string | null;
  role: 'student' | 'faculty' | 'admin';
  is_admin: boolean;
  approved: boolean;
  is_main_admin: boolean;
  bio: string | null;
  job: string | null;
  course: string | null;
  year: string | null;
  semester: number | null;
  section: string | null;
  position: string | null;
  department: string | null;
  profile_picture: string | null;
  banner_image: string | null;
  phone: string | null;
  address: string | null;
  whatsapp: string | null;
  linkedin: string | null;
  education: Array<any>;
  experience: Array<any>;
  skills: string[];
  work_profile: Record<string, any>;
  job_preferences: Record<string, any>;
  points: ProfilePoints;
  last_year_points: Record<string, any> | null;
  profile_completion_awarded: boolean;
  last_login_point_awarded_at: string | null;
  visit_stats: { totalVisits: number; todayVisits: number };
  visitors: Array<any>;
  last_seen_posts_at: string;
  last_seen_groups_at: string;
  last_seen_network_at: string;
  last_seen_admin_requests_at: string;
  created_at: string;
  updated_at: string;
}

// =========================================================================
// SOCIAL FEED CONTRACTS
// =========================================================================
export interface PostImage {
  url: string;
  public_id: string;
}

export interface Post {
  post_id: string;
  author_id: string;
  content: string;
  images: PostImage[];
  video: PostImage | null;
  reactions: Record<string, string[]>; // Emoji key mapped to User IDs
  type: 'Regular' | 'Session' | 'Event' | 'Announcement';
  points_requested: boolean;
  points_status: 'pending' | 'approved' | 'rejected' | 'none';
  announcement_details: {
    isWinnerAnnouncement: boolean;
    eventName: string;
    winners: Array<any>;
  } | null;
  session_details: {
    schoolOrCollege: string;
    campus: string;
    date: string;
    time: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  comment_id: string;
  post_id: string | null;
  event_id: string | null;
  parent_comment_id: string | null;
  author_id: string;
  text: string;
  reactions: Record<string, string[]>;
  is_pinned: boolean;
  created_at: string;
}

// =========================================================================
// NETWORKING CONTRACTS
// =========================================================================
export interface Connection {
  sender_id: string;
  receiver_id: string;
  status: 'PENDING' | 'ACCEPTED';
  created_at: string;
  updated_at: string;
}

// =========================================================================
// COLLABORATIVE GROUPS CONTRACTS
// =========================================================================
export interface CommunityGroup {
  group_id: string;
  name: string;
  description: string | null;
  profile_image: string;
  profile_image_public_id: string | null;
  admin_id: string | null;
  allow_faculty_messaging: boolean;
  allow_student_messaging: boolean;
  is_all_member_group: boolean;
  profile_image_settings: {
    x: number;
    y: number;
    zoom: number;
    width: number;
    height: number;
  };
  created_at: string;
}

export interface GroupMessage {
  group_message_id: string;
  group_id: string;
  sender_id: string;
  content: string;
  media_url: string | null;
  media_public_id: string | null;
  type: 'text' | 'image';
  reactions: Array<{ emoji: string; users: string[] }>;
  created_at: string;
}

// =========================================================================
// CAMPUS EVENT CONTRACTS
// =========================================================================
export interface Event {
  event_id: string;
  title: string;
  description: string;
  images: PostImage[];
  video: PostImage | null;
  start_date: string;
  start_time: string;
  timezone: string;
  end_date: string;
  registration_close_date: string;
  created_by: string;
  registration_fields: Record<string, boolean> | null;
  custom_questions: Array<{ question: string; type: string }>;
  allow_group_registration: boolean;
  show_registration_insights: boolean;
  reactions: Record<string, string[]>;
  created_at: string;
}

export interface EventRegistration {
  registration_id: string;
  user_id: string;
  event_id: string;
  is_group: boolean;
  group_members: Array<any>;
  answers: Record<string, any>;
  registered_at: string;
}
