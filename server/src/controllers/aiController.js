const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'fake-key', // Fallback for dev
});

exports.extractScreenshot = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: req.file.mimetype,
                            data: imageBase64
                        }
                    },
                    {
                        type: "text",
                        text: "Analise este screenshot do relatório de Live da Shopee e extraia os dados em JSON: totalOrders, totalRevenue, totalViews, likes, shares, conversionRate. Retorne APENAS o JSON."
                    }
                ]
            }]
        });

        // Simple parsing logic (robust version uses regex)
        const content = message.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse AI response", raw: content };

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process image' });
    }
};
