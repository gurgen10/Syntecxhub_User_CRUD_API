import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  uploadUserProfilePicture,
  getUserProfilePicture,
  deleteUserProfilePicture,
} from "../controllers/user.controller.js";
import { validateBody, validateParams } from "../middleware/validateRequest.js";
import { uploadProfilePicture } from "../middleware/profilePictureUpload.js";
import {
  createUserBodySchema,
  updateUserBodySchema,
  userIdParamSchema,
} from "../validators/user.schemas.js";

const router = express.Router();

router.get("/", getUsers);

router.get("/:id", validateParams(userIdParamSchema), getUserById);

router.post("/", validateBody(createUserBodySchema), createUser);

router.put(
  "/:id",
  validateParams(userIdParamSchema),
  validateBody(updateUserBodySchema),
  updateUser,
);

router.put(
  "/:id/profile-picture",
  validateParams(userIdParamSchema),
  uploadProfilePicture,
  uploadUserProfilePicture,
);

router.get(
  "/:id/profile-picture",
  validateParams(userIdParamSchema),
  getUserProfilePicture,
);

router.delete(
  "/:id/profile-picture",
  validateParams(userIdParamSchema),
  deleteUserProfilePicture,
);

router.delete("/:id", validateParams(userIdParamSchema), deleteUser);

export { router as userRoutes };
