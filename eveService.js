const axios = require('axios');

module.exports = class EveService {

    constructor() {
        this.eveUrl = 'https://esi.evetech.net/latest/';
        this.ESI = axios.create({
            baseURL: this.eveUrl
        });
    }


    async getUniverseNames(ids) {
        const response = await this.ESI.post(`universe/names/`, ids);
        return response.data;
    }

    async getType(typeId) {
        const response = await this.ESI.get(`/universe/types/${typeId}/`);
        return response.data;
    }

    async getStation(stationId) {
        const response = await this.ESI.get(`/universe/stations/${stationId}/`);
        return response.data;
    }

    async getCorporation(corporationId) {
        const response = await this.ESI.get(`/corporations/${corporationId}/`);
        return response.data;
    }

    async getSystems() {
        const response = await this.ESI.get(`/universe/systems/`);
        return response.data;
    }

    async getSystem(systemId) {
        const response = await this.ESI.get(`/universe/systems/${systemId}/`);
        return response.data;
    }


    async getStar(starId) {
        const response = await this.ESI.get(`/universe/stars/${starId}/`);
        return response.data;
    }

};
