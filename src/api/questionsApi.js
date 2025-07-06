import Papa from 'papaparse';

const CSV_FILE_PATH = "/Preguntas.csv";

export const loadQuestionFromCSV = async () => {
    return new Promise((resolve, reject) => {
        fetch(CSV_FILE_PATH).then(response => {
            if (!response.ok) {
                throw new Error(`Error al cargar el CSV ${resolve.status}`);
            }
            return response.text();
        }).then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const formattedQuestions = results.data.map((row) => ({
                        id: row.id,
                        Pregunta: row.Pregunta,
                        RespuestaA: row.RespuestaA,
                        RespuestaB: row.RespuestaB,
                        RespuestaC: row.RespuestaC,
                        RespuestaD: row.RespuestaD,
                        RespuestaCorrecta: row.RespuestaCorrecta,
                        Pista: row.Pista,
                        Dificultad: row.Dificultad
                    }))
                    resolve(formattedQuestions);
                },
                error: function (error) {
                    reject(error);
                }
            })
        }). catch (e =>{
            reject(e);
        })

        }
    
    )
}

export const getQuestions = async () => {
    try {
        const questions = await loadQuestionFromCSV();
        return questions;
    } catch (e) {
        console.log(e);
        throw e
    }
}