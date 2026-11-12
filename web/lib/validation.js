import { z } from "zod";
const clean = (min, max, label) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required.`)
    .max(max, `${label} is too long.`);
const date = z
  .string()
  .refine(
    (s) =>
      !s ||
      (/^\d{4}-\d{2}-\d{2}$/.test(s) &&
        !Number.isNaN(Date.parse(s)) &&
        new Date(s).toISOString().slice(0, 10) === s),
    "Enter a valid closing date.",
  );
export const entrySchema = z
  .object({
    id: z.uuid().optional(),
    revision: z.number().int().nonnegative().optional(),
    kind: z.enum(["update", "media", "document", "vacancy"]),
    title: clean(3, 160, "Title"),
    summary: clean(0, 600, "Summary"),
    body: clean(0, 16000, "Content"),
    status: z.enum(["draft", "published", "archived"]),
    media_id: z.uuid().nullable(),
    location: clean(0, 120, "Location"),
    employment_type: z.enum([
      "",
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
    ]),
    closing_date: date,
    apply_email: z.union([
      z.literal(""),
      z.email("Enter a valid application email."),
    ]),
  })
  .superRefine((v, ctx) => {
    if (v.id && v.revision === undefined)
      ctx.addIssue({
        code: "custom",
        message: "Refresh this item before saving.",
      });
    if (
      v.status === "published" &&
      ["document", "media"].includes(v.kind) &&
      !v.media_id
    )
      ctx.addIssue({
        code: "custom",
        message: "Attach a file before publishing.",
      });
    if (
      v.status === "published" &&
      v.kind === "vacancy" &&
      (!v.apply_email || !v.body || !v.location)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Add a job description, location and application email before publishing.",
      });
  });
export const companySchema = z.object({
  name: clean(3, 120, "Company name"),
  tagline: clean(5, 160, "Headline"),
  introduction: clean(20, 700, "Introduction"),
  about: clean(20, 3000, "About the company"),
  mission: clean(10, 700, "Mission"),
  email: z.email("Enter a valid contact email."),
  phone: clean(7, 40, "Phone number").regex(
    /^\+?[\d ()-]+$/,
    "Enter a valid phone number.",
  ),
  whatsapp: z
    .string()
    .trim()
    .max(40)
    .refine(
      (v) => !v || /^\+?[\d ()-]{7,40}$/.test(v),
      "Enter a valid WhatsApp number.",
    ),
  address: clean(3, 500, "Office location"),
  hours: clean(5, 300, "Contact hours"),
});
export function detectedMime(bytes) {
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return "image/jpeg";
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  if (bytes.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  if (
    bytes.length >= 16 &&
    bytes.toString("ascii", 4, 8) === "ftyp" &&
    [
      "isom",
      "iso2",
      "iso3",
      "iso4",
      "iso5",
      "iso6",
      "mp41",
      "mp42",
      "avc1",
      "dash",
      "M4V ",
      "MSNV",
    ].includes(bytes.toString("ascii", 8, 12))
  )
    return "video/mp4";
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163])) &&
    bytes.subarray(0, 512).includes(Buffer.from("webm"))
  )
    return "video/webm";
  return null;
}
export function fileLimit(mime) {
  return (
    (mime.startsWith("video/") ? 50 : mime === "application/pdf" ? 15 : 10) *
    1024 *
    1024
  );
}
