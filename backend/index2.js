const express = require('express');
const bodyParser = require('body-parser');  
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(cors());

app.post('/api', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('Text is required');
    }

    // const genAI = new GoogleGenerativeAI('AIzaSyABgpNb8GngSKqiTNqpQ0a7j-C23o9N99E');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    async function run() {
        const prompt = `${text} + according to Hyderabad Metro Rail.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const generatedText = await response.text();
            res.send(generatedText);
        } catch (error) {
            console.error('Error generating content:', error);
            res.status(500).send('Error generating content');
        }
    }

    run();
});

app.post('/api/pro', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('Text is required');
    }

    // const genAI = new GoogleGenerativeAI('AIzaSyCUkLNSwx-145fQ0S5BDou2AwJYjvPRW5g');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    async function run() {
        const prompt = `${text} + according to Hyderabad Metro Rail.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const generatedText = await response.text();
            res.send(generatedText);
        } catch (error) {
            console.error('Error generating content:', error);
            res.status(500).send('Error generating content');
        }
    }

    run();
}
);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
