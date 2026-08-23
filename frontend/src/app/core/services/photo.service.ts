import { Injectable } from '@angular/core';

export interface EncodedPhoto {
  base64: string; // without the "data:...;base64," prefix
  mimeType: string;
  filename: string;
}

/**
 * Prepares an image for upload: validates, resizes/compresses on a canvas, and
 * encodes to base64 so the repository can ship it to Drive via Apps Script.
 * (Resize logic ported from the old IndexedDB-based FotoService.)
 */
@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly maxDimension = 1200;
  private readonly quality = 0.8;
  private readonly maxBytes = 5 * 1024 * 1024;

  async encode(file: File): Promise<EncodedPhoto> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas arquivos de imagem são permitidos');
    }
    if (file.size > this.maxBytes) {
      throw new Error('Arquivo muito grande. Máximo 5MB');
    }

    const blob = await this.resize(file);
    const base64 = await this.toBase64(blob);
    return { base64, mimeType: blob.type || file.type, filename: file.name };
  }

  private resize(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = this.fit(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => resolve(blob ?? file), file.type, this.quality);
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Não foi possível ler a imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  private fit(width: number, height: number): { width: number; height: number } {
    const max = this.maxDimension;
    if (width <= max && height <= max) return { width, height };
    return width > height
      ? { width: max, height: Math.round((height * max) / width) }
      : { width: Math.round((width * max) / height), height: max };
  }

  private toBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
}
