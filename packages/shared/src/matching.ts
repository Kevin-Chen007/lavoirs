export type Interest = string;

export interface Profile {
  id: string;
  name: string;
  interests: Interest[];
  avatarUrl?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  interests: Interest[];
}

export interface MatchmakingResult {
  groupId: string;
  members: GroupMember[];
}
