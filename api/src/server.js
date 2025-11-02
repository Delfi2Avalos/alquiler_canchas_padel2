import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import health from "./routes/health.routes.js";
import auth from "./routes/auth.routes.js";
import sucursales from "./routes/sucursales.routes.js";
import canchas from "./routes/canchas.routes.js";
import reservas from "./routes/reservas.routes.js";
import pagos from "./routes/pagos.routes.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

// CORS: localhost + LAN (192.168.* y 10.*). Ajustá si necesitás.
const ORIGIN_REGEX =
  /^https?:\/\/(localhost(:\d+)?|192\.168\.\d{1,3}\.\d{1,3}(:\d+)?|10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?)/i;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/insomnia
    const ok = ORIGIN_REGEX.test(origin);
    cb(ok ? null : new Error("CORS bloqueado: " + origin), ok);
  },
  credentials: true
}));

// Rutas
app.use(health);
app.use(auth);
app.use(sucursales);
app.use(canchas);
app.use(reservas);
app.use(pagos);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API http://0.0.0.0:${PORT}`));
