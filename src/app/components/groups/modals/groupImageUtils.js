// frontend/src/app/components/groups/modals/groupImageUtils.js

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute("crossOrigin", "anonymous");
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = url;
  });

/**
 * Resizes an image to a maximum dimension while maintaining aspect ratio.
 * This is used to speed up uploads without cropping the content.
 */
export async function resizeImage(file, maxDimension = 1200) {
  const image = await createImage(URL.createObjectURL(file));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let { width, height } = image;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = (maxDimension / width) * height;
      width = maxDimension;
    } else {
      width = (maxDimension / height) * width;
      height = maxDimension;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], file.name, { type: "image/jpeg" }));
    }, "image/jpeg", 0.8);
  });
}

// Keeping this for backward compatibility if needed, but not for cropping anymore
export default async function getProcessedGroupImg(imageSrc, pixelCrop, rotation = 0) {
    // This is now effectively deprecated by the non-destructive approach
    return { blob: null, url: imageSrc }; 
}
