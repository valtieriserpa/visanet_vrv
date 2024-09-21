// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount } = req.body;

    console.log("Valor recebido em centavos do frontend:", amount);

    // Verificar se o valor está presente e é um número válido
    if (!amount || isNaN(amount)) {
        console.error("Erro: Valor inválido ou ausente.");
        return res.status(400).json({ error: 'Valor inválido ou ausente.' });
    }

    try {
        // Criar um PaymentIntent com o valor já convertido em centavos pelo frontend
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  // O valor já está em centavos, não multiplicar por 100
            currency: 'brl',
        });

        console.log("PaymentIntent criado com sucesso:", paymentIntent);

        // Enviar o clientSecret ao frontend
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);
        res.status(500).json({ error: error.message });
    }
};
