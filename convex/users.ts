import { v } from 'convex/values';
import { internalMutation, query } from "./_generated/server";

// export const getAllUsers = query({
// 	args: {},
// 	handler: async (ctx) => {
// 		return ctx.db.query('users').collect();
// 	}
// });

export const createUser = internalMutation({
	args: {
		clerkId: v.string(),
		email: v.string(),
		first_name: v.optional(v.string()),
		last_name: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		username: v.union(v.string()),
		bio: v.optional(v.string()),
		websiteUrl: v.optional(v.string()),
		followersCount: v.number(),
	},
	handler: async (ctx, args) => {
		const userId = await ctx.db.insert('users', {
			...args,
			username: args.username || `${args.first_name}${args.last_name}`,
		});

		return userId;
	}
});

// Get My Profile from Convex DB with Clerk Id
export const getUserByClerkId = query({
	args: {
		clerkId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.query('users').filter((q) => q.eq(q.field('clerkId'), args.clerkId)).unique();
	}
});

// Get another profile from Convex DB
export const getUserById = query({
	args: {
		userId: v.id('users'),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	}
});