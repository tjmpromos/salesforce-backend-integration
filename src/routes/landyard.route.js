import { Router } from "express";
import { createAccessToken } from "../controller/landyard.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
router
  .route("/create-opportunity")
  .post(upload.single("image"), createAccessToken);

export default router;
