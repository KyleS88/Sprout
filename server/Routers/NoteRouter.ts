import express from 'express'
import { pool } from '../pool'
const router = express.Router()
import { Request, Response } from 'express';
// Getting an array of notes from every node
router.get("/", async (req: Request, res: Response) => {
    try {
        const sql: string = "SELECT uuid, note FROM nodes;";
        const result = await pool.query(sql);
        return res.status(200).json(result.rows);
    } catch (err: any) {
        return res.status(500).json(err.message);
    };
});
// Getting note for a specifc node
router.get("/:nodeid", async (req: Request, res: Response) => {
    try {
        const nodeid: string = String(req.params.nodeid);
        const sql: string = "SELECT uuid, note FROM connector.nodes WHERE uuid=$1;";
        const result = await pool.query(sql, [nodeid]);
        return res.status(200).json(result.rows[0]);
    } catch (err: any) {
        return res.status(500).send(err.message);
    };
});

// Updating a specfic note for a node
router.patch("/:nodeId", async (req: Request, res: Response) => {
    try {
        const nodeId: string = String(req.params.nodeId);
        const sql: string = "UPDATE connector.nodes SET note=$1 WHERE uuid=$2;";
        const result = await pool.query(sql, [req.body.note, nodeId]);
        return res.status(200).send(`Successfully updated the note for node: ${nodeId}`);
    } catch (err: any) {
        return res.status(500).send(err.message);
    };
});

export default router