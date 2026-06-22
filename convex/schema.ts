import { defineSchema, defineTable } from "convex/server";
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable(
    v.object({
      email: v.string(),
      clerkId: v.string(),
      imageUrl: v.optional(v.string()),
      first_name: v.optional(v.string()),
      last_name: v.optional(v.string()),
      username: v.union(v.string(), v.null()), 
      bio: v.optional(v.string()),
      location: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      followersCount: v.number(),
      pushToken: v.optional(v.string()),
    })
  ),
	messages: defineTable(
		v.object({
			userId: v.id('users'),
			threadId: v.optional(v.string()),
			content: v.string(),
			likeCount: v.number(),
			commentCount: v.number(),
			retweetCount: v.number(),
			mediaFiles: v.optional(v.array(v.string())),
			websiteUrl: v.optional(v.string()),
		})
	),
});