// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta de produção
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount, currency, cardholderName, email, cardType, product } = req.body;

    console.log("Valor recebido:", amount);
    console.log("Moeda recebida:", currency);
    console.log("Nome do titular:", cardholderName);
    console.log("Tipo de Cartão:", cardType);  // Exibir se o cliente informou "credit" ou "debit"
    console.log("E-mail:", email);

    if (!amount || isNaN(amount) || amount <= 0 || !currency) {
        return res.status(400).json({ error: 'Valor ou moeda inválidos.' });
    }

    try {
        // Criar o PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            receipt_email: email,
            description: `Pagamento de ${product} para ${cardholderName}`,
            metadata: {
                customer_name: cardholderName,
                product: product,
                card_type: cardType  // Armazenar o tipo de cartão informado pelo cliente
            }
        });

        // Verificar se o cliente informou débito ou crédito manualmente
        if (cardType === 'debit') {
            console.log("Cartão de débito informado pelo cliente.");
        } else if (cardType === 'credit') {
            console.log("Cartão de crédito informado pelo cliente.");
        }

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);
        res.status(500).json({ error: error.message });
    }
};
