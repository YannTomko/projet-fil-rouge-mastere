import fs from "fs";
import { prisma } from "../prisma";
import {
  uploadFileService,
  deleteFileService,
  getUserFilesService,
  getFileByIdService,
  getFileInfoService,
  accessFileService,
} from "../services/filesServices";

jest.mock("../prisma", () => ({
  prisma: {
    file: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockedFile = prisma.file as jest.Mocked<typeof prisma.file>;

describe("fileServices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadFileService", () => {
    it("doit créer un fichier en base", async () => {
      const fakeFile = { originalname: "test.txt", path: "/tmp/test.txt" } as Express.Multer.File;
      mockedFile.create.mockResolvedValue({ id: 1, name: "test.txt", path: "/tmp/test.txt", owner_id: 42, size: 123 } as any);

      const result = await uploadFileService(fakeFile, 42, "123");
      expect(mockedFile.create).toHaveBeenCalledWith({
        data: { name: "test.txt", path: "/tmp/test.txt", owner_id: 42, size: 123 },
      });
      expect(result.id).toBe(1);
    });
  });

  describe("deleteFileService", () => {
    it("doit renvoyer null si pas trouvé", async () => {
      mockedFile.findUnique.mockResolvedValue(null);
      await expect(deleteFileService(1)).resolves.toBeNull();
    });

    it("doit supprimer le fichier FS et la db si trouvé", async () => {
      const fake = { id: 2, path: "/tmp/fake.txt" };
      mockedFile.findUnique.mockResolvedValue(fake as any);
      const unlinkSpy = jest.spyOn(fs, "unlink").mockImplementation((p, cb) => cb(null));
      mockedFile.delete.mockResolvedValue({} as any);

      await expect(deleteFileService(2)).resolves.toBe(true);
      expect(unlinkSpy).toHaveBeenCalledWith("/tmp/fake.txt", expect.any(Function));
      expect(mockedFile.delete).toHaveBeenCalledWith({ where: { id: 2 } });
    });

    it("doit rejeter si unlink error non ENOENT", async () => {
      const fake = { id: 3, path: "/tmp/bad.txt" };
      mockedFile.findUnique.mockResolvedValue(fake as any);
      jest.spyOn(fs, "unlink").mockImplementation((p, cb) =>
        cb(Object.assign(new Error("fail"), { code: "EACCES" }))
      );

      await expect(deleteFileService(3)).rejects.toThrow("fail");
    });
  });

  describe("getUserFilesService", () => {
    it("doit retourner la liste des fichiers", async () => {
      const list = [{ id: 1, name: "a", owner_id: 5, size: 10, created: new Date() }];
      mockedFile.findMany.mockResolvedValue(list as any);
      await expect(getUserFilesService(5)).resolves.toEqual(list);
    });
  });

  describe("getFileByIdService", () => {
    it("doit retourner un fichier par id", async () => {
      const rec = { id: 7, name: "b", path: "/x", owner_id: 5, size: 10, created: new Date() };
      mockedFile.findUnique.mockResolvedValue(rec as any);
      await expect(getFileByIdService(7)).resolves.toEqual(rec);
    });
  });

  describe("getFileInfoService", () => {
    it("doit retourner les infos du fichier sans chemin", async () => {
      const info = { name: "c", owner_id: 9, size: 20, created: new Date() };
      mockedFile.findUnique.mockResolvedValue(info as any);
      await expect(getFileInfoService(9)).resolves.toEqual(info);
    });
  });

  describe("accessFileService", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it("doit résoudre si le fichier existe", async () => {
      jest.spyOn(fs, "access").mockImplementation(((path: any, modeOrCb: any, cb?: any) => {
        const callback = typeof modeOrCb === "function" ? modeOrCb : cb;
        callback(null);
      }) as any);
      await expect(accessFileService("/tmp/exist.txt")).resolves.toBeUndefined();
    });

    it("doit rejeter si le fichier n'existe pas", async () => {
      jest.spyOn(fs, "access").mockImplementation(((path: any, modeOrCb: any, cb?: any) => {
        const callback = typeof modeOrCb === "function" ? modeOrCb : cb;
        callback(new Error("nope"));
      }) as any);
      await expect(accessFileService("/tmp/missing.txt")).rejects.toThrow("nope");
    });
  });
});
