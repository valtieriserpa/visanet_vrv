// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount, currency } = req.body;

    // Log para verificar os valores recebidos
    console.log("Valor recebido em centavos do frontend:", amount, "Moeda:", currency);

    // Verificar se o valor e a moeda são válidos
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error("Erro: Valor inválido ou ausente.");
        return res.status(400).json({ error: 'Valor inválido ou ausente.' });
    }

    if (!currency || !['brl', 'usd', 'eur'].includes(currency)) {
        console.error("Erro: Moeda inválida ou ausente.");
        return res.status(400).json({ error: 'Moeda inválida ou ausente.' });
    }

    try {
        // Criar um PaymentIntent com o valor em centavos e a moeda selecionada
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  // O valor já está em centavos
            currency: currency,  // Define a moeda escolhida (BRL, USD ou EUR)
        });

        console.log("PaymentIntent criado com sucesso:", paymentIntent);

        // Enviar o clientSecret ao frontend para finalizar o pagamento
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);
        res.status(500).json({ error: error.message });
    }
};
