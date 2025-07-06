import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRankings, deleteRanking } from '../utils/rankingStorage'; 
import './RankingsPage.css';


function RankingsPage() {
    const [rankings, setRankings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadRankings();
    }, []);

    const loadRankings = () => {
        const storedRankings = getRankings();
        setRankings(storedRankings);
    };

    const handleDelete = (playerName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${playerName} del ranking?`)) {
            deleteRanking(playerName); 
            loadRankings();
        }
    };

    return (
        <div className="rankings-container">
            <h1 className="rankings-title">Mejores Puntuaciones</h1>

            {rankings.length === 0 ? (
                <p className="no-rankings-message">Aún no hay puntuaciones.</p>
            ) : (
                <ul className="rankings-list">
                    {rankings.map((ranking, index) => (
                        <li key={ranking.name + index} className="ranking-item">
                            <span className="ranking-position">{index + 1}.</span>
                            <span className="ranking-name">{ranking.name}</span>
                            <span className="ranking-score">{ranking.score} aciertos</span>
                            <button
                                className="delete-ranking-button"
                                onClick={() => handleDelete(ranking.name)}
                                aria-label={`Eliminar a ${ranking.name} del ranking`}
                            >
                                X
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <button className="button back-button" onClick={() => navigate('/')}>
                Volver al Menú Principal
            </button>
        </div>
    );
}

export default RankingsPage;