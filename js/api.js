/**
 * api.js — Capa de comunicación con el backend (Google Apps Script).
 * El frontend SOLO conoce la URL pública de la API. Ninguna credencial,
 * token o ID sensible se guarda aquí.
 */

const CONFIG = {
  // Reemplazar por la URL de implementación de tu Web App de Apps Script.
  // Ejemplo: https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXX/exec
  API_URL: 'PEGA_AQUI_TU_URL_DE_APPS_SCRIPT'
};

const Api = (() => {

  async function get(action, params = {}) {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString(), { method: 'GET' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Error al consultar el servidor.');
    return json.data;
  }

  async function post(action, payload = {}) {
    // Se usa text/plain para evitar el preflight CORS (Apps Script no
    // responde OPTIONS). El backend igual parsea el JSON correctamente.
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Error al guardar la información.');
    return json.data;
  }

  return {
    ping: () => get('ping'),
    getResponsables: () => get('getResponsables'),
    getSectores: () => get('getSectores'),
    getTiposLabor: () => get('getTiposLabor'),
    getLabores: (filters) => get('getLabores', filters),
    getLaborById: (idLabor) => get('getLaborById', { id_labor: idLabor }),
    createLabor: (payload) => post('createLabor', payload),
    createAdvance: (payload) => post('createAdvance', payload)
  };
})();
