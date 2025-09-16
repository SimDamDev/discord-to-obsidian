import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🤖 Discord to Obsidian Worker starting...');
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

// Worker logic will be implemented here
async function startWorker() {
  try {
    console.log('✅ Worker initialized successfully');
    
    // Keep the worker running
    setInterval(() => {
      console.log('💓 Worker heartbeat');
    }, 30000); // Every 30 seconds
    
  } catch (error) {
    console.error('❌ Worker failed to start:', error);
    process.exit(1);
  }
}

// Start the worker
startWorker();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down worker gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down worker gracefully');
  process.exit(0);
});
