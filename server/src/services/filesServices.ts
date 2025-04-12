import fs from "fs";
import path from "path";
import { prisma } from "../prisma";

export const uploadFileService = async (file: Express.Multer.File, owner: string, size: string) => {
  return await prisma.files.create({
    data: {
      name: file.originalname,
      path: file.path,
      owner,
      size: parseInt(size, 10),
    },
  });
};

export const deleteFileService = async (id: number) => {
  const file = await prisma.files.findUnique({ where: { id } });
  if (!file) return null;

  await prisma.statistics.deleteMany({ where: { file_id: id } });

  return new Promise((resolve, reject) => {
    fs.unlink(file.path, async (err) => {
      if (err && err.code !== "ENOENT") return reject(err);
      await prisma.files.delete({ where: { id } });
      resolve(true);
    });
  });
};

export const getUserFilesService = async () => {
  return await prisma.files.findMany({
    select: { id: true, name: true, owner: true, size: true, created: true },
  });
};

export const getFileByIdService = async (id: number) => {
  return await prisma.files.findUnique({ where: { id } });
};

export const getFileInfoService = async (id: number) => {
  return await prisma.files.findUnique({
    where: { id },
    select: { name: true, owner: true, size: true, created: true },
  });
};

export const accessFileService = (pathToFile: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.access(pathToFile, fs.constants.F_OK, (err) => {
      err ? reject(err) : resolve();
    });
  });
};
