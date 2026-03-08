"use client";

import { VoteType } from "@/types";
import { User } from "@supabase/supabase-js";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { voteCaption, saveCaption, unsaveCaption } from "@/lib/captionActions"; // Import new actions

interface Caption {
  id: string;
  content: string;
  like_count: number;
  user_vote?: VoteType;
  is_saved?: boolean; // Added is_saved property
}

interface CaptionCardProps {
  caption: Caption;
  user: User | null;
}

export function CaptionCard({ caption, user }: CaptionCardProps) {
  const router = useRouter();
  const [localUserVote, setLocalUserVote] = useState<VoteType>(caption.user_vote || VoteType.NONE);
  const [localLikeCount, setLocalLikeCount] = useState<number>(caption.like_count);
  const [localIsSaved, setLocalIsSaved] = useState<boolean>(caption.is_saved || false); // New state for saved status

  useEffect(() => {
    setLocalUserVote(caption.user_vote || VoteType.NONE);
    setLocalLikeCount(caption.like_count);
    setLocalIsSaved(caption.is_saved || false);
  }, [caption.user_vote, caption.like_count, caption.is_saved]);

  const handleVote = async (captionId: string, voteType: 'up' | 'down') => {
    if (!user) {
      console.log("User not logged in. Redirecting to auth page.");
      router.push("/auth");
      return;
    }

    const previousUserVote = localUserVote;
    const previousLikeCount = localLikeCount;

    // Optimistic UI update
    let newLikeCount = localLikeCount;
    let newUserVote = VoteType.NONE;
    const voteValue = voteType === 'up' ? 1 : -1;

    if (previousUserVote === VoteType.NONE) {
      newLikeCount += voteValue;
      newUserVote = voteType === 'up' ? VoteType.UPVOTE : VoteType.DOWNVOTE;
    } else if (previousUserVote === VoteType.UPVOTE) {
      if (voteType === 'up') {
        newLikeCount -= 1;
        newUserVote = VoteType.NONE;
      } else {
        newLikeCount -= 2;
        newUserVote = VoteType.DOWNVOTE;
      }
    } else if (previousUserVote === VoteType.DOWNVOTE) {
      if (voteType === 'down') {
        newLikeCount += 1;
        newUserVote = VoteType.NONE;
      } else {
        newLikeCount += 2;
        newUserVote = VoteType.UPVOTE;
      }
    }

    setLocalLikeCount(newLikeCount);
    setLocalUserVote(newUserVote);

    const success = await voteCaption(captionId, voteType); // Use new voteCaption

    if (!success) {
      console.error("Error submitting vote.");
      // Revert UI on error
      setLocalLikeCount(previousLikeCount);
      setLocalUserVote(previousUserVote);
      // Optionally, show an error message to the user
    }
  };

  const handleSaveToggle = async (captionId: string) => {
    if (!user) {
      console.log("User not logged in. Redirecting to auth page.");
      router.push("/auth");
      return;
    }

    const previousIsSaved = localIsSaved;
    setLocalIsSaved(!previousIsSaved); // Optimistic UI update

    let success: boolean;
    if (previousIsSaved) {
      success = await unsaveCaption(captionId);
    } else {
      success = await saveCaption(captionId);
    }

    if (!success) {
      console.error("Error toggling save status.");
      setLocalIsSaved(previousIsSaved); // Revert UI on error
    }
  };

  return (
    <div
      key={caption.id}
      className="flex-none w-64 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow snap-center flex flex-col justify-between"
    >
      <p className="text-gray-800 dark:text-gray-200 text-base mb-2 flex-grow">
        {caption.content}
      </p>
      <div className="mt-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Likes: {localLikeCount}
        </p>
        {user && (
          <div className="flex justify-between items-center space-x-2">
            <div className="flex space-x-1">
              <button
                onClick={() => handleVote(caption.id, 'up')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  localUserVote === VoteType.UPVOTE
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                }`}
              >
                👍
              </button>
              <button
                onClick={() => handleVote(caption.id, 'down')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  localUserVote === VoteType.DOWNVOTE
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                }`}
              >
                👎
              </button>
            </div>
            <button
              onClick={() => handleSaveToggle(caption.id)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                localIsSaved
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
              }`}
            >
              {localIsSaved ? "Saved" : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}