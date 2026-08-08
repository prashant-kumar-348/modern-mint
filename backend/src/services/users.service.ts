import pool from "../config/database";

/**
 * Profile-image storage (display-only).
 *
 * The image is stored on the users table as a validated base64 data URL.
 * It is never returned inline in room lists — instead a small versioned URL
 * (/api/users/:id/avatar?v=...) is handed out and the bytes are served (and
 * browser-cached) from GET /api/users/:id/avatar.
 */

// Accept only reasonable raster image data URLs.
const DATA_URL_RE = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

// ~300 KB image after base64 inflation — keeps the column and serve response small.
const MAX_LEN = 420_000;

export interface DecodedImage {
  mime:   string;
  buffer: Buffer;
}

/** Save (or replace) the signed-in user's profile image. Returns its versioned URL. */
export async function updateProfileImage(
  userId: string,
  image: unknown
): Promise<{ profileImageUrl: string }> {
  if (typeof image !== "string" || image.length === 0) {
    throw { status: 400, message: "image (a base64 data URL) is required." };
  }
  if (image.length > MAX_LEN) {
    throw { status: 413, message: "Image is too large — please choose a smaller photo." };
  }
  if (!DATA_URL_RE.test(image)) {
    throw { status: 400, message: "Image must be a base64 PNG, JPEG, or WebP data URL." };
  }

  const result = await pool.query<{ updated_at: Date }>(
    `UPDATE users SET profile_image_url = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING updated_at`,
    [image, userId]
  );
  if (result.rowCount === 0) {
    throw { status: 404, message: "User not found." };
  }

  // Cache-bust by the row's updated_at so a new upload invalidates the cached image.
  const v = result.rows[0].updated_at.getTime();
  return { profileImageUrl: `/api/users/${userId}/avatar?v=${v}` };
}

/** Decode a user's stored image into raw bytes for serving, or null if none/invalid. */
export async function getProfileImage(userId: string): Promise<DecodedImage | null> {
  const result = await pool.query<{ profile_image_url: string | null }>(
    `SELECT profile_image_url FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  const dataUrl = result.rows[0]?.profile_image_url;
  if (!dataUrl) return null;

  const m = DATA_URL_RE.exec(dataUrl);
  if (!m) return null;

  const ext  = m[1] === "jpg" ? "jpeg" : m[1];
  const mime = `image/${ext}`;
  const buffer = Buffer.from(m[2], "base64");
  return { mime, buffer };
}
