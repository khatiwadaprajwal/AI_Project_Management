import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { notFoundHandler } from './middleware/notFound.middleware';
import  {authRoutes} from './modules/auth/auth.routes';
import {workspaceRoutes} from './modules/workspace/workspace.routes'
import { projectRoutes } from './modules/project/project.routes';
import { featureRoutes } from './modules/feature/feature.routes';
export const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces',workspaceRoutes)
app.use('/api/v1/workspaces', projectRoutes);
app.use('/api/v1', featureRoutes);
app.use(notFoundHandler);
app.use(globalErrorHandler);