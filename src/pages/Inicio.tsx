//! Landing resolver: sends the operator to the experience that matches their
//! permission profile (administrative, operative or kitchen).

import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { experienciaInicial } from "../nav/config";

export default function Inicio() {
  const { me } = useAuth();
  if (!me) return <Navigate to="/login" replace />;
  return <Navigate to={`/${experienciaInicial(me.permissions)}`} replace />;
}
