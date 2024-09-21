// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Log para verificar se o corpo da requisição está correto
    console.log("Requisição recebida:", req.body);

    const { amount } = req.body;

    // Verificar se o valor está presente e é um número
    if (!amount || isNaN(amount)) {
        console.error("Erro: Valor inválido ou ausente.");
        return res.status(400).json({ error: 'Valor inválido ou ausente.' });
    }

    // Garantir que o valor está em centavos
    const amountInCents = Math.round(amount * 100);  // Conversão de R$ para centavos

    console.log("Valor em centavos:", amountInCents);

    try {
        // Criar um PaymentIntent com o valor em centavos
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'brl',
        });

        // Log para confirmar que o PaymentIntent foi criado
        console.log("PaymentIntent criado com sucesso:", paymentIntent);

        // Enviar o clientSecret ao frontend
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        // Log para capturar qualquer erro ao criar o PaymentIntent
        console.error("Erro ao criar PaymentIntent:", error);

        // Retornar o erro ao frontend
        res.status(500).json({ error: error.message });
    }
};
