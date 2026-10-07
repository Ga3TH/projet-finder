import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

export const TRANSITIONS_AUTORISEES = {
  en_attente: ["confirmee", "refusee"],
  confirmee: [],
  refusee: [],
  annulee: [],
};

export function transitionReservationAutorisee(statutActuel, statutVoulu) {
  return (TRANSITIONS_AUTORISEES[statutActuel] ?? []).includes(statutVoulu);
}

export function validerSchema(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.body);

    if (!resultat.success) {
      const details = resultat.error.issues.map((erreur) => ({
        chemin: erreur.path.join(".") || "corps",
        message: erreur.message,
      }));

      return res.status(400).json({
        erreur: "Corps invalide",
        details,
      });
    }

    req.body = resultat.data;
    return next();
  };
}

export function authentifier(req, res, next) {
  const authorization = req.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ erreur: "Jeton absent ou invalide" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    req.utilisateur = payload;
    return next();
  } catch {
    return res.status(401).json({ erreur: "Jeton invalide" });
  }
}

export function exigeRole(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ erreur: "Authentification requise" });
    }

    if (rolesAutorises.length > 0 && !rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({ erreur: "Rôle insuffisant" });
    }

    return next();
  };
}
