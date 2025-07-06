import './MainMenuPage.css';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../contexts/GameContext';
import PlayerRegistrationForm from '../components/PlayerRegistrationForm/PlayerRegistrationForm';

function MainMenuPage() {
    const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
    const navigate = useNavigate();
    const {setPlayerName, startNewContest} = useContext(GameContext); 

    const handleRegisterPlayer = (name) => {
        setPlayerName(name);
        setShowRegistrationPopup(false);
        startNewContest();
        navigate('/contest');
    };

    return (
        <div className="main-menu-container">
            <h1 className='titleMainMenu'>¡Bienvenido al ConcursTiTo!</h1>

            {!showRegistrationPopup && (
                <div className="divbuttonsMainMenu">
                    <button onClick={() => setShowRegistrationPopup(true)} className="menu-button start-button buttonMenu">
                        Iniciar Nuevo Concurso
                    </button>
                    <button onClick={() => navigate('/rankings')} className="menu-button rankings-button buttonMenu">
                        Ver Rankings
                    </button>
                </div>
            )}

            {showRegistrationPopup && (
                <div className="popup-overlayMainMenu">
                    <PlayerRegistrationForm
                        onRegister={handleRegisterPlayer}
                        onCancel={() => setShowRegistrationPopup(false)}
                    />
                </div>
            )}
        </div>
    );
}

export default MainMenuPage;