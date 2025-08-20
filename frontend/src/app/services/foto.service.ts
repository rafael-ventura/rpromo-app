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

interface EstatisticasFotos {
  totalFotos: number;
  tamanhoTotal: number;
  fotosPorCategoria: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class FotoService {
  private readonly DB_CONFIG = {
    name: 'RPromoFotos',
    version: 1,
    stores: {
      fotos: 'fotos',
      metadata: 'metadata'
    }
  };

  private readonly VALIDACAO = {
    tamanhoMaximo: 5 * 1024 * 1024, // 5MB
    dimensoesMaximas: { width: 1200, height: 1200 },
    qualidadeCompressao: 0.8
  };

  constructor() {
    this.inicializarDB();
  }

  // === MÉTODOS PÚBLICOS ===

  uploadFoto(
    arquivo: File,
    pessoaId: string,
    categoria: 'perfil' | 'documento' | 'vacina' | 'outros' = 'perfil'
  ): Observable<FotoInfo> {
    return from(this.processarUpload(arquivo, pessoaId, categoria));
  }

  getFotosPorPessoa(pessoaId: string): Observable<FotoInfo[]> {
    return from(this.buscarFotosPorPessoa(pessoaId));
  }

  getFoto(fotoId: string): Observable<{ info: FotoInfo; blob: Blob } | null> {
    return from(this.buscarFoto(fotoId));
  }

  getFotoUrl(fotoId: string): Observable<string | null> {
    return this.getFoto(fotoId).pipe(
      map(resultado => resultado ? URL.createObjectURL(resultado.blob) : null),
      catchError(() => of(null))
    );
  }

  removerFoto(fotoId: string): Observable<boolean> {
    return from(this.deletarFoto(fotoId));
  }

  removerFotosPessoa(pessoaId: string): Observable<boolean> {
    return from(this.deletarFotosPessoa(pessoaId));
  }

  getEstatisticas(): Observable<EstatisticasFotos> {
    return from(this.calcularEstatisticas());
  }

  limparCache(): void {
    // URLs criadas com createObjectURL devem ser liberadas manualmente
  }

  // === MÉTODOS PRIVADOS ===

  private async inicializarDB(): Promise<void> {
    try {
      await this.abrirDB();
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
    }
  }

  private async processarUpload(
    arquivo: File,
    pessoaId: string,
    categoria: 'perfil' | 'documento' | 'vacina' | 'outros'
  ): Promise<FotoInfo> {
    this.validarArquivo(arquivo);

    const db = await this.abrirDB();
    const id = this.gerarId();
    const imagemProcessada = await this.processarImagem(arquivo);

    const fotoInfo = this.criarFotoInfo(id, arquivo, imagemProcessada, pessoaId, categoria);
    await this.salvarFoto(db, id, imagemProcessada, fotoInfo);

    return fotoInfo;
  }

  private async buscarFotosPorPessoa(pessoaId: string): Promise<FotoInfo[]> {
    const db = await this.abrirDB();
    return this.executarBuscaPorPessoa(db, pessoaId);
  }

  private async buscarFoto(fotoId: string): Promise<{ info: FotoInfo; blob: Blob } | null> {
    const db = await this.abrirDB();

    const info = await this.buscarMetadata(db, fotoId);
    if (!info) return null;

    const blob = await this.buscarBlob(db, fotoId);
    if (!blob) return null;

    return { info, blob };
  }

  private async deletarFoto(fotoId: string): Promise<boolean> {
    try {
      const db = await this.abrirDB();
      await this.removerArquivos(db, fotoId);
      return true;
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      return false;
    }
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

  private async calcularEstatisticas(): Promise<EstatisticasFotos> {
    const db = await this.abrirDB();
    const todasFotos = await this.buscarTodasFotos(db);

    return {
      totalFotos: todasFotos.length,
      tamanhoTotal: todasFotos.reduce((total, foto) => total + foto.tamanho, 0),
      fotosPorCategoria: this.agruparPorCategoria(todasFotos)
    };
  }

  // === UTILITÁRIOS DE BANCO ===

  private async abrirDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_CONFIG.name, this.DB_CONFIG.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => this.configurarDB(event);
    });
  }

  private configurarDB(event: IDBVersionChangeEvent): void {
    const db = (event.target as IDBOpenDBRequest).result;

    this.criarStoreSeNaoExiste(db, this.DB_CONFIG.stores.fotos, { keyPath: 'id' });
    this.criarStoreSeNaoExiste(db, this.DB_CONFIG.stores.metadata, {
      keyPath: 'id',
      indices: [
        { name: 'pessoaId', keyPath: 'pessoaId', unique: false },
        { name: 'categoria', keyPath: 'categoria', unique: false }
      ]
    });
  }

  private criarStoreSeNaoExiste(
    db: IDBDatabase,
    storeName: string,
    config: { keyPath: string; indices?: Array<{name: string; keyPath: string; unique: boolean}> }
  ): void {
    if (db.objectStoreNames.contains(storeName)) return;

    const store = db.createObjectStore(storeName, { keyPath: config.keyPath });

    if (config.indices) {
      config.indices.forEach(index => {
        store.createIndex(index.name, index.keyPath, { unique: index.unique });
      });
    }
  }

  private async executarOperacaoDB<T>(
    db: IDBDatabase,
    storeNames: string[],
    modo: IDBTransactionMode,
    operacao: (stores: IDBObjectStore[]) => Promise<T>
  ): Promise<T> {
    const transaction = db.transaction(storeNames, modo);
    const stores = storeNames.map(name => transaction.objectStore(name));
    return operacao(stores);
  }

  private promisificarRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === OPERAÇÕES ESPECÍFICAS ===

  private async salvarFoto(db: IDBDatabase, id: string, blob: Blob, info: FotoInfo): Promise<void> {
    await this.executarOperacaoDB(
      db,
      [this.DB_CONFIG.stores.fotos, this.DB_CONFIG.stores.metadata],
      'readwrite',
      async ([fotoStore, metadataStore]) => {
        await this.promisificarRequest(fotoStore.put({ id, blob }));
        await this.promisificarRequest(metadataStore.put(info));
      }
    );
  }

  private async executarBuscaPorPessoa(db: IDBDatabase, pessoaId: string): Promise<FotoInfo[]> {
    return this.executarOperacaoDB(
      db,
      [this.DB_CONFIG.stores.metadata],
      'readonly',
      async ([metadataStore]) => {
        const index = metadataStore.index('pessoaId');
        return this.promisificarRequest(index.getAll(pessoaId));
      }
    );
  }

  private async buscarMetadata(db: IDBDatabase, fotoId: string): Promise<FotoInfo | null> {
    return this.executarOperacaoDB(
      db,
      [this.DB_CONFIG.stores.metadata],
      'readonly',
      async ([metadataStore]) => {
        return this.promisificarRequest(metadataStore.get(fotoId));
      }
    );
  }

  private async buscarBlob(db: IDBDatabase, fotoId: string): Promise<Blob | null> {
    return this.executarOperacaoDB(
      db,
      [this.DB_CONFIG.stores.fotos],
      'readonly',
      async ([fotoStore]) => {
        const resultado = await this.promisificarRequest(fotoStore.get(fotoId));
        return resultado?.blob || null;
      }
    );
  }

  private async removerArquivos(db: IDBDatabase, fotoId: string): Promise<void> {
    await this.executarOperacaoDB(
      db,
      [this.DB_CONFIG.stores.fotos, this.DB_CONFIG.stores.metadata],
      'readwrite',
      async ([fotoStore, metadataStore]) => {
        await this.promisificarRequest(fotoStore.delete(fotoId));
        await this.promisificarRequest(metadataStore.delete(fotoId));
      }
    );
  }

  private async buscarTodasFotos(db: IDBDatabase): Promise<FotoInfo[]> {
    return this.executarOperacaoDB(
      db,
      [this.DB_CONFIG.stores.metadata],
      'readonly',
      async ([metadataStore]) => {
        return this.promisificarRequest(metadataStore.getAll());
      }
    );
  }

  // === VALIDAÇÃO E PROCESSAMENTO ===

  private validarArquivo(arquivo: File): void {
    if (!arquivo.type.startsWith('image/')) {
      throw new Error('Apenas arquivos de imagem são permitidos');
    }

    if (arquivo.size > this.VALIDACAO.tamanhoMaximo) {
      throw new Error('Arquivo muito grande. Máximo 5MB');
    }
  }

  private async processarImagem(arquivo: File): Promise<Blob> {
    const { width, height } = this.VALIDACAO.dimensoesMaximas;
    return this.redimensionarImagem(arquivo, width, height);
  }

  private async redimensionarImagem(arquivo: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const dimensoes = this.calcularNovasDimensoes(img.width, img.height, maxWidth, maxHeight);

        canvas.width = dimensoes.width;
        canvas.height = dimensoes.height;

        ctx.drawImage(img, 0, 0, dimensoes.width, dimensoes.height);

        canvas.toBlob(
          (blob) => resolve(blob || arquivo),
          arquivo.type,
          this.VALIDACAO.qualidadeCompressao
        );
      };

      img.src = URL.createObjectURL(arquivo);
    });
  }

  private calcularNovasDimensoes(
    larguraOriginal: number,
    alturaOriginal: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: larguraOriginal, height: alturaOriginal };

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

    return { width, height };
  }

  // === UTILITÁRIOS ===

  private criarFotoInfo(
    id: string,
    arquivoOriginal: File,
    arquivoProcessado: Blob,
    pessoaId: string,
    categoria: 'perfil' | 'documento' | 'vacina' | 'outros'
  ): FotoInfo {
    return {
      id,
      nome: arquivoOriginal.name,
      tipo: arquivoOriginal.type,
      tamanho: arquivoProcessado.size,
      dataUpload: new Date(),
      pessoaId,
      categoria
    };
  }

  private agruparPorCategoria(fotos: FotoInfo[]): Record<string, number> {
    return fotos.reduce((acc, foto) => {
      acc[foto.categoria] = (acc[foto.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
