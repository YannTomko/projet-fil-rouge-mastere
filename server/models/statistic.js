class Statistic {


    constructor(id, file_id, nb_access_last_24h, nb_access_last_week, nb_access_total, last_access_date_time) {
        this.file_id = file_id;
        this.nb_access_last_24h = nb_access_last_24h;
        this.nb_access_last_week = nb_access_last_week;
        this.nb_access_total = nb_access_total;
        this.last_access_date_time = last_access_date_time;
    }
}

module.exports = Statistic;