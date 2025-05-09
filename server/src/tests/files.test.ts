import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import app from '../app';
import {
  uploadFileService,
  deleteFileService,
  getUserFilesService,
  getFileByIdService,
  getFileInfoService,
  accessFileService,
} from '../services/filesServices';
import { getStatisticsService } from '../services/statisticsServices';
import { authMiddleware } from '../middlewares/jwt';

jest.mock('../services/filesServices');
jest.mock('../services/statisticsServices');
jest.mock('../middlewares/jwt', () => ({
  authMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { id: 1 };
    next();
  }),
}));

const createdDate = new Date().toISOString();
const lastAccess = new Date().toISOString();

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

    it('devrait créer un fichier et renvoyer 201', async () => {
      (uploadFileService as jest.Mock).mockResolvedValue({ id: 42 });
      const res = await request(app)
        .post('/api/files/upload')
        .field('size', '123')
        .attach('file', Buffer.from('dummy'), { filename: 'test.txt' });
      expect(uploadFileService).toHaveBeenCalled();
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ message: 'Fichier ajouté avec succès', fileId: 42 });
    });
  });

  describe('DELETE /api/files/delete/:id', () => {
    it('devrait renvoyer 404 si pas trouvé', async () => {
      (deleteFileService as jest.Mock).mockResolvedValue(null);
      const res = await request(app).delete('/api/files/delete/1');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Fichier non trouvé' });
    });

    it('devrait supprimer et renvoyer 200', async () => {
      (deleteFileService as jest.Mock).mockResolvedValue(true);
      const res = await request(app).delete('/api/files/delete/1');
      expect(deleteFileService).toHaveBeenCalledWith(1);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Fichier supprimé (métadonnées supprimées aussi)' });
    });
  });

  describe('GET /api/files/:id', () => {
    it('devrait renvoyer 404 si pas trouvé', async () => {
      (getFileByIdService as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/api/files/1');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Fichier non trouvé' });
    });

    it('devrait déclencher un envoi de fichier', async () => {
      const fakeFile = { id: 1, path: __filename, name: 'filesRoutes.test.ts', owner_id: 2 };
      (getFileByIdService as jest.Mock).mockResolvedValue(fakeFile);
      (accessFileService as jest.Mock).mockResolvedValue(undefined);
      const res = await request(app).get('/api/files/1');
      expect(res.status).toBe(200);
      expect(res.header['content-disposition']).toMatch(/attachment/);
    });
  });

  describe('GET /api/files/user/:userid', () => {
    it('devrait renvoyer la liste des fichiers', async () => {
      const files = [{ id: 1, name: 'a.txt', owner_id: 1, size: 10, created: createdDate }];
      (getUserFilesService as jest.Mock).mockResolvedValue(files);
      const res = await request(app).get('/api/files/user/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ files });
    });
  });

  describe('GET /api/files/info/:id', () => {
    it('devrait renvoyer 404 si pas trouvé', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/api/files/info/1');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Fichier non trouvé' });
    });

    it('devrait renvoyer 401 si pas propriétaire', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue({ owner_id: 2 });
      const res = await request(app).get('/api/files/info/1');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Accès au fichier non autorisé' });
    });

    it('devrait renvoyer les infos du fichier', async () => {
      const info = { name: 'a.txt', owner_id: 1, size: 10, created: createdDate };
      (getFileInfoService as jest.Mock).mockResolvedValue(info);
      const res = await request(app).get('/api/files/info/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(info);
    });
  });

  describe('GET /api/files/statistics/:file_id', () => {
    it('devrait renvoyer 400 si id invalide', async () => {
      const res = await request(app).get('/api/files/statistics/abc');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'ID de fichier invalide' });
    });

    it('devrait renvoyer 404 si pas trouvé', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/api/files/statistics/1');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Fichier non trouvé' });
    });

    it('devrait renvoyer 401 si pas propriétaire', async () => {
      (getFileInfoService as jest.Mock).mockResolvedValue({ owner_id: 2 });
      const res = await request(app).get('/api/files/statistics/1');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Accès au fichier non autorisé' });
    });

    it('devrait renvoyer les statistiques', async () => {
      const stats = {
        file_id: 1,
        nb_access_last_24h: 0,
        nb_access_last_week: 0,
        nb_access_total: 0,
        last_access_date_time: lastAccess,
      };
      (getFileInfoService as jest.Mock).mockResolvedValue({ owner_id: 1 });
      (getStatisticsService as jest.Mock).mockResolvedValue(stats);
      const res = await request(app).get('/api/files/statistics/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ statistics: stats });
      expect(res.header['cache-control']).toBe('no-cache');
      expect(res.header['etag']).toBeDefined();
    });
  });
});
