require('dotenv').config();

async function generateQuestions(text, numQuestions = 10) {
  try {
    const currentKey = process.env.OPENROUTER_API_KEY || 'dummy_key_to_prevent_startup_crash';
    if (!process.env.OPENROUTER_API_KEY || currentKey === 'dummy_key_to_prevent_startup_crash') {
      console.log("Utilisation de la réponse IA mockée car OPENROUTER_API_KEY n'est pas configurée.");
      return [
        {
          "question": "Quelle est la capitale de la France ?",
          "options": ["Paris", "Londres", "Berlin", "Madrid"],
          "correct_answer": "Paris"
        },
        {
          "question": "Combien font 2 + 2 ?",
          "options": ["3", "4", "5", "6"],
          "correct_answer": "4"
        },
        {
          "question": "Quelle planète est connue sous le nom de Planète Rouge ?",
          "options": ["Vénus", "Jupiter", "Mars", "Saturne"],
          "correct_answer": "Mars"
        }
      ];
    }

    const prompt = `
    Générez un QCM (Questionnaire à Choix Multiples) basé sur le texte éducatif suivant.
    Générez entre 5 et ${numQuestions} questions en fonction de la longueur du texte.
    Toutes les questions et réponses doivent être impérativement rédigées en langue française.
    Chaque question doit comporter exactement quatre options et exactement une seule bonne réponse.
    
    IMPORTANT: Vous devez répondre EXCLUSIVEMENT avec un objet JSON valide. Ne rajoutez aucun texte avant ou après le JSON.
    Retournez UNIQUEMENT un objet JSON avec une seule clé "questions" contenant un tableau d'objets.
    Exemple de format strict :
    {
      "questions": [
        {
          "question": "Le texte de la question ?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option B"
        }
      ]
    }
    
    Texte Éducatif :
    ${text.substring(0, 30000)}
        `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Quiz Generator",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        response_format: { type: "json_object" },
        messages: [
          { role: "user", content: "Tu es un expert en intelligence artificielle éducative qui génère des questionnaires à choix multiples en français.\n\n" + prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    let rawContent = data.choices[0].message.content;
    
    // Quick regex cleanup to remove markdown formatting if the model responds with ```json ... ```
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(rawContent);
    return result.questions;

  } catch (error) {
    console.error("====== ERREUR DE GÉNÉRATION IA ======");
    console.error(error);
    throw new Error("Échec de la génération des questions avec l'IA.");
  }
}

module.exports = { generateQuestions };
