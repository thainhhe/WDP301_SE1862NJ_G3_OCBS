const PROVINCES_API_URL = 'https://provinces.open-api.vn/api';

export const provinceService = {
    // Get all provinces
    async getProvinces() {
        const response = await fetch(`${PROVINCES_API_URL}/p`);
        if (!response.ok) {
            throw new Error('Failed to fetch provinces');
        }
        return response.json();
    },

    // Get districts by province code
    async getDistricts(provinceCode) {
        const response = await fetch(`${PROVINCES_API_URL}/p/${provinceCode}?depth=2`);
        if (!response.ok) {
            throw new Error('Failed to fetch districts');
        }
        return response.json();
    }
};

export default provinceService;
