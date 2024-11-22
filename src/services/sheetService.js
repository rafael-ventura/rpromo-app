import axios from "axios";

export default {
    async carregarUsuarios() {
        const API_KEY = process.env.VUE_APP_API_KEY;
        const sheetId = process.env.VUE_APP_SHEET_ID;
        const sheetRange = "A:Z";
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${API_KEY}`;

        try {
            const response = await axios.get(url);
            const rows = response.data.values;

            if (!rows || rows.length === 0) {
                console.error("Nenhum dado encontrado na planilha.");
                return [];
            }

            const headers = rows[0];
            return rows.slice(1)
                .map((row) => {
                    const user = {};
                    headers.forEach((header, index) => {
                        user[header] = row[index] || ""; // Preenche valores ausentes com string vazia
                    });
                    return user;
                })
                .filter(user => user['CPF'] || user['RG']); // Filtra usuários com CPF ou RG
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            return [];
        }
    },
};
