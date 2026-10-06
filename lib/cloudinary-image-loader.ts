import type { ImageLoaderProps } from 'next/image';

const CLOUDINARY_HOSTNAME = 'res.cloudinary.com';
const IMAGE_UPLOAD_PATH = '/image/upload/';

export function isCloudinaryImageUrl(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === 'https:'
      && url.hostname === CLOUDINARY_HOSTNAME
      && url.pathname.includes(IMAGE_UPLOAD_PATH);
  } catch {
    return false;
  }
}

export function cloudinaryImageLoader({ src, width }: ImageLoaderProps) {
  const url = new URL(src);
  const uploadIndex = url.pathname.indexOf(IMAGE_UPLOAD_PATH);

  if (url.protocol !== 'https:' || url.hostname !== CLOUDINARY_HOSTNAME || uploadIndex < 0) {
    return src;
  }

  const transformation = `f_auto,q_auto,c_limit,w_${width}`;
  const insertionPoint = uploadIndex + IMAGE_UPLOAD_PATH.length;
  url.pathname = `${url.pathname.slice(0, insertionPoint)}${transformation}/${url.pathname.slice(insertionPoint)}`;

  return url.toString();
}
