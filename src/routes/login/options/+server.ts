import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { json } from "@sveltejs/kit";
import { getDB } from "$lib/server/db";
import { saveChallenge } from "$lib/server/webauthn";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
	const options = await generateAuthenticationOptions({
		rpID: event.url.hostname,
		userVerification: "required",
	});
	await saveChallenge(getDB(event), event.cookies, options.challenge, { type: "login" });
	return json(options);
};
