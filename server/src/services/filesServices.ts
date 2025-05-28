import fs from "fs";
import path from "path";
import { prisma } from "../prisma";

export const uploadFileService = async (file: Express.Multer.File, owner: number, size: string) => {
  return await prisma.file.create({
    data: {
      name: file.originalname,
      path: file.path,
      owner_id: owner,
      size: parseInt(size, 10),
    },
  });
};

export const deleteFileService = async (id: number) => {
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return null;

  return new Promise((resolve, reject) => {
    fs.unlink(file.path, async (err) => {
      if (err && err.code !== "ENOENT") return reject(err);
      await prisma.file.delete({ where: { id } });
      resolve(true);
    });
  });
};

export const getUserFilesService = async (userId: number) => {
  return await prisma.file.findMany({
    where: { owner_id: userId },
    select: { id: true, name: true, owner_id: true, size: true, created: true },
  });
};

export const getFileByIdService = async (id: number) => {
  return await prisma.file.findUnique({ where: { id } });
};

export const getFileInfoService = async (id: number) => {
  return await prisma.file.findUnique({
    where: { id },
    select: { name: true, owner_id: true, size: true, created: true },
  });
};

export const accessFileService = (pathToFile: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.access(pathToFile, fs.constants.F_OK, (err) => {
      err ? reject(err) : resolve();
    });
  });
};
