const RANKINGS_STORAGE_KEY = 'concurstito_rankings';
/**
 * @returns {Array<{name: string, score: number}>} 
 */
export const getRankings = () => {
    try {
        const rankingsJson = localStorage.getItem(RANKINGS_STORAGE_KEY);
        console.log("getRankings: Valor recuperado de Local Storage:", rankingsJson);
        let rankings = rankingsJson ? JSON.parse(rankingsJson) : [];
        rankings = rankings.map(r => ({ ...r, score: Number(r.score) }));
        return rankings.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error("Error al recuperar rankings de Local Storage:", error);
        return [];
    }
};

export const saveRanking = (playerName, score) => {
    console.log("saveRanking: Función llamada con playerName:", playerName, "score:", score);
    if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
        console.warn("Nombre de jugador inválido, no se puede guardar el ranking.");
        return;
    }
    if (typeof score !== 'number' || isNaN(score)) {
        console.warn("Puntuación inválida, no se puede guardar el ranking.");
        return;
    }

    const currentRankings = getRankings();
    console.log("saveRanking: Rankings actuales antes de añadir/actualizar:", currentRankings);

    const existingPlayerIndex = currentRankings.findIndex(r => r.name.toLowerCase() === playerName.toLowerCase());

    if (existingPlayerIndex !== -1) {
        if (score > currentRankings[existingPlayerIndex].score) {
            currentRankings[existingPlayerIndex].score = score;
            console.log(`Puntuación más alta actualizada para ${playerName}: ${score}`);
        }
    } else {
        currentRankings.push({ name: playerName, score: score });
    }

    try {
        localStorage.setItem(RANKINGS_STORAGE_KEY, JSON.stringify(currentRankings));
        console.log("saveRanking: Datos guardados en Local Storage:", JSON.stringify(currentRankings));
    } catch (error) {
        console.error("Error al guardar ranking en Local Storage:", error);
    }
};

/**
 * @param {string} playerName
 */

export const deleteRanking = (playerName) => {
    if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
        console.warn("Nombre de jugador inválido, no se puede eliminar el ranking.");
        return;
    }

    const currentRankings = getRankings();
    const filteredRankings = currentRankings.filter(r => r.name.toLowerCase() !== playerName.toLowerCase());

    try {
        localStorage.setItem(RANKINGS_STORAGE_KEY, JSON.stringify(filteredRankings));
        console.log(`Ranking eliminado para ${playerName}.`);
    } catch (error) {
        console.error("Error al eliminar ranking de Local Storage:", error);
    }
};
export const clearAllRankings = () => {
    try {
        localStorage.removeItem(RANKINGS_STORAGE_KEY);
        console.log("Todos los rankings eliminados de Local Storage.");
    } catch (error) {
        console.error("Error al limpiar todos los rankings de Local Storage:", error);
    }
};