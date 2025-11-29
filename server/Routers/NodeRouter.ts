import express from 'express'
const router = express.Router()
import NoteRouter from './NoteRouter'
import { pool } from '../pool'
import { Request, Response } from 'express';
interface Node {
    id: string,
    type: string, 
    position: {x: number, y: number },
    data: {label: string, note: string, userId: string},
    style: {height: number, width: number},
}
router.use("/note", NoteRouter);
// Get all nodes in an array of node objects
router.get("/", async (req: Request, res: Response) => {
    try {
        const sql: string = "SELECT * FROM connector.nodes;";
        const result = await pool.query(sql);
        return res.status(200).json(result.rows);
    } catch(err: any) {
        console.error("Error fetching nodes: ", err);
        return res.status(500).send("Error fetching nodes");
    }
});
// Get all nodes for userID
router.get("/:userId", async (req: Request, res: Response) => {
    const userId: string = String(req.params.userId);
    try {
        const sql: string = "SELECT * FROM connector.nodes WHERE user_id=$1;"
        const result = await pool.query(sql, [userId]);
        return res.status(200).json({message: `Succesfully retrieved nodes for user: ${userId}`, nodes: result.rows});
    } catch (err: any) {
        console.error("Error fetching nodes:", err);
        return res.status(500).send(`An error occurred while fetching nodes for user ID: ${userId}`);
    };
});
// Post all nodes from an array of nodes in request body
router.post("/", async (req: Request, res: Response) => {
    const nodesArray: Node[] = req.body.nodes;
    const client = await pool.connect();
    const createdNodes: Node[] = [];
    if (!nodesArray.length) return res.status(400).send("No nodes can be found");
    try {
        await client.query('BEGIN');
        for (const { type, position, data, style, id } of nodesArray) {
            if (!id || !type || !position || typeof data.label !== "string" || !style) throw new Error("Each node much have an id, type, position object, label, and style object");
            const sql: string = "INSERT INTO connector.nodes(uuid, type, position_x, position_y, label, note, style_height, style_width, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;";
            console.log("querying")
            const result = await client.query(sql, [id, type, position.x, position.y, data.label, data.note, style.height, style.width, data.userId]);
            console.log("complete")
            createdNodes.push(result.rows[0]);
        }
        await client.query('COMMIT');
        return res.status(201).json({message: `Successfully created nodes ${createdNodes.length} node(s).`, nodes: createdNodes});
    } catch (err: any) {
        await client.query('ROLLBACK');
        if (err.message.includes("Each node much have an")) return res.status(400).send(err.message);
        return res.status(500).send("Failed to create node(s)");
    } finally {
        client.release();
    };
});
//Update based on an array of nodes
router.patch("/", async (req: Request, res: Response) => {
    const nodesArray: Node[] = req.body.nodes;
    const client = await pool.connect();
    const updatedNodes: Node[] = [];
    if (!nodesArray.length) res.status(400).json({message: "No nodes can be found"});
    try {
        await client.query('BEGIN');
        for (const { type, position, data, style, id } of nodesArray) {
            if (!id) throw new Error("Each node much have an id, type, position object, label, and style object");
            const sql: string = "UPDATE connector.nodes SET type=$1, position_x=$2, position_y=$3, label=$4, note=$5, style_height=$6, style_width=$7 WHERE uuid=$8 RETURNING *;";
            const result = await client.query(sql, [type, position.x, position.y, data.label, data.note, style.height, style.width, id]);
            updatedNodes.push(result.rows[0]);
        }
        await client.query('COMMIT');
        res.status(200).json({ message: `Succesfully updated ${updatedNodes.length} nodes`, nodes: updatedNodes });
    } catch (err: any) {
        await client.query('ROLLBACK');
        if (err.message.includes("Each node much have an")) return res.status(400).json({message: err.message});
        return res.status(500).json({message: "Failed to update node(s), ERROR: " + err.message});
    } finally {
        client.release();
    };
});
// delete all nodes from database
router.delete("/all", async (req: Request, res: Response) => {
    try {
        const sqlEdge: string = "TRUNCATE TABLE connector.edges;";
        const sqlNode: string = "TRUNCATE TABLE connector.nodes;"
        await pool.query(sqlEdge);
        await pool.query(sqlNode);
        return res.status(200).json({ message: "Successfully deleted all nodes from database"});
    } catch (err: any) {
        return res.status(500).send(err.message);
    };
});
// delete specific nodes in database using an array of ids
router.delete("/", async (req: Request, res: Response) => {
    const idArray: string[] = req.body.nodes;
    const client = await pool.connect();
    const deletedNodes: Node[] = [];
    if (!idArray.length) return res.status(400).send("No nodes to delete");
    try {
        await client.query('BEGIN');
        for (const id of idArray) {
            const sqlEdge: string = "DELETE FROM connector.edges WHERE source=$1 OR target=$1;"
            const sqlNode: string = "DELETE FROM connector.nodes WHERE uuid=$1 RETURNING *;"
            await client.query(sqlEdge, [id]);
            const resultNode = await client.query(sqlNode, [id]);
            deletedNodes.push(resultNode.rows[0]);
        }
        await client.query('COMMIT');
        res.status(200).json({ message: `Successfully deleted ${deletedNodes.length} node(s)`, nodes: deletedNodes})
    } catch (err: any) {
        await client.query('ROLLBACK');
        return res.status(500).send("Failed to delete all nodes");
    };
});

export default router
