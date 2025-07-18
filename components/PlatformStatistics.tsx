// import { motion, Variants } from 'framer-motion';
// import Image from 'next/image';
// import '../styles/fluid-animation.css';

// const stats = [
//   // {
//   //   iconImage: '12.png',
//   //   value: '0',
//   //   label: 'Tickets Sold',
//   // },
//   // {
//   //   iconImage: '11.png',
//   //   value: '0',
//   //   label: 'Happy Winners',
//   // },
//   {
//     iconImage: '10.png',
//     value: '0',
//     label: 'TRDO Distributed',
//   },
//   {
//     iconImage: '20.png',
//     value: '0',
//     label: 'Rounds Completed',
//   },
// ];

// const PlatformStatistics = () => {

//   // Animation variants for the section
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { 
//         staggerChildren: 0.2
//       }
//     }
//   };

//   const itemVariants: Variants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { 
//       y: 0, 
//       opacity: 1,
//       transition: {
//         type: "spring",
//         stiffness: 100,
//         damping: 15
//       }
//     }
//   };
  
//   return (
//     <section className="py-16 bg-gradient-to-r from-black via-[#0F0448] to-black text-white">
//       <div className="container mx-auto px-4">
//         <motion.div 
//           className="text-center mb-12"
//           initial={{ opacity: 0, y: -20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           viewport={{ once: true }}
//         >
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
//             Platform Statistics
//           </h2>
//           <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
//         </motion.div>
        
//         {/* Mobile Grid View - Show all four stats */}
//         <div className="block sm:hidden w-full">
//           <div className="grid grid-cols-2 gap-3 px-2 max-w-[450px] mx-auto">
//             {stats.map((stat, idx) => (
//               <div 
//                 key={idx}
//                 className="bg-gradient-to-br from-[#120d32] to-[#0c0424] rounded-2xl shadow-lg p-4 flex flex-col items-center text-center border border-gray-800 transform transition-all duration-300"
//               >
//                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center mb-2 shadow-lg stat-card-fluid overflow-hidden">
//                   <div className="stat-card-background"></div>
//                   <Image src={`/${stat.iconImage}`} alt={stat.label} width={64} height={64} className="z-10" />
//                 </div>
//                 <div className="text-xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
//                   {stat.value}
//                 </div>
//                 <div className="text-xs text-gray-300">
//                   {stat.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Desktop Grid View */}
//         <motion.div 
//           className="hidden sm:flex justify-center"
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 max-w-6xl mx-auto">
//             {stats.map((stat, idx) => (
//               <motion.div 
//                 key={idx} 
//                 variants={itemVariants}
//                 className="bg-gradient-to-br from-[#120d32] to-[#0c0424] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(123,104,238,0.4)]"
//               >
//                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center mb-4 shadow-lg stat-card-fluid overflow-hidden">
//                   <div className="stat-card-background"></div>
//                   <Image src={`/${stat.iconImage}`} alt={stat.label} width={80} height={80} className="z-10" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
//                   {stat.value}
//                 </div>
//                 <div className="text-base md:text-lg text-gray-300">
//                   {stat.label}
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default PlatformStatistics; 