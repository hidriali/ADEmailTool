import { motion } from "framer-motion";

// Blue spinning loader component
export function BlueSpinner({ size = "md", text = "Processing..." }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Animated blue spinner */}
      <motion.div
        className={`${sizeClasses[size]} border-3 border-blue-200 border-t-blue-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Pulsing text */}
      <motion.span
        className={`${textSizes[size]} text-blue-400 font-medium`}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {text}
      </motion.span>
    </div>
  );
}

// Blue spinner with cancel button
export function BlueSpinnerWithCancel({ size = "sm", text = "Processing...", onCancel }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Animated blue spinner */}
      <motion.div
        className={`${sizeClasses[size]} border-3 border-blue-200 border-t-blue-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Text and cancel button */}
      <div className="flex items-center gap-2">
        <motion.span
          className="text-sm text-blue-400 font-medium"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.span>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-red-400 hover:text-red-300 underline ml-2"
            title="Cancel request"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// Blue dots loading animation
export function BlueDots({ text = "AI is thinking" }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-blue-400 font-medium">{text}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Blue pulse loading for buttons
export function BluePulse({ children, isLoading, loadingText = "Loading..." }) {
  return (
    <motion.div
      className={`flex items-center justify-center gap-2 ${
        isLoading ? "cursor-not-allowed opacity-75" : ""
      }`}
      animate={isLoading ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {isLoading && (
        <motion.div
          className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      )}
      <span>{isLoading ? loadingText : children}</span>
    </motion.div>
  );
}
