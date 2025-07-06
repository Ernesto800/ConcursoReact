import './ContestScreen.css'
import React, { useContext, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext';
import { useNavigate } from 'react-router-dom';

function ContestScreen() {
    const { 
        playerName,
        score,
        gamePhase, 
        currentQuestion, 
        currentQuestionNumber, 
        totalQuestions,
        startNextQuestion,
        handleAnswer,
        selectedAnswerText,
        isAnswerIncorrect,
        endGame,
        isAnswerCorrect,
        comodines,
        useChangeQuestionComodin,
        useFiftyFiftyComodin,
        hiddenAnswersForFiftyFifty,
        useComodinPista,
        showHintPopup,  
        setShowHintPopup,
        currentHintText,
        openRoulettePopup, 
        handleRouletteSpin,
        rouletteSpinning,
        rouletteDegree,
        rouletteResult, 
        setRouletteResult,
        showRouletteOutcome,
        setShowRouletteOutcome,
        showReviveComodinPopup,  
    } = useContext(GameContext);

     const answerOptions = currentQuestion ? [
        currentQuestion.RespuestaA,
        currentQuestion.RespuestaB,
        currentQuestion.RespuestaC,
        currentQuestion.RespuestaD
    ] : [];

    const navigate = useNavigate();

     const scoreDisplayRef = useRef(null); 

     useEffect(() => {
        if (gamePhase === 'finished' && scoreDisplayRef.current) {
            const finalScore = score;
            let currentCount = 0;
            const duration = 1500;
            const stepTime = 10;

            const timer = setInterval(() => {
                currentCount += (finalScore / (duration / stepTime));
                if (currentCount >= finalScore) {
                    currentCount = finalScore;
                    clearInterval(timer);
                }
                scoreDisplayRef.current.textContent = Math.floor(currentCount);
            }, stepTime);

            return () => clearInterval(timer);
        }
    }, [gamePhase, score]);

    useEffect(() => {
    if (gamePhase === 'playing' && !currentQuestion && totalQuestions > 0) {
        startNextQuestion(); 
    }
    }, [gamePhase, currentQuestion, totalQuestions, startNextQuestion]);

    const getButtonClass = useCallback((optionText) => {
        let className = 'option-button';

        if (selectedAnswerText !== null) {
            if (optionText === currentQuestion?.RespuestaCorrecta) {
                className += ' correct-answer-revealed';
            }
            else if (optionText === selectedAnswerText && !isAnswerCorrect) {
                className += ' incorrect-answer';
            }
        }
        return className;
    }, [selectedAnswerText, currentQuestion, isAnswerCorrect]);

    

    if (gamePhase === 'loading') {
        return (
            <div className='container'>
                <h2>Cargando preguntas...</h2>
                <p>Por favor, espera un momento.</p>
            </div>
        );
    }

    if (gamePhase === 'error') {
        return (
            <div className='container error-container'>
                <h2>¡Error en el juego!</h2>
                <p>No se pudieron cargar o preparar las preguntas correctamente.</p>
            </div>
        );
    }

    if (gamePhase === 'ready') {
        return (
            <div className='container'>
                <h2>¡Juego Listo!</h2>
                <p>Esperando a que comience la primera pregunta.</p>
            </div>
        );
    }

    if (gamePhase === "playing") {
        if (!currentQuestion) {
            return (
                <div className='container'>
                    <h2>Preparando pregunta...</h2>
                </div>
            );
        }

        const buttonsDisabled = selectedAnswerText !== null; 
        

        return (
            
            <div className='container'>
                <div className='comodines-container'>
                    <button className='comodin-button' onClick={useFiftyFiftyComodin} disabled={comodines.fiftyfifty === 0}>
        <img src='/FiftyFifty.png' alt="Comodín 50/50" className='comodin-icon fifty-fifty-icon'></img>
    </button>
                    <button className='comodin-button' onClick={openRoulettePopup} disabled={comodines.roulete === 0 || showRouletteOutcome}>
                        <img src='/Roulette.png' alt="Comodín Ruleta" className='comodin-icon roulette-icon'></img>
                    </button>
                    <button className='comodin-button' onClick={useChangeQuestionComodin} disabled={comodines.changeQuestion === 0}>
                        <img src='/ChangeQuestion.png' alt="Comodín Cambio de Pregunta" className='comodin-icon change-question-icon'></img>
                    </button>
                    <button 
                        className='comodin-button' onClick={useComodinPista} disabled={comodines.hint === 0 || showHintPopup}>
                        <img src='/Pista.png' alt="Comodín Pista" className='comodin-icon pista-icon'></img>
                    </button>
                </div>
                <h1 className='title'>Pregunta { currentQuestionNumber - 1} de {totalQuestions - 1}</h1>
                <h3 className='questionText'>{currentQuestion.Pregunta}</h3> 
                <div className='optionsContainer'>
                    {answerOptions.map((optionText, index) => {
                        const isHidden = hiddenAnswersForFiftyFifty.includes(optionText);
                        return (
                            <button 
                                key={index}
                                className={`${getButtonClass(optionText)} ${isHidden ? 'hidden-50-50' : ''}`} 
                                onClick={() => handleAnswer(optionText)}
                                disabled={buttonsDisabled || isHidden} 
                            >
                                {`${String.fromCharCode(65 + index)}. ${optionText}`}
                            </button>
                        );
                    })}
                </div>
                {isAnswerIncorrect && (
                    <button className='button continue-button' onClick={endGame}>
                        Continuar
                    </button>
                )}
                {showHintPopup && (
                    <div className="hint-popup-overlay">
                        <div className="hint-popup">
                            <h3>Pista:</h3>
                            <p className='text-hint'>{currentHintText}</p>
                            <button 
                                className="close-popup-button" 
                                onClick={() => setShowHintPopup(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
                 {showRouletteOutcome && (
                    <div className="hint-popup-overlay">
                        <div className="hint-popup roulette-popup">
                            {!rouletteSpinning && !rouletteResult && (
                                <>
                                    <h3>Ruleta de la Suerte:</h3>
                                    <div className="roulette-container-display">
                                        <img 
                                            src='/RouletteSpin.png'
                                            alt="Ruleta" 
                                            className='comodin-icon roulette-icon' 
                                            style={{ transform: `rotate(${rouletteDegree}deg)` }}
                                        />
                                        <div className="roulette-pointer"></div>
                                    </div>
                                    <div className="roulette-buttons">
                                        <button 
                                            className="button spin-roulette-button" 
                                            onClick={handleRouletteSpin} 
                                            disabled={rouletteSpinning}
                                        >
                                            Girar
                                        </button>
                                        <button 
                                            className="button close-popup-button" 
                                            onClick={() => {
                                                setShowRouletteOutcome(false);
                                                setRouletteResult(null);
                                            }}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </>
                            )}
                            {rouletteSpinning && (
                                <>
                                    <h3>¡Girando!</h3>
                                    <div className="roulette-container-display">
                                        <img 
                                            src='/RouletteSpin.png' 
                                            alt="Ruleta" 
                                            className='comodin-icon roulette-icon' 
                                            style={{ transform: `rotate(${rouletteDegree}deg)`, transition: 'transform 3s ease-out' }} // Animación
                                        />
                                        <div className="roulette-pointer"></div>
                                    </div>
                                </>
                            )}
                            {!rouletteSpinning && rouletteResult && (
                                <>
                                    <h3>Resultado de la Ruleta:</h3>
                                    <p>{rouletteResult}</p>
                                    <button 
                                        className="button close-popup-button" 
                                        onClick={() => {
                                            setShowRouletteOutcome(false);
                                            setRouletteResult(null);
                                        }}
                                    >
                                        Entendido
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <div className="contest-screen-container">
                    {showReviveComodinPopup && <ReviveComodinPopup />}
                </div>
            </div>
        );
    }

    
    
   if (gamePhase === 'finished') {
        const percentageScore = (score / totalQuestions) * 100;
        let message = "¡Buen intento!";
        let messageClass = "game-over-message-neutral";

        if (percentageScore >= 80) {
            message = "¡Felicidades, eres un experto!";
            messageClass = "game-over-message-excellent";
        } else if (percentageScore >= 50) {
            message = "¡Muy bien, sigue practicando!";
            messageClass = "game-over-message-good";
        }

        return (
            <div className='game-over-container'>
                <h2 className='game-over-title'>¡Juego Terminado!</h2>
                <p className='game-over-player'>
                    <span className="game-over-label">Jugador:</span> <span className="game-over-value">{playerName || 'Invitado'}</span>
                </p>
                <p className='game-over-score'>
                    <p>Tu puntuación final es: {useContext(GameContext).score}</p>
                </p>
                <p className={`game-over-message ${messageClass}`}>{message}</p>
                
                <div className="game-over-buttons">
                    <button className='button game-over-button main-menu-button' onClick={() => navigate('/')}>
                        Volver al Menú Principal
                    </button>
                </div>

    
                {percentageScore >= 80 && (
                    <>
                        <div className="confetti-piece confetti-1"></div>
                        <div className="confetti-piece confetti-2"></div>
                        <div className="confetti-piece confetti-3"></div>
                        <div className="confetti-piece confetti-4"></div>
                        <div className="confetti-piece confetti-5"></div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className='container'>
            <h2>Esperando el estado inicial del juego...</h2>
        </div>
    );
}

export default ContestScreen;