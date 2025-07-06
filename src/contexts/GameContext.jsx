import { createContext, useCallback, useEffect, useState } from "react";
import { getQuestions } from "../api/questionsApi";
import { shuffleArray } from "../utils/helpers";
import { saveRanking } from '../utils/rankingStorage';


const GameContext = createContext();

function GameProviderWrapper({children}){
    const [playerName, setPlayerName] = useState("");
    const [score, setScore] = useState(0);
    const [gameQuestions, setGameQuestions] = useState([]);
    const [gamePhase, setGamePhase] = useState('loading');
    const [gameOver, setGameOver] = useState(false);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
    const [allAvailableQuestions, setAllAvailableQuestions] = useState([]);
    const [comodines, setComodines] = useState({
        fiftyfifty: 1,
        roulete: 1,
        changeQuestion: 1,
        hint: 1
    });
    
    const [selectedAnswerText, setSelectedAnswerText] = useState(null); 
    const [isAnswerIncorrect, setIsAnswerIncorrect] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [hiddenAnswersForFiftyFifty, setHiddenAnswersForFiftyFifty] = useState([]);
    const [showHintPopup, setShowHintPopup] = useState(false); 
    const [currentHintText, setCurrentHintText] = useState("");
    const [rouletteSpinning, setRouletteSpinning] = useState(false); 
    const [rouletteResult, setRouletteResult] = useState(null); 
    const [showRouletteOutcome, setShowRouletteOutcome] = useState(false); 
    const [rouletteDegree, setRouletteDegree] = useState(0);

    useEffect(() => {
        const fetchedGameQuestions = async () => {
            try {
                const response = await getQuestions();
                const questionsWithIds = response.map((q, index) => ({
                    ...q,
                    id: q.id || `q-${index}-${q.Dificultad}-${q.Pregunta.substring(0,10).replace(/\s/g, '')}`
                }));
                setAllAvailableQuestions(questionsWithIds);
                setGamePhase("ready");

            } catch (error) {
                console.error('Error fetching all available questions:', error);
                setGamePhase("error");
            }
        };
        fetchedGameQuestions();
    }, []);

    const startNewContest = useCallback(() => {
        if(allAvailableQuestions.length === 0) {
            console.error("No hay preguntas disponibles para seleccionar.");
            setGamePhase("error");
            return;
        }

        const easyQuestions = shuffleArray(allAvailableQuestions.filter(question => question.Dificultad === "Facil"));
        const mediumQuestions = shuffleArray(allAvailableQuestions.filter(question => question.Dificultad === "Media"));
        const hardQuestions = shuffleArray(allAvailableQuestions.filter(question => question.Dificultad === "Dificil"));

        const selectedEasy = easyQuestions.slice(0, 5);
        const selectedMedium = mediumQuestions.slice(0, 6);
        const selectedHard = hardQuestions.slice(0, 5);

        const finalGameQuestions = [...selectedEasy, ...selectedMedium, ...selectedHard];

        if(finalGameQuestions.length !== 15){
            console.warn(`Advertencia: No se pudieron seleccionar exactamente 15 preguntas (5 Fáciles, 5 Medias, 5 Difíciles). Total seleccionado: ${finalGameQuestions.length}`);
        } else {
            console.log("Se seleccionaron 15 preguntas correctamente.");
        }
        setScore(0);
        setComodines({
            fiftyfifty: 1,
            roulete: 1,
            changeQuestion: 1,
            hint: 1
        });
        setGameQuestions(finalGameQuestions);
        setTotalQuestions(finalGameQuestions.length);
        setCurrentQuestion(null);
        setCurrentQuestionNumber(0); 
        setGameOver(false);
        setSelectedAnswerText(null);
        setIsAnswerIncorrect(false);
        setIsAnswerCorrect(false);
        setHiddenAnswersForFiftyFifty([]);
        setGamePhase("playing");
        setShowHintPopup(false);
        setCurrentHintText("");
        setShowRouletteOutcome(false);
        setRouletteResult(null);
        setRouletteSpinning(false);
        setRouletteDegree(0);
    }, [allAvailableQuestions, setScore, setComodines, setGameQuestions, setTotalQuestions, setCurrentQuestion, setCurrentQuestionNumber, setGamePhase, setIsAnswerCorrect]);

    const startNextQuestion = useCallback(() => {
        setSelectedAnswerText(null);
        setIsAnswerIncorrect(false);
        setIsAnswerCorrect(false);
        setShowHintPopup(false);
        setShowRouletteOutcome(false); 
        setRouletteResult(null);
        setRouletteSpinning(false);
        setRouletteDegree(0); 
        setCurrentHintText("");
        setHiddenAnswersForFiftyFifty([]);
        if (currentQuestionNumber < totalQuestions) {
            
            const nextQuestion = gameQuestions[currentQuestionNumber];

            setCurrentQuestion(nextQuestion);
            setCurrentQuestionNumber(prev => prev + 1);
            setGamePhase('playing');
        } else {
            if (playerName && score > 0) { 
                saveRanking(playerName, score);
            }
            setGameOver(true);
            setGamePhase('finished');
            setCurrentQuestion(null);
        }
    });

    const endGame = useCallback(() => {
         if (playerName && score > 0) {
            saveRanking(playerName, score);
         } else {
            console.warn("DEBUG: No se guarda ranking al terminar por error (playerName vacío o score <= 0).");
         }
        setGameOver(true);
        setGamePhase('finished');
        setCurrentQuestion(null);
        setSelectedAnswerText(null);
        setIsAnswerIncorrect(false);
        setIsAnswerCorrect(false);
        setShowHintPopup(false);
        setCurrentHintText(""); 

        console.log("Juego terminado por respuesta incorrecta.");
    }, [setGameOver, setGamePhase, setCurrentQuestion, setSelectedAnswerText, setIsAnswerIncorrect, setIsAnswerCorrect, setShowHintPopup, setCurrentHintText,saveRanking, score, playerName]);

    const handleAnswer = useCallback((answer) => {
        if (!currentQuestion || selectedAnswerText !== null) return; 

        setSelectedAnswerText(answer);

        if (answer === currentQuestion.RespuestaCorrecta) {
            setScore(prevScore => prevScore + 1);
            console.log("Respuesta Correcta! Puntuación:", score + 1);
            setIsAnswerCorrect(true);
            setTimeout(() => {
                startNextQuestion();
            }, 3000); 
        } else {
            setIsAnswerIncorrect(true);
            console.log("Respuesta Incorrecta.");
        }
        
    }, [startNextQuestion, setIsAnswerCorrect, currentQuestion, selectedAnswerText, score]);

    const useChangeQuestionComodin = useCallback(() => {
        if (!currentQuestion || comodines.changeQuestion === 0) {
            console.warn("Comodín 'Cambiar Pregunta' no disponible o no hay pregunta actual.");
            return;
        }
        setComodines(prev => ({
            ...prev,
            changeQuestion: prev.changeQuestion - 1
        }));
        const currentQuestionDifficulty = currentQuestion.Dificultad;
        const currentQuestionId = currentQuestion.id;
        const alreadyPresentedQuestionIds = gameQuestions.slice(0, currentQuestionNumber).map(q => q.id);
        const sameDifficultyQuestions = allAvailableQuestions.filter(q =>
            q.Dificultad === currentQuestionDifficulty
        );

        const notCurrentQuestion = sameDifficultyQuestions.filter(q =>
            q.id !== currentQuestionId
        );

        const availableReplacements = notCurrentQuestion.filter(q =>
            !alreadyPresentedQuestionIds.includes(q.id)
        );

        if (availableReplacements.length === 0) {
            setComodines(prev => ({
                ...prev,
                changeQuestion: prev.changeQuestion + 1
            }));
            console.log("useChangeQuestionComodin: No se encontró reemplazo, comodín reembolsado. currentQuestionNumber NO cambia:", currentQuestionNumber);
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableReplacements.length);
        const newQuestion = availableReplacements[randomIndex];

        setCurrentQuestion(newQuestion); 

        setSelectedAnswerText(null);
        setIsAnswerIncorrect(false);
        setIsAnswerCorrect(false);

    }, [comodines, currentQuestion, allAvailableQuestions, setComodines, setCurrentQuestion, setSelectedAnswerText, setIsAnswerIncorrect, setIsAnswerCorrect, gameQuestions, currentQuestionNumber]);

    const useFiftyFiftyComodin = useCallback(() => {
        if (!currentQuestion || comodines.fiftyfifty === 0) {
            console.warn("Comodín '50/50' no disponible o no hay pregunta actual.");
            return;
        }

        const correctAnswer = currentQuestion.RespuestaCorrecta;
        const allAnswers = [
            currentQuestion.RespuestaA,
            currentQuestion.RespuestaB,
            currentQuestion.RespuestaC,
            currentQuestion.RespuestaD
        ];

        const incorrectAnswers = allAnswers.filter(answer => answer !== correctAnswer);

        if (incorrectAnswers.length < 2) {
            console.warn("No hay suficientes respuestas incorrectas para aplicar 50/50. El comodín no se ha usado.");
            return;
        }

        setComodines(prev => ({
            ...prev,
            fiftyfifty: prev.fiftyfifty - 1
        }));

        const randomIndexToKeep = Math.floor(Math.random() * incorrectAnswers.length);
        const incorrectAnswerToKeep = incorrectAnswers[randomIndexToKeep];
        const answersToHide = incorrectAnswers.filter(answer => answer !== incorrectAnswerToKeep);

        setHiddenAnswersForFiftyFifty(answersToHide);

    }, [currentQuestion, comodines.fiftyfifty, setComodines, setHiddenAnswersForFiftyFifty]);
    
    const useComodinPista = useCallback(() => {
        if (!currentQuestion || comodines.hint === 0) {
            console.warn("Comodín 'Pista' no disponible o no hay pregunta actual.");
            return;
        }
        setComodines(prev => ({
            ...prev,
            hint: prev.hint - 1
        }));
        const pista = currentQuestion.Pista;
        setCurrentHintText(pista);
        setShowHintPopup(true);

        console.log("Comodín 'Pista' usado. Pista:", pista);
    },[currentQuestion, comodines.hint, setComodines, setCurrentHintText, setShowHintPopup]);


    const openRoulettePopup = useCallback(() => {
        if (!currentQuestion || comodines.roulete === 0 || rouletteSpinning) {
            console.warn("Comodín 'Ruleta' no disponible, no hay pregunta actual o ya está girando.");
            return;
        }
        setShowRouletteOutcome(true);
        setRouletteResult(null); 
        setRouletteSpinning(false);
        setRouletteDegree(0);
    }, [currentQuestion, comodines.roulete, rouletteSpinning, setShowRouletteOutcome, setRouletteResult, setRouletteSpinning, setRouletteDegree]);

    const handleRouletteSpin = useCallback(() => {
        if (!currentQuestion || comodines.roulete === 0 || rouletteSpinning) {
            console.warn("Comodín 'Ruleta' no disponible, no hay pregunta actual o ya está girando.");
            return;
        }

        setComodines(prev => ({
            ...prev,
            roulete: prev.roulete - 1
        }));

        setRouletteSpinning(true);

        const segments = [
            { type: 3, label: "¡Elimina 3 respuestas incorrectas!", centerDeg: 0, color: "yellow", weight: 1 },
            { type: 0, label: "La ruleta no elimina ninguna opción.", centerDeg: 30, color: "lightgreen", weight: 1 },
            { type: 2, label: "¡Elimina 2 respuestas incorrectas!", centerDeg: 60, color: "darkgreen", weight: 1 },
            { type: 1, label: "¡Elimina 1 respuesta incorrecta!", centerDeg: 90, color: "teal", weight: 1 },
            { type: 2, label: "¡Elimina 2 respuestas incorrectas!", centerDeg: 120, color: "lightskyblue", weight: 1 },
            { type: 1, label: "¡Elimina 1 respuesta incorrecta!", centerDeg: 150, color: "blue", weight: 1 },
            { type: 0, label: "La ruleta no elimina ninguna opción.", centerDeg: 180, color: "darkviolet", weight: 1 },
            { type: 1, label: "¡Elimina 1 respuesta incorrecta!", centerDeg: 210, color: "purple", weight: 1 },
            { type: 2, label: "¡Elimina 2 respuestas incorrectas!", centerDeg: 240, color: "rosa", weight: 1 },
            { type: 0, label: "La ruleta no elimina ninguna opción.", centerDeg: 270, color: "magenta", weight: 1 },
            { type: 2, label: "¡Elimina 2 respuestas incorrectas!", centerDeg: 300, color: "red", weight: 1 },
            { type: 1, label: "¡Elimina 1 respuesta incorrecta!", centerDeg: 330, color: "orange", weight: 1 },
        ];
        
        const weightedOutcomesSelection = [];
        segments.forEach(segment => {
            for (let i = 0; i < segment.weight; i++) {
                weightedOutcomesSelection.push(segment);
            }
        });

        const randomIndex = Math.floor(Math.random() * weightedOutcomesSelection.length);
        const chosenSegment = weightedOutcomesSelection[randomIndex];

        const targetDegreeForPointer = chosenSegment.centerDeg;

        const numSpins = 5; 
        const pointerOffsetAngle = -15; 
        
        const finalDegreeToLand = (360 * numSpins) - targetDegreeForPointer + pointerOffsetAngle;

        setRouletteDegree(currentDegree => currentDegree + 360); 
        
        requestAnimationFrame(() => {
            setRouletteDegree(finalDegreeToLand);
        });

        setTimeout(() => {
            const correctAnswer = currentQuestion.RespuestaCorrecta;
            const allAnswers = [
                currentQuestion.RespuestaA,
                currentQuestion.RespuestaB,
                currentQuestion.RespuestaC,
                currentQuestion.RespuestaD
            ];
            let incorrectAnswers = allAnswers.filter(answer => answer !== correctAnswer);

            let answersToHide = [];
            if (chosenSegment.type > 0 && incorrectAnswers.length > 0) {
                incorrectAnswers = shuffleArray(incorrectAnswers);
                answersToHide = incorrectAnswers.slice(0, chosenSegment.type);
            }
            
            setHiddenAnswersForFiftyFifty(prev => [...prev, ...answersToHide]);
            setRouletteResult(chosenSegment.label);
            setRouletteSpinning(false);
            
            console.log("Comodín 'Ruleta' usado. Resultado:", chosenSegment.label);
            console.log("Respuestas ocultas por ruleta:", answersToHide);

            setTimeout(() => {
                setShowRouletteOutcome(false); 
            }, 2000); 

        }, 6000);

    }, [currentQuestion, comodines.roulete, rouletteSpinning, setComodines, setHiddenAnswersForFiftyFifty, setRouletteResult, setRouletteSpinning, setRouletteDegree, setShowRouletteOutcome]);

    const contextValue = {
        playerName,
        setPlayerName,
        gameQuestions,
        setGameQuestions,
        totalQuestions,
        setTotalQuestions,
        currentQuestion,
        setCurrentQuestion,
        currentQuestionNumber, 
        setCurrentQuestionNumber,
        setGamePhase,
        gamePhase,
        allAvailableQuestions,
        setAllAvailableQuestions,
        comodines,
        setComodines,
        score,
        setScore,
        startNewContest,
        startNextQuestion,
        handleAnswer,
        gameOver,
        setGameOver,
        selectedAnswerText,
        setSelectedAnswerText,
        isAnswerIncorrect,
        setIsAnswerIncorrect,
        endGame,
        isAnswerCorrect,
        setIsAnswerCorrect,
        useChangeQuestionComodin,
        useFiftyFiftyComodin,
        hiddenAnswersForFiftyFifty,
        setHiddenAnswersForFiftyFifty,
        useComodinPista,
        currentHintText,
        setCurrentHintText,
        showHintPopup,
        setShowHintPopup,
        showRouletteOutcome,
        setShowRouletteOutcome,
        rouletteResult,
        setRouletteResult,
        rouletteSpinning,
        setRouletteSpinning,
        rouletteDegree,
        setRouletteDegree,
        handleRouletteSpin,
        openRoulettePopup,

        
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
}

export { GameContext, GameProviderWrapper };