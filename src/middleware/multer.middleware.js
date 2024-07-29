import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    const unique = Date.now();
    cb(null, file.originalname.split(" ").join("_") + unique);
  },
});

export const upload = multer({ storage });
