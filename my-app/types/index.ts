export enum VoteType {
    NONE = 0,
    UPVOTE = 1,
    DOWNVOTE = -1,
}

export interface VotedCaption {
    id: number
    vote_value: number
    created_datetime_utc: string
    captions: {
        id: string
        content: string
        like_count: number
        images: {
            id: string
            url: string
        }
    }
}

export interface SavedCaption {
    id: number
    created_datetime_utc: string
    captions: {
        id: string
        content: string
        like_count: number
        images: {
            id: string
            url: string
        }
    }
}

// Define and export Profile interface based on public.profiles table
export interface Profile {
    username: string;
    is_superadmin: boolean;
    // Add other fields as needed for consistency with schema and usage in app
    // e.g., id, first_name, last_name, email, is_in_study, is_matrix_admin
}