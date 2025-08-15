import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface FotoInfo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  dataUpload: Date;
  pessoaId: string;
  categoria: 'perfil' | 'documento' | 'vacina' | 'outros';
}

@Injectable({
  providedIn: 'root'
})
export class FotoService {
  private dbName = 'RPromoFotos';
  private dbVersion = 1;
  private storeName = 'fotos';
  private metadataStoreName = 'metadata';

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para os arquivos (blobs)
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }

        // Store para metadados
        if (!db.objectStoreNames.contains(this.metadataStoreName)) {
          const metadataStore = db.createObjectStore(this.metadataStoreName, { keyPath: 'id' });
          metadataStore.createIndex('pessoaId', 'pessoaId', { unique: false });
          metadataStore.createIndex('categoria', 'categoria', { unique: false });
        }
      };
    });
  }

  // Upload de foto
  uploadFoto(
    arquivo: File,
    pessoaId: string,
    categoria: 'perfil' | 'documento' | 'vacina' | 'outros' = 'perfil'
  ): Observable<FotoInfo> {
    return from(this.processarUpload(arquivo, pessoaId, categoria));
  }

  private async processarUpload(
    arquivo: File,
    pessoaId: string,
    categoria: 'perfil' | 'documento' | 'vacina' | 'outros'
  ): Promise<FotoInfo> {
    // Validações
    if (!arquivo.type.startsWith('image/')) {
      throw new Error('Apenas arquivos de imagem são permitidos');
    }

    if (arquivo.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('Arquivo muito grande. Máximo 5MB');
    }

    const db = await this.initDB();
    const id = this.gerarId();

    // Redimensionar imagem se necessário
    const imagemProcessada = await this.redimensionarImagem(arquivo, 1200, 1200);

    const fotoInfo: FotoInfo = {
      id,
      nome: arquivo.name,
      tipo: arquivo.type,
      tamanho: imagemProcessada.size,
      dataUpload: new Date(),
      pessoaId,
      categoria
    };

    // Salvar arquivo
    const transaction = db.transaction([this.storeName, this.metadataStoreName], 'readwrite');

    // Salvar blob
    const fotoStore = transaction.objectStore(this.storeName);
    await this.promisifyRequest(fotoStore.put({ id, blob: imagemProcessada }));

    // Salvar metadados
    const metadataStore = transaction.objectStore(this.metadataStoreName);
    await this.promisifyRequest(metadataStore.put(fotoInfo));

    return fotoInfo;
  }

  // Buscar fotos de uma pessoa
  getFotosPorPessoa(pessoaId: string): Observable<FotoInfo[]> {
    return from(this.buscarFotosPorPessoa(pessoaId));
  }

  private async buscarFotosPorPessoa(pessoaId: string): Promise<FotoInfo[]> {
    const db = await this.initDB();
    const transaction = db.transaction([this.metadataStoreName], 'readonly');
    const store = transaction.objectStore(this.metadataStoreName);
    const index = store.index('pessoaId');

    return this.promisifyRequest(index.getAll(pessoaId));
  }

  // Buscar foto específica
  getFoto(fotoId: string): Observable<{ info: FotoInfo; blob: Blob } | null> {
    return from(this.buscarFoto(fotoId));
  }

  private async buscarFoto(fotoId: string): Promise<{ info: FotoInfo; blob: Blob } | null> {
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName, this.metadataStoreName], 'readonly');

    // Buscar metadados
    const metadataStore = transaction.objectStore(this.metadataStoreName);
    const info = await this.promisifyRequest(metadataStore.get(fotoId));

    if (!info) return null;

    // Buscar blob
    const fotoStore = transaction.objectStore(this.storeName);
    const fotoData = await this.promisifyRequest(fotoStore.get(fotoId));

    if (!fotoData) return null;

    return { info, blob: fotoData.blob };
  }

  // Gerar URL para exibição
  getFotoUrl(fotoId: string): Observable<string | null> {
    return this.getFoto(fotoId).pipe(
      map(resultado => {
        if (!resultado) return null;
        return URL.createObjectURL(resultado.blob);
      }),
      catchError(() => of(null))
    );
  }

  // Remover foto
  removerFoto(fotoId: string): Observable<boolean> {
    return from(this.deletarFoto(fotoId));
  }

  private async deletarFoto(fotoId: string): Promise<boolean> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName, this.metadataStoreName], 'readwrite');

      // Remover blob
      const fotoStore = transaction.objectStore(this.storeName);
      await this.promisifyRequest(fotoStore.delete(fotoId));

      // Remover metadados
      const metadataStore = transaction.objectStore(this.metadataStoreName);
      await this.promisifyRequest(metadataStore.delete(fotoId));

      return true;
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      return false;
    }
  }

  // Remover todas as fotos de uma pessoa
  removerFotosPessoa(pessoaId: string): Observable<boolean> {
    return from(this.deletarFotosPessoa(pessoaId));
  }

  private async deletarFotosPessoa(pessoaId: string): Promise<boolean> {
    try {
      const fotos = await this.buscarFotosPorPessoa(pessoaId);
      const promises = fotos.map(foto => this.deletarFoto(foto.id));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Erro ao remover fotos da pessoa:', error);
      return false;
    }
  }

  // Redimensionar imagem para otimizar armazenamento
  private async redimensionarImagem(arquivo: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para blob
        canvas.toBlob((blob) => {
          resolve(blob || arquivo);
        }, arquivo.type, 0.8); // Qualidade 80%
      };

      img.src = URL.createObjectURL(arquivo);
    });
  }

  // Utilitário para converter IDBRequest em Promise
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Limpar cache de URLs
  limparCache(): void {
    // URLs criadas com createObjectURL devem ser liberadas manualmente
    // Este método pode ser chamado quando necessário
  }

  // Estatísticas de armazenamento
  async getEstatisticas(): Promise<{
    totalFotos: number;
    tamanhoTotal: number;
    fotosPorCategoria: Record<string, number>;
  }> {
    const db = await this.initDB();
    const transaction = db.transaction([this.metadataStoreName], 'readonly');
    const store = transaction.objectStore(this.metadataStoreName);

    const todasFotos: FotoInfo[] = await this.promisifyRequest(store.getAll());

    const estatisticas = {
      totalFotos: todasFotos.length,
      tamanhoTotal: todasFotos.reduce((total, foto) => total + foto.tamanho, 0),
      fotosPorCategoria: todasFotos.reduce((acc, foto) => {
        acc[foto.categoria] = (acc[foto.categoria] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return estatisticas;
  }
}
