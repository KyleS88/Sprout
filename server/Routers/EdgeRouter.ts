import express from 'express'
const router = express.Router()
import { pool } from '../pool'
import { Request, Response } from 'express';
import EdgeNoteRouter from './EdgeNoteRouter';

interface Edge {
    id: string,
    source: string, 
    target: {x: number, y: number },
    data: {label: string, note: string, userId: string},
    type: string
}
router.use("/note", EdgeNoteRouter);
// Get all edges in an array of edge objects
router.get("/", async (req: Request, res: Response) => {
    try {
        const sql: string = "SELECT edge_id as id, type, source, target, note, user_id as userId FROM edges;";
        const result = await pool.query(sql);
        return res.status(200).json(result.rows);
    } catch(err: any) {
        console.error("Error fetching edges: ", err);
        return res.status(500).send("Error fetching edges");
    }
});
// Get all edges for a specfic user
router.get("/:userId", async (req: Request, res: Response) => {
    const userId: string = String(req.params.userId);
    try {
        const sql: string = "SELECT edge_id as id, source, target, note, type, user_id as userID FROM edges WHERE user_id=$1;"
        const result = await pool.query(sql, [userId]);
        return res.status(200).json({message: `Succesfully retrieved all edges for user: ${userId}`, edges: result.rows});
    } catch (err: any) {
        console.error("Error fetching edges:", err);
        return res.status(500).send(`An error occurred while fetching edges for user ID: ${userId}`);
    };
});
// Post all edges from an array of edges in request body
router.post("/", async (req: Request, res: Response) => {
    const edgesArray: Edge[] = req.body.edges;
    const client = await pool.connect();
    const createdEdges: Edge[] = [];
    if (!edgesArray.length) return res.status(400).send("No edges can be found");
    try {
        await client.query('BEGIN');
        for (const { source, target, data, id, type } of edgesArray) {
            if (!id || !source || !target || typeof data.label !== "string") throw new Error("Each edge much have an id, label, target, and source");
            const sql: string = "INSERT INTO edges(edge_id, note, source, target, type, user_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;";
            console.log("querying")
            const result = await client.query(sql, [id, data.note, source, target, type, data.userId]);
            console.log("complete")
            createdEdges.push(result.rows[0]);
        }
        await client.query('COMMIT');
        return res.status(201).json({message: `Successfully created edges ${createdEdges.length} edge(s).`, edges: createdEdges});
    } catch (err: any) {
        await client.query('ROLLBACK');
        if (err.message.includes("Each edge much have an")) return res.status(400).send(err.message);
        return res.status(500).send("Failed to create edge(s)");
    } finally {
        client.release();
    };
});
//Update based on an array of edges
router.patch("/", async (req: Request, res: Response) => {
    const edgesArray: Edge[] = req.body.edges;
    const client = await pool.connect();
    const updatedEdges: Edge[] = [];
    if (!edgesArray.length) res.status(400).json({message: "No edges can be found"});
    try {
        await client.query('BEGIN');
        for (const { data, id, source, target, type } of edgesArray) {
            if (!id) throw new Error("Each edge much have an id, label, target, and source");
            const sql: string = "UPDATE edges SET note=$1, source=$2, target=$3, type=$4 WHERE edge_id=$5 RETURNING *;";
            const result = await client.query(sql, [data.note, source, target, type, id]);
            updatedEdges.push(result.rows[0]);
        }
        await client.query('COMMIT');
        res.status(200).json({ message: `Succesfully updated ${updatedEdges.length} edges`, edges: updatedEdges });
    } catch (err: any) {
        await client.query('ROLLBACK');
        if (err.message.includes("Each edge much have an")) return res.status(400).json({message: err.message});
        return res.status(500).json({message: "Failed to update edge(s), ERROR: " + err.message});
    } finally {
        client.release();
    };
});
// delete all edges from database
router.delete("/all", async (req: Request, res: Response) => {
    try {
        const sql: string = "DELETE FROM edges RETURNING *;";
        const result = await pool.query(sql);
        return res.status(200).json({ message: "Successfully deleted all edges from database", edges: result.rows});
    } catch (err: any) {
        return res.status(500).send(err.message);
    };
});
// delete specific edges in database using an array of ids
router.delete("/", async (req: Request, res: Response) => {
    const idArray: string[] = req.body.edges;
    const client = await pool.connect();
    const deletedEdges: Edge[] = [];
    if (!idArray.length) return res.status(400).send("No edges to delete");
    try {
        await client.query('BEGIN');
        for (const id of idArray) {
            const [sId, tId]: string[] = id.split('|');
            const sql: string = "DELETE FROM edges WHERE (source=$1 AND target=$2) OR (source=$2 AND target=$1) RETURNING *;"
            const result = await client.query(sql, [sId, tId]);
            deletedEdges.push(result.rows[0]);
        }
        await client.query('COMMIT');
        res.status(200).json({ message: `Successfully deleted ${deletedEdges.length} edge(s)`, edges: deletedEdges})
    } catch (err: any) {
        await client.query('ROLLBACK');
        return res.status(500).send("Failed to delete all edges");
    };
});

export default router