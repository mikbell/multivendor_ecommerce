import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";

/**
 * Gestisce i webhook in entrata da Clerk per sincronizzare i dati degli utenti
 * (creazione, aggiornamento, eliminazione) con il database locale utilizzando Prisma.
 */
export async function POST(req: NextRequest) {
	// 1. --- VERIFICA DEL WEBHOOK ---
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
	if (!WEBHOOK_SECRET) {
		console.error(
			"ERRORE CRITICO: La variabile d'ambiente CLERK_WEBHOOK_SECRET non è impostata."
		);
		return new NextResponse("Errore di configurazione interna", {
			status: 500,
		});
	}

	const headerPayload = headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

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

	// GESTIONE DELLA CREAZIONE/AGGIORNAMENTO
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
				`[DB SYNC] Utente ${id} ${
					eventType === "user.created" ? "creato" : "aggiornato"
				}.`
			);

			// Sincronizza i metadati di Clerk
			const client = await clerkClient();
			await client.users.updateUserMetadata(id, {
				privateMetadata: { role: dbUser.role || "USER" },
			});
			console.log(`[CLERK METADATA] Metadati aggiornati per l'utente: ${id}.`);
		} catch (error) {
			console.error("[UPSERT FALLITO]", error);
			return new NextResponse("Errore durante la scrittura sul database", {
				status: 500,
			});
		}
	}

	// GESTIONE DELL'ELIMINAZIONE (NUOVO BLOCCO)
	if (eventType === "user.deleted") {
		const { id } = evt.data;

		// Se l'ID non è presente, non possiamo fare nulla.
		if (!id) {
			return new NextResponse(
				"Errore: ID mancante nei dati del webhook per l'eliminazione",
				{ status: 400 }
			);
		}

		try {
			// Elimina l'utente dal database.
			// Aggiungiamo un controllo per l'utente `deleted` per evitare errori se non esiste più.
			const deletedUser = await db.user.delete({
				where: { id: id },
			});
			console.log(`[DB SYNC] Utente ${deletedUser.id} eliminato con successo.`);
		} catch (error: any) {
			// Se l'utente non viene trovato (magari è già stato eliminato), non è un errore critico.
			if (error?.code === "P2025") {
				// Codice errore Prisma per "Record to delete does not exist."
				console.warn(
					`[DB SYNC] Tentativo di eliminare l'utente ${id} che non esisteva nel database.`
				);
			} else {
				console.error("[DELETE FALLITO]", error);
				return new NextResponse("Errore durante l'eliminazione dal database", {
					status: 500,
				});
			}
		}
	}

	// 3. --- RISPOSTA DI SUCCESSO ---
	return new NextResponse("Webhook processato con successo", { status: 200 });
}
