import { getSnapshot } from "@/lib/db";
import { error, requireAdmin } from "@/lib/api";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { code } = await params;
  const snapshot = await getSnapshot(code);
  if (!snapshot) return error("Session not found", 404);
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "csv";
  const rows = [["Rank", "Team", "Members", "Score"], ...snapshot.leaderboard.map((team, index) => [index + 1, team.name, team.members, team.score])];
  if (format === "pdf") {
    const pdf = createPdf([`${snapshot.quiz.title} Final Results`, "", ...rows.map((row) => row.join("  "))]);
    return new Response(pdf, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${code}-results.pdf"` } });
  }
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new Response(csv, { headers: { "content-type": "text/csv", "content-disposition": `attachment; filename="${code}-results.csv"` } });
}

function createPdf(lines: string[]) {
  const escaped = lines.map((line, index) => `BT /F1 12 Tf 54 ${760 - index * 18} Td (${escapePdf(line)}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${escaped.length} >>\nstream\n${escaped}\nendstream`
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body, "utf8");
}

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
