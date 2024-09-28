// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount, currency, email } = req.body;

    console.log("Valor recebido em centavos do frontend:", amount, "Moeda:", currency, "E-mail:", email);

    // Verificar se o valor, moeda e e-mail são válidos
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error("Erro: Valor inválido ou ausente.");
        return res.status(400).json({ error: 'Valor inválido ou ausente.' });
    }

    if (!currency || !['brl', 'usd', 'eur'].includes(currency)) {
        console.error("Erro: Moeda inválida ou ausente.");
        return res.status(400).json({ error: 'Moeda inválida ou ausente.' });
    }

    if (!email) {
        console.error("Erro: E-mail inválido ou ausente.");
        return res.status(400).json({ error: 'E-mail inválido ou ausente.' });
    }

    try {
        // Criar um PaymentIntent com o valor em centavos, moeda e o e-mail
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  // O valor já está em centavos
            currency: currency,  // Define a moeda escolhida (BRL, USD ou EUR)
            receipt_email: email,  // Associar o e-mail ao pagamento
            description: 'Pagamento de Consultoria Técnica'
        });

        console.log("PaymentIntent criado com sucesso:", paymentIntent);

        // Enviar o clientSecret ao frontend para finalizar o pagamento
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);
        res.status(500).json({ error: error.message });
    }
};
