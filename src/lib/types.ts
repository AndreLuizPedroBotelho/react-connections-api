export interface Curiosity {
  id: number;
  emoji: string;
  title: string;
  content: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  likes_count: number;
  is_liked: boolean;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
  };
  created_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  interests: string[];
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}

export interface SocialFeedItem {
  curiosity: Curiosity;
  liked_by: {
    id: number;
    username: string;
  };
}
