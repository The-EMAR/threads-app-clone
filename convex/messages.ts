import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const addThreadMessage = mutation({
  args: {
    content: v.string(),
    mediaFiles: v.optional(v.array(v.string())),
    websiteUrl: v.optional(v.string()),
    threadId: v.optional(v.id('messages')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const message = await ctx.db.insert('messages', {
      ...args,
      userId: user._id,
      likeCount: 0,
      commentCount: 0,
      retweetCount: 0,
    });

    if (args.threadId) {
      const originalThread = await ctx.db.get(args.threadId);
      await ctx.db.patch(args.threadId, {
        commentCount: (originalThread?.commentCount || 0) + 1,
      })
    }

    return message;
  }
});

export const getThreads = query({
  args: { paginationOpts: paginationOptsValidator, userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    let threads;

    if (args.userId) {
      threads = await ctx.db
        .query('messages')
        .filter((q) => q.eq(q.field('userId'), args.userId))
        .order('desc')
        .paginate(args.paginationOpts);
    } else {
      threads = await ctx.db
        .query('messages')
        .filter((q) => q.eq(q.field('threadId'), undefined))
        .order('desc')
        .paginate(args.paginationOpts);
    }

    const messagesWithCreator = await Promise.all(
      threads.page.map(async (thread) => {
        const creator = await getMessageCreator(ctx, thread.userId);
        const mediaUrls = await getMeidaUrls(ctx, thread.mediaFiles);

        return {
          ...thread,
          creator,
          mediaFiles: mediaUrls
        }
      })
    );

    return {
      ...threads,
      page: messagesWithCreator,
    }
  }
});

const getMessageCreator = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.get(userId);

  if (!user?.imageUrl || user.imageUrl.startsWith('https')) {
    return user;
  }

  const imageUrl = await ctx.storage.getUrl(user.imageUrl as Id<'_storage'>);

  return {
    ...user,
    imageUrl
  }
};

const getMeidaUrls = async (ctx: QueryCtx, mediaFiles: string[] | undefined) => {
  if (!mediaFiles || mediaFiles.length === 0) {
    return [];
  }

  return await Promise.all(mediaFiles.map(async (file) => {
    let url: any = file;
    if (!file.startsWith('https')) {
      url = await ctx.storage.getUrl(file as Id<'_storage'>);
    }

    return url;
  }))
}

export const likeThread = mutation({
  args: {
    threadId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);

    const message = await ctx.db.get(args.threadId);

    await ctx.db.patch(args.threadId, {
      likeCount: (message?.likeCount || 0) + 1,
    });
  }
});

export const getThreadById = query({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.messageId);

    if (!thread) return null;

    const creator = await getMessageCreator(ctx, thread.userId);
    const mediaUrls = await getMeidaUrls(ctx, thread.mediaFiles);

    return {
      ...thread,
      creator,
      mediaFiles: mediaUrls,
    }
  }
});

export const getThreadByComments = query({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('threadId'), args.messageId))
      .order('desc')
      .collect();

    const messagesWithCreator = await Promise.all(
      comments.map(async(comment)=>{
        const creator = await getMessageCreator(ctx,comment.userId);
        const mediaUrls = await getMeidaUrls(ctx, comment.mediaFiles);

        return {
          ...comment,
          creator,
          mediaFiles: mediaUrls,
        }
      })
    )

    return messagesWithCreator;
  }
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    await getCurrentUserOrThrow(ctx);

    return await ctx.storage.generateUploadUrl();
  }
});