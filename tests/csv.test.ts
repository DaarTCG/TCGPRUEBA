import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/lib/csv";

describe("Exportación CSV", () => {
  it("neutraliza fórmulas (CSV injection)", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe(`"'=HYPERLINK(""http://evil"")"`);
    expect(csvCell("+56 9 1234")).toBe("'+56 9 1234");
    expect(csvCell("-2+3")).toBe("'-2+3");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });
  it("escapa comas, comillas y saltos de línea", () => {
    expect(csvCell('Caja "ETB", sellada')).toBe('"Caja ""ETB"", sellada"');
    expect(csvCell("a\nb")).toBe('"a\nb"');
  });
  it("deja números y texto normal sin cambios", () => {
    expect(csvCell(1080000)).toBe("1080000");
    expect(csvCell("Rayquaza VMAX")).toBe("Rayquaza VMAX");
    expect(csvCell(null)).toBe("");
  });
  it("incluye BOM y separa filas con CRLF", () => {
    const out = toCsv(["A", "B"], [[1, 2]]);
    expect(out.startsWith("﻿")).toBe(true);
    expect(out).toBe("﻿A,B\r\n1,2");
  });
});
