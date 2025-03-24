export interface Statistic {
    file_id: number;
    nb_access_last_24h: number;
    nb_access_last_week: number;
    nb_access_total: number;
    last_access_date_time: Date | null;
}
