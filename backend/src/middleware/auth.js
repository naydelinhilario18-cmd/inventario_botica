import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? "development-only-change-this-secret";

export function authenticate(request, response, next) {
  const authorization = request.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    return response.status(401).json({ error: "Inicia sesión para continuar." });
  }

  try {
    request.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return response.status(401).json({ error: "La sesión expiró. Inicia sesión nuevamente." });
  }
}

export function requireAdmin(request, response, next) {
  if (request.user?.role !== "admin") {
    return response.status(403).json({ error: "Esta acción requiere permisos de administrador." });
  }
  return next();
}

export { jwtSecret };
