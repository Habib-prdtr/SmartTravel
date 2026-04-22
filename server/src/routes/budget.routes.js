import { Router } from "express";
import { createExpense, getBudget, getExpenses, upsertBudget } from "../controllers/budget.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/:tripId/budget", getBudget);
router.put("/:tripId/budget", upsertBudget);
router.get("/:tripId/expenses", getExpenses);
router.post("/:tripId/expenses", createExpense);

export default router;
