import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middlewares/auth.js";
import { allocationsRouter } from "./allocations.js";
import { authRouter } from "./auth.js";
import { complaintsRouter } from "./complaints.js";
import { dashboardRouter } from "./dashboard.js";
import { feesRouter } from "./fees.js";
import { hostelsRouter } from "./hostels.js";
import { reportsRouter } from "./reports.js";
import { roomsRouter } from "./rooms.js";
import { studentsRouter } from "./students.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/students", authenticateToken, requireAdmin, studentsRouter);
apiRouter.use("/hostels", authenticateToken, requireAdmin, hostelsRouter);
apiRouter.use("/rooms", authenticateToken, requireAdmin, roomsRouter);
apiRouter.use("/allocations", authenticateToken, requireAdmin, allocationsRouter);
apiRouter.use("/complaints", authenticateToken, requireAdmin, complaintsRouter);
apiRouter.use("/fees", authenticateToken, requireAdmin, feesRouter);
apiRouter.use("/reports", authenticateToken, requireAdmin, reportsRouter);
