import { v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { internalMutation, mutation, query, QueryCtx } from "./_generated/server";

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
			username: args.username || `${args.first_name}${args.last_name}`
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
		const user = await ctx.db.query('users').filter((q) => q.eq(q.field('clerkId'), args.clerkId)).unique();
		return getUserWithImageUrl(ctx, user);
	}
});

// Get another profile from Convex DB
export const getUserById = query({
	args: {
		userId: v.id('users'),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		return getUserWithImageUrl(ctx, user);
	}
});

export const updateUser = mutation({
	args: {
		_id: v.id('users'),
		bio: v.optional(v.string()),
		websiteUrl: v.optional(v.string()),
		imageUrl: v.optional(v.id('_storage')),
		pushToken: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await getCurrentUserOrThrow(ctx);
		return await ctx.db.patch(args._id, args);
	}
});

export const generateUploadUrl = mutation({
	handler: async (ctx) => {
		await getCurrentUserOrThrow(ctx);

		return await ctx.storage.generateUploadUrl();
	}
});

// REUSABLE FUNCTIONS

const getUserWithImageUrl = async (ctx: QueryCtx, user: Doc<'users'> | null) => {
	if (!user?.imageUrl || user?.imageUrl.startsWith('http')) {
		return user;
	}

	const imageUrl = await ctx.storage.getUrl(user.imageUrl as Id<'_storage'>);
	return { ...user, imageUrl };
}


// IDENTITY CHECK
// export const current = query({
//   args: {},
//   handler: async (ctx) => {
//     return await getCurrentUser(ctx);
//   },
// });

// export const upsertFromClerk = internalMutation({
//   args: { data: v.any() as Validator<UserJSON> }, 
//   async handler(ctx, { data }) {
//     const userAttributes = {
//       name: `${data.first_name} ${data.last_name}`,
//       externalId: data.id,
//     };

//     const user = await userByExternalId(ctx, data.id);
//     if (user === null) {
//       await ctx.db.insert("users", userAttributes);
//     } else {
//       await ctx.db.patch(user._id, userAttributes);
//     }
//   },
// });

export const deleteFromClerk = internalMutation({
	args: { clerkUserId: v.string() },
	async handler(ctx, { clerkUserId }) {
		const user = await userByExternalId(ctx, clerkUserId);

		if (user !== null) {
			await ctx.db.delete(user._id);
		} else {
			console.warn(
				`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
			);
		}
	},
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
	const userRecord = await getCurrentUser(ctx);
	if (!userRecord) throw new Error("Can't get current user");
	return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (identity === null) {
		return null;
	}
	return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
	return await ctx.db
		.query("users")
		.withIndex("byClerkId", (q) => q.eq("clerkId", externalId))
		.unique();
}