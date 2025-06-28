import { WebhookEvent, clerkClient } from "@clerk/nextjs/server"; // clerkClient è una funzione
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";

/**
 * Gestisce i webhook in entrata da Clerk per sincronizzare i dati degli utenti
 * con il database locale utilizzando Prisma.
 */
export async function POST(req: NextRequest) {
	// 1. --- VERIFICA DEL WEBHOOK ---
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
	if (!WEBHOOK_SECRET) {
		throw new Error(
			"La variabile d'ambiente CLERK_WEBHOOK_SECRET non è impostata."
		);
	}

	const headerPayload = headers();
	const svix_id = (await headerPayload).get("svix-id");
	const svix_timestamp = (await headerPayload).get("svix-timestamp");
	const svix_signature = (await headerPayload).get("svix-signature");

	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new NextResponse("Errore: header del webhook mancanti", {
			status: 400,
		});
	}

	const payload = await req.json();
	const body = JSON.stringify(payload);
	const wh = new Webhook(WEBHOOK_SECRET);
	let evt: WebhookEvent;

	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("Errore nella verifica del webhook da Clerk:", err);
		return new NextResponse("Errore: impossibile verificare il webhook", {
			status: 400,
		});
	}

	// 2. --- GESTIONE DEGLI EVENTI ---
	const eventType = evt.type;
	console.log(`Evento webhook ricevuto: ${eventType}`);

	if (eventType === "user.created" || eventType === "user.updated") {
		const { id, email_addresses, image_url, first_name, last_name } = evt.data;

		const primaryEmail = email_addresses[0]?.email_address;
		if (!primaryEmail) {
			return new NextResponse("Errore: email mancante nei dati del webhook", {
				status: 400,
			});
		}
		const userName = `${first_name || ""} ${last_name || ""}`.trim();

		try {
			const dbUser = await db.user.upsert({
				where: { id: id },
				update: { name: userName, email: primaryEmail, picture: image_url },
				create: {
					id: id,
					name: userName,
					email: primaryEmail,
					picture: image_url,
					role: "USER",
				},
			});

			console.log(
				`Utente ${id} ${
					eventType === "user.created" ? "creato" : "aggiornato"
				} nel database.`
			);

			// --- LA CORREZIONE È QUI ---
			// Chiama clerkClient() come una funzione per ottenere l'istanza del client.
			const client = await clerkClient();
			await client.users.updateUserMetadata(id, {
				privateMetadata: {
					role: dbUser.role || "USER",
				},
			});
			// --- FINE DELLA CORREZIONE ---

			console.log(`Metadati di Clerk aggiornati per l'utente: ${id}`);
		} catch (dbError) {
			console.error(
				"Errore durante l'operazione sul database o l'aggiornamento dei metadati:",
				dbError
			);
			return new NextResponse(
				"Errore interno del server durante la scrittura nel database",
				{ status: 500 }
			);
		}
	}

	// 3. --- RISPOSTA DI SUCCESSO ---
	return new NextResponse("Webhook processato con successo", { status: 200 });
}
