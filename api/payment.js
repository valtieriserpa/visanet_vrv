// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta de produção
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    const { amount, currency, cardholderName, email, cardType, product } = req.body;

    // Validar se todos os campos necessários estão presentes
    if (!amount || !currency || !cardholderName || !email || !product) {
        return res.status(400).json({ error: 'Faltam dados obrigatórios no corpo da requisição.' });
    }

    const supportedCurrencies = ['usd', 'eur', 'brl'];

    // Validar o valor e a moeda
    if (isNaN(amount) || amount <= 0 || !supportedCurrencies.includes(currency.toLowerCase())) {
        return res.status(400).json({ error: 'Valor ou moeda inválidos.' });
    }

    try {
        // Criar o PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Certifique-se de enviar um valor em centavos (inteiro)
            currency: currency,
            receipt_email: email,
            description: `Pagamento de ${product} para ${cardholderName}`,
            metadata: {
                customer_name: cardholderName,
                product: product,
                card_type: cardType  // Armazenar o tipo de cartão informado pelo cliente
            }
        });

        // Log do PaymentIntent para verificar a criação
        console.log('PaymentIntent criado com sucesso:', paymentIntent.id);

        // Enviar o clientSecret ao frontend
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);

        // Tratamento de erros do Stripe
        if (error.type === 'StripeCardError') {
            res.status(400).json({ error: error.message });
        } else if (error.type === 'StripeInvalidRequestError') {
            res.status(400).json({ error: 'Requisição inválida. Verifique os parâmetros enviados.' });
        } else {
            res.status(500).json({ error: 'Erro no servidor. Tente novamente mais tarde.' });
        }
    }
};
