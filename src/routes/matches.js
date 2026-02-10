import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";

export const matchesRouter = Router();

const MAX_LIMIT = 100;

matchesRouter.get("/", async (req, res) => {

    const parse = listMatchesQuerySchema.safeParse(req.query);

    if (!parse.success) {
        return res.status(400).json({ error: "Invalid query", details: parse.error.issues });
    }

    const limit = Math.min(parse.data.limit ?? 50,  MAX_LIMIT);

    try {
        const data = await db.select().from(matches).orderBy(matches.createdAt).limit(limit);
        return res.status(200).json({ data });
    } catch (error) {
        console.error('Failed to fetch matches:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

matchesRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error:"Invalid payload", details: parsed.error.issues });
    }

    const { startTime, endTime, homeScore, awayScore } = parsed.data;

    try {

        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime : new Date(startTime),
            endTime : new Date(endTime),
            homeScore : homeScore ?? 0,
            awayScore : awayScore ?? 0,
            status : getMatchStatus(startTime, endTime)
        }).returning();

        res.status(201).json({ message: "Match created successfully", data: event });
        
    } catch (e) {
        console.error("Failed to create match:", e);
        const message = e instanceof Error ? e.message : "Internal Server Error";
        return res.status(500).json({ error: "Failed to create match", details: message });
    }
});
