/**
 * Trigger a mock file download so the interaction gives real feedback without a
 * backend. Generates a small placeholder text blob named after the file.
 */
export function downloadMockFile(fileName: string): void {
  if (typeof window === "undefined") return;
  const content =
    `Heizen People — placeholder file\n\n` +
    `File: ${fileName}\n` +
    `This is a mock attachment generated for the prototype.\n`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
