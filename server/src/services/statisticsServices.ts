import { prisma } from "../prisma";
import { Statistic } from "../models/statistic";

export const getStatisticsService = async (fileId: number): Promise<Statistic | null> => {
  const [stats, lastAccessRow, nb24hCount, nbWeekCount, nbTotalCount] = await Promise.all([
    prisma.statistics.findMany({
      where: { file_id: fileId },
    }),
    prisma.statistics.aggregate({
      _max: {
        last_access_date_time: true,
      },
      where: { file_id: fileId },
    }),
    prisma.statistics.count({
      where: {
        file_id: fileId,
        last_access_date_time: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.statistics.count({
      where: {
        file_id: fileId,
        last_access_date_time: {
          gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.statistics.count({
      where: { file_id: fileId },
    }),
  ]);

  if (stats.length === 0) {
    return null;
  }

  return {
    file_id: fileId,
    nb_access_last_24h: nb24hCount,
    nb_access_last_week: nbWeekCount,
    nb_access_total: nbTotalCount,
    last_access_date_time: lastAccessRow._max.last_access_date_time ?? null,
  };
};

export const addStatisticService = async (fileId: number): Promise<void> => {
  await prisma.statistics.create({
    data: {
      file_id: fileId,
      last_access_date_time: new Date(),
    },
  });
};
