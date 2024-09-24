// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount, currency } = req.body;

    console.log("Valor recebido em centavos do frontend:", amount);
    console.log("Moeda recebida:", currency);

    // Verificar se o valor e a moeda estão presentes e são válidos
    if (!amount || isNaN(amount) || amount <= 0 || !currency) {
        console.error("Erro: Valor ou moeda inválido ou ausente.");
        return res.status(400).json({ error: 'Valor ou moeda inválido ou ausente.' });
    }

    try {
        // Criar um PaymentIntent com o valor já convertido em centavos e a moeda recebida
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  // O valor já está em centavos, não multiplicar por 100
            currency: currency.toLowerCase(),  // Usar a moeda enviada pelo frontend
        });

        console.log("PaymentIntent criado com sucesso:", paymentIntent);

        // Enviar o clientSecret ao frontend
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);
        res.status(500).json({ error: error.message });
    }
};
