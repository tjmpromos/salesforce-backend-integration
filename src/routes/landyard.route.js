import { Router } from "express";
import { createAccessToken } from "../controller/landyard.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router();
router
  .route("/create-access-token")
  .post(upload.single("image"), createAccessToken);
export default router;
