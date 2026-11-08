const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function api(path, options = {}) {
  const token = localStorage.getItem("nova-token");
  const response = await fetch(`${apiUrl}/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && path !== "/auth/login") {
    localStorage.removeItem("nova-token");
    window.dispatchEvent(new Event("nova-session-expired"));
  }
  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "No se pudo completar la solicitud.");
  return data;
}

export const jsonBody = (value) => JSON.stringify(value);

export function money(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(Number(value ?? 0));
}

export function dateTime(value) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
