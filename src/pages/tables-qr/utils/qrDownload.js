// QR download utilities.
// Priority: if the QR has a backend-generated imageUrl (with template overlay), fetch & download that directly.
// Fallback: render a plain canvas QR for QRs without a stored image.

const CARD = { width: 900, height: 1100, qrArea: 620 };
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

const LAYOUT_STYLES = {
  classic: { bg: "#ffffff", plate: "#ffffff", module: "#000000", text: "#111111", muted: "#555555", font: SANS },
  modern:  { bg: "#ffffff", plate: "#ffffff", module: "#1f2937", text: "#1f2937", muted: "#6b7280", font: SANS, accent: "#f29191" },
  elegant: { bg: "#faf6ee", plate: "#ffffff", module: "#3b2f1e", text: "#3b2f1e", muted: "#8a7756", font: SERIF, gold: "#b8964f" },
};

const sanitize = (text) => String(text).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");

export function buildQRFilename({ table, qr }) {
  const parts = [table?.tableId && sanitize(table.tableId), sanitize(qr.name)].filter(Boolean);
  return `${parts.join("_")}.png`;
}

function fillRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
  ctx.fill();
}

/** Fetches the backend-stored QR image (with template overlay) and returns a Blob. */
async function fetchRemoteImage(imageUrl) {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`Failed to fetch QR image: ${res.status}`);
  return res.blob();
}

/** Draws a plain canvas QR card and returns a PNG Blob (fallback when no imageUrl). */
export async function renderQRImage({ url, label, sublabel, layout = "classic" }) {
  const { default: QRCode } = await import("qrcode");
  const style = LAYOUT_STYLES[layout] || LAYOUT_STYLES.classic;
  const { width, height, qrArea } = CARD;

  const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
  const count = qr.modules.size;
  const quiet = 4;
  const px = Math.floor(qrArea / (count + quiet * 2));
  const plateSize = (count + quiet * 2) * px;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, width, height);

  // Layout decoration
  if (layout === "modern") {
    ctx.fillStyle = style.accent;
    ctx.fillRect(0, 0, width, 170);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 54px ${style.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCAN TO ORDER", width / 2, 85);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
  } else if (layout === "elegant") {
    ctx.strokeStyle = style.gold;
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, width - 56, height - 56);
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, width - 88, height - 88);
  } else {
    ctx.strokeStyle = style.module;
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, width - 48, height - 48);
  }

  // QR plate + modules
  const plateX = Math.round((width - plateSize) / 2);
  const plateY = layout === "modern" ? 240 : 190;
  ctx.fillStyle = style.plate;
  ctx.fillRect(plateX, plateY, plateSize, plateSize);
  ctx.fillStyle = style.module;
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.modules.get(row, col)) {
        ctx.fillRect(plateX + (col + quiet) * px, plateY + (row + quiet) * px, px, px);
      }
    }
  }

  // Captions
  const captionTop = plateY + plateSize + 90;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  if (label) {
    ctx.fillStyle = style.text;
    ctx.font = `700 76px ${style.font}`;
    ctx.fillText(label, width / 2, captionTop, width - 160);
  }
  if (layout !== "modern") {
    ctx.fillStyle = style.muted;
    ctx.font = `${layout === "elegant" ? "italic " : ""}400 40px ${style.font}`;
    ctx.fillText("Scan to order", width / 2, captionTop + 70);
  }
  if (sublabel) {
    ctx.fillStyle = style.muted;
    ctx.font = `400 30px ${style.font}`;
    ctx.fillText(sublabel, width / 2, height - 70, width - 160);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create PNG"))), "image/png");
  });
}

/**
 * Resolves the final image blob for a QR:
 * - If the QR has a backend imageUrl (template-overlaid image) → fetch it directly.
 * - Otherwise → render a plain canvas QR as fallback.
 */
async function resolveQRBlob({ qr, table, url }) {
  if (qr.imageUrl) {
    try {
      return await fetchRemoteImage(qr.imageUrl);
    } catch (err) {
      console.warn("Could not fetch QR image from server, falling back to canvas render.", err);
    }
  }
  return renderQRImage({ url, label: table?.tableId, sublabel: qr.name, layout: qr.layout });
}

/** Individual download: one PNG. */
export async function downloadQRCode({ qr, table, url }) {
  const blob = await resolveQRBlob({ qr, table, url });
  saveBlob(blob, buildQRFilename({ table, qr }));
}

/** items: [{ qr, table, url }] → ZIP Blob */
export async function createQRZip(items, onProgress) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const used = new Set();

  for (let i = 0; i < items.length; i++) {
    const { qr, table, url } = items[i];
    const blob = await resolveQRBlob({ qr, table, url });

    const base = buildQRFilename({ table, qr }).replace(/\.png$/i, "");
    let name = `${base}.png`;
    for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base}-${n}.png`;
    used.add(name.toLowerCase());

    zip.file(name, blob);
    onProgress?.(i + 1, items.length);
  }
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}

export function saveBlob(blob, filename) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

/** Bulk download: one ZIP with every item. Returns the number of files. */
export async function downloadAllQRCodes(items, onProgress) {
  const zipBlob = await createQRZip(items, onProgress);
  const today = new Date().toISOString().slice(0, 10);
  saveBlob(zipBlob, `qr-codes-${today}.zip`);
  return items.length;
}
