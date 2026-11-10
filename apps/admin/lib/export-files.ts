import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export function downloadTextFile(
  content: string,
  fileName: string,
  mime = "text/csv;charset=utf-8"
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function rowsToCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const escape = (value: string | number | null | undefined) => {
    const str = value == null ? "" : String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  return [headers.map(escape).join(",")]
    .concat(rows.map((row) => row.map(escape).join(",")))
    .join("\n");
}

export function downloadXlsx(
  sheetName: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
  fileName: string
) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

export function downloadPdfTable(
  title: string,
  headers: string[],
  rows: string[][],
  fileName: string
) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  let y = 26;
  const line = headers.join(" | ");
  doc.text(line.slice(0, 120), 14, y);
  y += 6;
  for (const row of rows.slice(0, 40)) {
    doc.text(row.join(" | ").slice(0, 140), 14, y);
    y += 5;
    if (y > 190) break;
  }
  doc.save(fileName);
}
