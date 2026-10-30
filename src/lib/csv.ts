/**
 * Genera CSV seguro para Excel/Sheets.
 * Previene "CSV/Formula injection": celdas que empiezan con = + - @ TAB o CR se prefijan con '.
 */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r;]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  // BOM para que Excel lea bien los acentos
  return "﻿" + [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}
