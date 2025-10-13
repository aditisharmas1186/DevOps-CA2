import sharp from "sharp";

export async function preprocessImage(imageData: string): Promise<string> {
  const buffer = Buffer.from(imageData, 'base64');
  
  const processed = await sharp(buffer)
    .resize(512, 512, { fit: 'contain' })
    .normalize()
    .toBuffer();
    
  return processed.toString('base64');
}
