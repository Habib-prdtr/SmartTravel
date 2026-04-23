import { Router } from "express";
import {
  createItineraryDay,
  createItineraryItem,
  getItineraryDays,
  getItineraryItems,
  updateItineraryDay
} from "../controllers/itinerary.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/:tripId/itinerary-days", getItineraryDays);
router.post("/:tripId/itinerary-days", createItineraryDay);
router.patch("/:tripId/itinerary-days/:dayId", updateItineraryDay);
router.get("/:tripId/itinerary-days/:dayId/items", getItineraryItems);
router.post("/:tripId/itinerary-days/:dayId/items", createItineraryItem);

export default router;
