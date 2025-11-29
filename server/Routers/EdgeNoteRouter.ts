import express from 'express'
import { pool } from '../pool'
const router = express.Router()
import { Request, Response } from 'express';

router.get("/", async(req: Request, res: Response) => {
    try {
        const sql: string = "SELECT edge_id, note FROM connector.edges;"
        const result = await pool.query(sql);
        return res.status(200).json(result.rows);
    } catch (err: any){
        return res.status(500).json(err.message);
    };
});

router.patch("/:edgeId", async (req: Request, res: Response) => {
    try {
        const edgeId: string = String(req.params.edgeId);
        const [sId, tId] = edgeId.split('|');
        if (!sId || !tId) return res.status(400).send('Bad edge pair');
        const sql: string = "UPDATE connector.edges SET note=$1 WHERE (source=$2 AND target=$3) OR (source=$3 AND target=$2);"
        const result = await pool.query(sql, [req.body.note, sId, tId]);
        return res.status(200).send(`Succesfully updated the edge with id: ${edgeId}`);
    } catch (err: any) {
        return res.status(500).json(err.message);
    }
})

export default router;