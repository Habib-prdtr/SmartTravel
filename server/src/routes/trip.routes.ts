// @ts-nocheck
import express from "express";
const { Router } = express;
import { createTrip, deleteTrip, getTripById, getTripHistory, getTrips, updateTrip, deleteTripPermanent, deleteAllHistory } from "../controllers/trip.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getTrips);
router.get("/history", getTripHistory);
router.post("/", createTrip);
router.get("/:tripId", getTripById);
router.delete("/history/all", deleteAllHistory);
router.delete("/:tripId", deleteTrip);
router.put("/:tripId", updateTrip);
router.delete("/:tripId/permanent", deleteTripPermanent);
export default router;
