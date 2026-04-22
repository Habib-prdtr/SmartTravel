import { Router } from "express";
import { createItineraryDay, getItineraryDays } from "../controllers/itinerary.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/:tripId/itinerary-days", getItineraryDays);
router.post("/:tripId/itinerary-days", createItineraryDay);

export default router;
