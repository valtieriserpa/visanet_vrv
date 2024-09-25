// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Inicializar o Stripe com a chave secreta
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Receber os dados do frontend
    const { amount, currency, cardholderName, email, product } = req.body;

    // Exibir os dados recebidos no console para fins de depuração
    console.log("Valor recebido em centavos do frontend:", amount);
    console.log("Moeda recebida:", currency);
    console.log("Nome do titular:", cardholderName);
    console.log("E-mail do usuário:", email);
    console.log("Produto:", product);

    // Verificar se o valor e a moeda estão presentes e são válidos
    if (!amount || isNaN(amount) || amount <= 0 || !currency) {
        console.error("Erro: Valor ou moeda inválido ou ausente.");
        return res.status(400).json({ error: 'Valor ou moeda inválido ou ausente.' });
    }

    try {
        // Criar um PaymentIntent com o valor, moeda, e detalhes do cliente
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,  // O valor já está em centavos
            currency: currency.toLowerCase(),  // Usar a moeda enviada pelo frontend
            receipt_email: email,  // Enviar o recibo para o e-mail do cliente
            description: `Pagamento de ${product} para ${cardholderName}`,  // Descrição do pagamento
            metadata: {
                customer_name: cardholderName,
                product: product
            },
        });

        console.log("PaymentIntent criado com sucesso:", paymentIntent);

        // Enviar o clientSecret ao frontend para completar o pagamento
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erro ao criar PaymentIntent:", error);
        res.status(500).json({ error: error.message });
    }
};
