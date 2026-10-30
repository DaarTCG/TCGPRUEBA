"use client";
import { CSRF_COOKIE, CSRF_HEADER } from "./csrf";

export function getCsrfToken(): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

/** fetch que adjunta el token CSRF. */
export function secureFetch(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set(CSRF_HEADER, getCsrfToken());
  return fetch(url, { ...init, headers, credentials: "same-origin" });
}
