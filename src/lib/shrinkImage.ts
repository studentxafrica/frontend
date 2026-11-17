/**
 * Phone camera photos are often 5–12 MB. Shrinking them before upload keeps a
 * verification request small enough for the server's upload limit, and quick
 * on mobile data. PDFs and small images are returned unchanged.
 */
const SHRINK_ABOVE_BYTES = 2 * 1024 * 1024;
const MAX_EDGE_PX = 2000;

export async function shrinkImage(file: File): Promise<File> {
	if (!file.type.startsWith('image/') || file.size <= SHRINK_ABOVE_BYTES) {
		return file;
	}
	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(bitmap.width * scale);
		canvas.height = Math.round(bitmap.height * scale);
		canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		bitmap.close();
		const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
		if (!blob || blob.size >= file.size) return file;
		const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
		return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
	} catch {
		// Formats the browser can't decode (some HEIC photos) go up as they are.
		return file;
	}
}
