import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import patientsRouter from "./patients";
import payersRouter from "./payers";
import chargesRouter from "./charges";
import claimsRouter from "./claims";
import denialsRouter from "./denials";
import paymentsRouter from "./payments";
import billingRouter from "./billing";
import arRouter from "./ar";
import reportingRouter from "./reporting";
import codingRouter from "./coding";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(patientsRouter);
router.use(payersRouter);
router.use(chargesRouter);
router.use(claimsRouter);
router.use(denialsRouter);
router.use(paymentsRouter);
router.use(billingRouter);
router.use(arRouter);
router.use(reportingRouter);
router.use(codingRouter);
router.use(usersRouter);

export default router;
