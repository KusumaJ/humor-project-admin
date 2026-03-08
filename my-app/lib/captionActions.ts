// lib/captionActions.ts
import { createClient } from "@/utils/supabase/client";

// Function to get the current user's profile ID
async function getCurrentUserProfileId(): Promise<string> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated.");
  }
  return user.id;
}

export async function saveCaption(captionId: string): Promise<boolean> {
  try {
    const profileId = await getCurrentUserProfileId();
    const supabase = createClient();

    const { error } = await supabase
      .from('caption_saved')
      .upsert({ profile_id: profileId, caption_id: captionId }, { onConflict: 'profile_id, caption_id' }); // Use onConflict for upsert behavior

    if (error) {
      throw new Error(error.message);
    }
    return true;
  } catch (error: any) {
    console.error("Error saving caption:", error.message);
    return false;
  }
}

export async function unsaveCaption(captionId: string): Promise<boolean> {
  try {
    const profileId = await getCurrentUserProfileId();
    const supabase = createClient();

    const { error } = await supabase
      .from('caption_saved')
      .delete()
      .eq('profile_id', profileId)
      .eq('caption_id', captionId);

    if (error) {
      throw new Error(error.message);
    }
    return true;
  } catch (error: any) {
    console.error("Error unsaving caption:", error.message);
    return false;
  }
}

export async function voteCaption(captionId: string, voteType: 'up' | 'down'): Promise<boolean> {
  try {
    const profileId = await getCurrentUserProfileId();
    const supabase = createClient();
    const voteValue = voteType === 'up' ? 1 : -1;

    // Check if the user has already voted on this caption
    const { data: existingVote, error: fetchError } = await supabase
      .from('caption_votes')
      .select('id, vote_value')
      .eq('profile_id', profileId)
      .eq('caption_id', captionId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "No rows found"
      throw new Error(fetchError.message);
    }

    if (existingVote) {
      // If an existing vote matches the new vote, it's an "unvote"
      if (existingVote.vote_value === voteValue) {
        // Delete the vote
        const { error: deleteError } = await supabase
          .from('caption_votes')
          .delete()
          .eq('id', existingVote.id);
        if (deleteError) throw new Error(deleteError.message);
        // Decrement like_count
        await supabase.rpc('increment_like_count', { caption_id: captionId, amount: -voteValue });
        return true;
      } else {
        // If an existing vote is different, update the vote
        const { error: updateError } = await supabase
          .from('caption_votes')
          .update({ vote_value: voteValue })
          .eq('id', existingVote.id);
        if (updateError) throw new Error(updateError.message);
        // Adjust like_count: remove old vote, add new vote
        await supabase.rpc('increment_like_count', { caption_id: captionId, amount: -existingVote.vote_value });
        await supabase.rpc('increment_like_count', { caption_id: captionId, amount: voteValue });
        return true;
      }
    } else {
      // No existing vote, insert a new one
      const { error: insertError } = await supabase
        .from('caption_votes')
        .insert({ profile_id: profileId, caption_id: captionId, vote_value: voteValue });
      if (insertError) throw new Error(insertError.message);
      // Increment like_count
      await supabase.rpc('increment_like_count', { caption_id: captionId, amount: voteValue });
      return true;
    }
  } catch (error: any) {
    console.error(`Error ${voteType}voting caption:`, error.message);
    return false;
  }
}
