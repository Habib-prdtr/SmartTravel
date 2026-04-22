import { Router } from "express";
import { createTrip, getTrips } from "../controllers/trip.controller.js";

const router = Router();

router.get("/", getTrips);
router.post("/", createTrip);

export default router;
