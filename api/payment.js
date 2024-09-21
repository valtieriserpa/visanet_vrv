// Carrega variáveis de ambiente do .env
require('dotenv').config();

// Inicializa o Stripe com a chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount } = req.body;

    try {
        // Cria um PaymentIntent no Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  // Valor em centavos
            currency: 'brl', // Moeda em Reais
        });

        // Envia o client_secret para o frontend
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
