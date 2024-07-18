import { Router } from "express";
import { createAccessToken } from "../controller/landyard.controller.js";
const router = Router();
router.route("/create-access-token").post(createAccessToken);
export default router;
