const steps = [
  {
    number: 1,
    icon: '🔗',
    title: 'Connect Your Wallet',
    description: 'Connect your MetaMask wallet to the BSC Testnet. Make sure you have some BNB for gas fees and USDT for ticket purchases. It\'s quick and secure!'
  },
  {
    number: 2,
    icon: '✅',
    title: 'Approve USDT',
    description: 'Approve USDT spending for the lottery contract. This is a one-time approval that allows you to purchase multiple tickets without repeated approvals.'
  },
  {
    number: 3,
    icon: '🎫',
    title: 'Buy Tickets',
    description: 'Choose your round and select how many tickets to buy (1-10 per transaction). Each ticket gives you a chance to win amazing prizes in the draw.'
  },
  {
    number: 4,
    icon: '🎰',
    title: 'Wait for Draw',
    description: 'Once all tickets are sold, the smart contract automatically conducts a fair and transparent draw to select winners. Everything is verifiable on-chain.'
  },
  {
    number: 5,
    icon: '🏆',
    title: 'Claim Prizes',
    description: 'If you win, claim your prize directly from the smart contract. Winners are automatically eligible for instant payouts - no waiting, no hassle.'
  },
];

const HowItWorks = () => (
  <section className="py-16 bg-gradient-to-b from-gray-800 to-gray-900 text-white">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-gray-900 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-yellow-400/20 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-gray-900 font-bold text-xl mb-4">{step.number}</div>
            <div className="text-4xl mb-2">{step.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-300 text-base">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks; 