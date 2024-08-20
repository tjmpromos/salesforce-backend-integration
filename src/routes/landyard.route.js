import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { createAccessToken } from "../controller/landyard.controller.js";
const router = Router();
router
  .route("/create-opportunity")
  .post(upload.single("image"), createAccessToken);

export default router;
