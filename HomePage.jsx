
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { motion } from 'framer-motion';
import { Clock, FolderTree, BarChart2, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Work Log - Time Tracking & Project Management</title>
        <meta name="description" content="Master your workflow with Work Log. Track time, manage projects hierarchically, and analyze your productivity." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Header />
        
        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6 py-20">
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#5B7FFF]/10 rounded-full blur-3xl pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
              Master your time.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B7FFF] to-[#9B7FFF]">
                Elevate your work.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              The ultimate tool for professionals to organize projects hierarchically, track time effortlessly, and gain deep insights into productivity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-[#5B7FFF] hover:bg-[#4a6eee] text-white px-8 h-14 text-lg rounded-full shadow-lg shadow-[#5B7FFF]/25">
                  Start Tracking Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="bg-transparent border-gray-700 text-white hover:bg-gray-800 px-8 h-14 text-lg rounded-full">
                  Log In
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl"
            >
              <FolderTree className="w-10 h-10 text-[#5B7FFF] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Infinite Hierarchy</h3>
              <p className="text-gray-400">Organize your work exactly how you think. Create projects, sub-projects, and tasks with unlimited nesting.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl"
            >
              <Clock className="w-10 h-10 text-[#5B7FFF] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Frictionless Tracking</h3>
              <p className="text-gray-400">Start a timer with one click or log hours manually. Time tracking that gets out of your way.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl"
            >
              <BarChart2 className="w-10 h-10 text-[#5B7FFF] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Deep Analytics</h3>
              <p className="text-gray-400">Understand where your time goes with powerful roll-up reporting across your entire project tree.</p>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;
