import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import app from '../app';
import fs from 'fs';
import {
  uploadFileService,
  deleteFileService,
  getUserFilesService,
  getFileByIdService,
  getFileInfoService,
  accessFileService,
} from '../services/filesServices';
import { authMiddleware } from '../middlewares/jwt';

jest.mock('../services/filesServices');
jest.mock('../middlewares/jwt', () => ({
  authMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { id: 1 };
    next();
  }),
}));

const createdDate = new Date().toISOString();

describe('Files API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/files/upload', () => {
    it('devrait renvoyer 400 si pas de fichier', async () => {
      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Aucun fichier téléchargé' });
    });

    it('devrait renvoyer 400 si userId manquant', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        (req as any).user = {};
        next();
      });
      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer token')
        .attach('file', Buffer.from('dummy'), { filename: 'test.txt' })
        .field('size', '123');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'ID utilisateur manquant' });
    });

    it("ne doit pas planter si cleanup échoue quand userId manquant et doit logger", async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        (req as any).user = {};
        next();
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const unlinkMock = jest.spyOn(fs, 'unlink').mockImplementation((path, cb: any) => {
        cb(new Error('permission denied'));
      });

      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer token')
        .attach('file', Buffer.from('dummy'), { filename: 'test.txt' })
        .field('size', '123');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'ID utilisateur manquant' });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Échec du nettoyage'),
        expect.any(Error)
      );

      unlinkMock.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('devrait renvoyer 400 si fichier trop gros', async () => {
      const bigBuffer = Buffer.alloc(50 * 1024 * 1024 + 1);
      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer token')
        .field('size', '123')
        .attach('file', bigBuffer, { filename: 'big.txt' });
      expect(uploadFileService).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Le fichier dépasse la taille maximale de 50 Mo.' });
    });

    it('devrait renvoyer 400 si extension suspicieuse', async () => {
      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer token')
        .field('size', '123')
        .attach('file', Buffer.from('echo malicious'), { filename: 'script.sh' });
      expect(uploadFileService).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Extension de fichier non autorisée.' });
    });

    it('devrait créer un fichier et renvoyer 201', async () => {
      (uploadFileService as jest.Mock).mockResolvedValue({ id: 42 });
      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer token')
        .field('size', '123')
        .attach('file', Buffer.from('dummy'), { filename: 'test.txt' });
      expect(uploadFileService).toHaveBeenCalledWith(
        expect.objectContaining({ originalname: 'test.txt' }),
        1,
        '123'
      );
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ message: 'Fichier ajouté avec succès', fileId: 42 });
    });

    it("devrait renvoyer 500 si erreur serveur lors de l'upload", async () => {
      (uploadFileService as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer token')
        .field('size', '123')
        .attach('file', Buffer.from('dummy'), { filename: 'test.txt' });
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Erreur lors de l'ajout du fichier" });
    });
  });

  describe('DELETE /api/files/delete/:id', () => {
    it('devrait renvoyer 404 si fichier non trouvé via getFileInfo', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .delete('/api/files/delete/1')
        .set('Authorization', 'Bearer token');
      expect(getFileInfoService).toHaveBeenCalledWith(1);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Fichier non trouvé' });
    });

    it('devrait renvoyer 403 si pas propriétaire', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue({
        id: 1,
        owner_id: 2,
        path: 'p',
        name: 'n',
        size: 0,
        created: createdDate
      });
      const res = await request(app)
        .delete('/api/files/delete/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Accès au fichier non autorisé' });
    });

    it('devrait renvoyer 404 si deleteFileService renvoie null', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue({
        id: 1,
        owner_id: 1,
        path: 'p',
        name: 'n',
        size: 0,
        created: createdDate
      });
      (deleteFileService as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .delete('/api/files/delete/1')
        .set('Authorization', 'Bearer token');
      expect(deleteFileService).toHaveBeenCalledWith(1);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Fichier non trouvé' });
    });

    it('devrait renvoyer 200 si suppression réussie', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue({
        id: 1,
        owner_id: 1,
        path: 'p',
        name: 'n',
        size: 0,
        created: createdDate
      });
      (deleteFileService as jest.Mock).mockResolvedValue(true);
      const res = await request(app)
        .delete('/api/files/delete/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Fichier supprimé (métadonnées supprimées aussi)' });
    });

    it("devrait renvoyer 500 si erreur serveur lors de la suppression", async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue({
        id: 1,
        owner_id: 1,
        path: 'p',
        name: 'n',
        size: 0,
        created: createdDate
      });
      (deleteFileService as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .delete('/api/files/delete/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Erreur lors de la suppression' });
    });
  });

  describe('GET /api/files/user/:userid', () => {
    it('devrait renvoyer la liste des fichiers', async () => {
      const files = [
        {
          id: 1,
          name: 'a.txt',
          owner_id: 1,
          size: 10,
          created: createdDate,
        },
      ];
      (getUserFilesService as jest.Mock).mockResolvedValue(files);
      const res = await request(app)
        .get('/api/files/user/1')
        .set('Authorization', 'Bearer token');
      expect(getUserFilesService).toHaveBeenCalledWith(1);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ files });
    });

    it('devrait renvoyer 400 si ID utilisateur manquant', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        (req as any).user = {};
        next();
      });
      const res = await request(app)
        .get('/api/files/user/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'ID utilisateur manquant' });
    });

    it("devrait renvoyer 500 si erreur serveur lors de la récupération des fichiers", async () => {
      (getUserFilesService as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .get('/api/files/user/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Erreur lors de la récupération des fichiers" });
    });
  });

  describe('GET /api/files/:id', () => {
    it('devrait renvoyer 404 si pas trouvé', async () => {
      (getFileByIdService as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .get('/api/files/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Fichier non trouvé' });
    });

    it('devrait renvoyer 403 si pas propriétaire', async () => {
      (getFileByIdService as jest.Mock).mockResolvedValue({
        id: 1,
        owner_id: 2,
        path: __filename,
        name: 'n',
      });
      const res = await request(app)
        .get('/api/files/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Accès au fichier non autorisé' });
    });

    it('devrait déclencher un envoi de fichier', async () => {
      const fakeFile = {
        id: 1,
        owner_id: 1,
        path: __filename,
        name: 'filesController.test.ts',
      };
      (getFileByIdService as jest.Mock).mockResolvedValue(fakeFile);
      (accessFileService as jest.Mock).mockResolvedValue(undefined);
      const res = await request(app)
        .get('/api/files/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.header['content-disposition']).toMatch(/attachment/);
    });

    it('devrait renvoyer 500 si erreur serveur lors de la récupération du fichier', async () => {
      (getFileByIdService as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .get('/api/files/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Erreur lors de la récupération du fichier" });
    });

    it('devrait renvoyer 500 si erreur de téléchargement', async () => {
      const fakeFile = {
        id: 1,
        owner_id: 1,
        path: __filename,
        name: 'filesController.test.ts',
      };
      (getFileByIdService as jest.Mock).mockResolvedValue(fakeFile);
      (accessFileService as jest.Mock).mockResolvedValue(undefined);

      const downloadMock = jest.spyOn(express.response as any, 'download') as jest.Mock;
      downloadMock.mockImplementation(function (_path: any, _filename: any, cb: any) {
        cb(new Error('dl fail'));
      });

      const res = await request(app)
        .get('/api/files/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Erreur lors du téléchargement du fichier' });

      downloadMock.mockRestore();
    });
  });

  describe('GET /api/files/info/:id', () => {
    it('devrait renvoyer 404 si pas trouvé', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .get('/api/files/info/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Fichier non trouvé' });
    });

    it('devrait renvoyer 403 si pas propriétaire', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue({ owner_id: 2 } as any);
      const res = await request(app)
        .get('/api/files/info/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Accès au fichier non autorisé' });
    });

    it('devrait renvoyer les infos du fichier', async () => {
      const info = {
        name: 'a.txt',
        owner_id: 1,
        size: 10,
        created: createdDate,
      };
      (getFileInfoService as jest.Mock).mockResolvedValue(info);
      const res = await request(app)
        .get('/api/files/info/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(info);
    });

    it("devrait renvoyer 500 si erreur serveur lors de la récupération des informations du fichier", async () => {
      (getFileInfoService as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .get('/api/files/info/1')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Erreur lors de la récupération des informations du fichier" });
    });
  });
});
