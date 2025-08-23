import { motion, AnimatePresence } from "framer-motion";
import { BlueSpinner, BluePulse, BlueSpinnerWithCancel, BlueDots } from "./BlueSpinner";
import { useState, useRef, useEffect } from "react";

function PromptBox({
  isOpen,
  mode = "compose", // can be "compose" or "reply"
  onClose,
  onSubmit,
  prompt,
  setPrompt,
  originalEmail = null,
  setAiMessage, // Pass this prop from parent to display AI result
  isLoadingAiReply, // The actual loading state
  setIsLoadingAiReply // The function to set loading state
}) {
  const isReply = mode === "reply";
  const title = isReply ? "↩️ Reply Using Prompt" : "📤 Compose Using Prompt";

  // Handler for AI draft generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (isLoadingAiReply) return; // Prevent double-clicks
    
    // Use the onSubmit callback from parent instead of doing the AI generation here
    if (onSubmit) {
      onSubmit();
    }
  };
  
  // Cancel function handler
  const handleCancel = () => {
    // Just close the modal since AI generation is handled by parent
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0F172A] w-full max-w-3xl p-8 rounded-xl text-white border border-gray-800 shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-bold mb-2">{title}</h2>

            {isReply && originalEmail && (
              <p className="text-sm text-gray-400 mb-3">
                Craft a reply to <span className="text-blue-300 font-medium">{originalEmail.sender}</span> based on your prompt.
              </p>
            )}

            {!isReply && (
              <p className="text-sm text-gray-400 mb-3">
                Provide a short prompt to guide the AI in composing your email.
              </p>
            )}

            <textarea
              placeholder="E.g. Thank them + ask for next steps"
              className="w-full h-40 px-3 py-2 bg-black text-white placeholder-gray-500 border border-gray-700 rounded-md resize-none focus:ring-2 focus:ring-blue-400"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoadingAiReply}
            />

            {/* Show loading indicator when generating */}
            {isLoadingAiReply && (
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-center justify-between">
                <BlueDots text="AI is generating your draft" />
                <button
                  onClick={handleCancel}
                  className="text-xs text-red-400 hover:text-red-300 underline"
                  title="Cancel AI generation"
                >
                  Cancel AI
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="btn btn-outline btn-error"
                onClick={onClose}
                disabled={isLoadingAiReply}
              >
                Cancel
              </button>
              
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenerate}
                disabled={isLoadingAiReply || !prompt.trim()}
              >
                <BluePulse isLoading={isLoadingAiReply} loadingText="Generating...">
                  Generate {isReply ? "Reply" : "Draft"}
                </BluePulse>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PromptBox;