const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post('/response', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('Text is required');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    async function run() {
        const prompt = `Please provide detailed information about the Hyderabad Metro Rail in response to the following query: "${text}". The response should include relevant facts, schedules, routes, and any other pertinent information about the Hyderabad Metro Rail. If possible in 100-200 words`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let generatedText = await response.text();
            
            generatedText = generatedText.replace(/\*/g, '');

            res.send(generatedText);
        } catch (error) {
            console.error('Error generating content:', error);
            res.status(500).send('Error generating content');
        }
    }

    run();
});

module.exports = router;
