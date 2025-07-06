import styles from './PlayerRegistrationForm.module.css'; 
import React, { useState } from 'react';

function PlayerRegistrationForm({ onRegister, onCancel }) {
    const [playerName, setPlayerName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (playerName.trim()) {
            onRegister(playerName.trim());
        } else {
            alert("Por favor, introduce el nombre del concursante.");
        }
    };

    return (
        <div className={styles.registrationformcontainer}>
            <h2>Concursante</h2>
            <form onSubmit={handleSubmit} className={styles.playerform}>
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Nombre del Concursante"
                    maxLength="30"
                    required
                    className={styles.playernameinput}
                />
                <div className={styles.formbuttons}>
                    <button type="submit" className={`${styles.submitButton} ${styles.buttonMenu}`}>
                        Iniciar Concurso
                    </button>
                    <button type="button" onClick={onCancel} className={`${styles.cancelButton} ${styles.buttonMenu}`}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PlayerRegistrationForm;