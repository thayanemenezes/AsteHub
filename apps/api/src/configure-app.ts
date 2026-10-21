import { ValidationPipe, type INestApplication } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const DEFAULT_DEVELOPMENT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3002",
];

export function configureApp(app: INestApplication): void {
  const configuredOrigins = process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origins =
    configuredOrigins && configuredOrigins.length > 0
      ? configuredOrigins
      : process.env.NODE_ENV === "production"
        ? []
        : DEFAULT_DEVELOPMENT_ORIGINS;

  if (process.env.NODE_ENV === "production" && origins.length === 0) {
    throw new Error("CORS_ORIGINS must be configured in production.");
  }

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: origins, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
