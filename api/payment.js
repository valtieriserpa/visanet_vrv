// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta de produção
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount, currency, cardholderName, email, product } = req.body;

    console.log("Valor recebido:", amount);
    console.log("Moeda recebida:", currency);
    console.log("Nome do titular:", cardholderName);
    console.log("E-mail:", email);
    console.log("Produto:", product);

    if (!amount || isNaN(amount) || amount <= 0 || !currency) {
        return res.status(400).json({ error: 'Valor ou moeda inválidos.' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  // Valor em centavos
            currency: currency,
            receipt_email: email,
            description: `Pagamento de ${product} para ${cardholderName}`,
            metadata: { 
                customer_name: cardholderName, 
                product: product 
            }
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);
        res.status(500).json({ error: error.message });
    }
};
