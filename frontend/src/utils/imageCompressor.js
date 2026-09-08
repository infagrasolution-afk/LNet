/**
 * Comprime imágenes en el navegador del cliente antes de subirlas al servidor.
 * Convierte archivos pesados (5MB - 12MB) de cámaras móviles en JPEGs optimizados (~200KB - 400KB).
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  // Si no es una imagen o es un SVG/GIF, retornar el archivo original
  if (!file || !file.type || !file.type.startsWith('image/') || file.type.includes('gif') || file.type.includes('svg')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular proporciones manteniendo relación de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Renderizar con suavizado de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback al archivo original
              return;
            }

            // Crear nuevo objeto File con el mismo nombre y extensión .jpg
            const nameParts = file.name.split('.');
            nameParts.pop();
            const newName = `${nameParts.join('.')}.jpg`;

            const compressedFile = new File([blob], newName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        resolve(file);
      };
    };

    reader.onerror = () => {
      resolve(file);
    };
  });
}
