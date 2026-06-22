import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

export const handleClerkWebhook = httpAction(async (ctx, request) => {
	const { data, type } = await request.json();

	// console.log('type', type);
	// console.log('data', data);

	switch (type) {
		case 'user.created':
			await ctx.runMutation(internal.users.createUser, {
				clerkId: data.id,
				email: data.email_addresses[0]?.email_address || "",
				first_name: data.first_name || undefined,
				last_name: data.last_name || undefined,
				imageUrl: data.image_url || undefined,
				username: data.username || "",
				followersCount: 0,
			});
			break;
		case 'user.updated':
			console.log('User Updated');
			break;
	}

	// implementation will be here
	return new Response(null, { status: 200 });
});

http.route({
	path: "/clerk-users-webhook",
	method: "POST",
	handler: handleClerkWebhook,
});

// https://energized-perch-641.convex.cloud
// https://energized-perch-641.convex.site/clerk-users-webhook
export default http;