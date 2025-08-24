import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import { emailAPI, cancelRequest } from "./api";
import { BlueSpinner, BlueDots, BluePulse, BlueSpinnerWithCancel } from "./BlueSpinner"; 


function EmailModal({
    isOpen,
    onClose,
    mode = "compose",
    originalEmail = null,
    aiMessage,
    setAiMessage,
    setShowPromptBox,
    isLoadingAiReply,
    setIsLoadingAiReply,
    setPromptTarget
  }) {
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDraftingReply, setIsDraftingReply] = useState(false); // New state for draft reply button
  
  // Track active AI requests for cancellation
  const [activeRequests, setActiveRequests] = useState({
    polish: null,
    analyze: null,
    draft: null
  });

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setShowMenu(false);
      setAiMessage("");
      setTo("");
      setSubject("");
      setIsSending(false);
      setIsPolishing(false);
      setIsAnalyzing(false);
      setIsDraftingReply(false);
    }
  }, [isOpen]);

  // Set initial values for reply mode
  useEffect(() => {
    if (isOpen && mode === "reply" && originalEmail) {
      setTo(originalEmail.sender || "");
      setSubject(originalEmail.subject ? `Re: ${originalEmail.subject}` : "");
    }
  }, [isOpen, mode, originalEmail]);

  // Update message when AI generates content
  useEffect(() => {
    if (aiMessage && aiMessage !== "Thinking...") {
      setMessage(aiMessage);
    }
  }, [aiMessage]);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !message.trim()) {
      alert("Please fill in all fields (To, Subject, and Message)");
      return;
    }

    setIsSending(true);
    try {
      const emailData = {
        to: to.trim(),
        subject: subject.trim(),
        body: message.trim()
      };
      
      console.log("Sending email:", emailData);
      await emailAPI.sendEmail(emailData);
      
      alert("Email sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0F172A] text-white w-full max-w-4xl rounded-xl shadow-xl flex flex-col"
            style={{ maxHeight: '90vh' }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">
                {mode === "compose" ? "📤 Compose Email" : "↩️ Reply to Email"}
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* To Field */}
              <input
                type="text"
                placeholder="To"
                className="w-full mb-3 px-4 py-2 rounded-md bg-black text-white placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                readOnly={mode === "reply"}
              />

              {/* Subject Field */}
              <input
                type="text"
                placeholder="Subject"
                className="w-full mb-3 px-4 py-2 rounded-md bg-black text-white placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              {/* Quoted Email Context */}
              {mode === "reply" && originalEmail && (
                <div className="mb-3 text-sm text-gray-400 border-l-4 border-gray-600 pl-3">
                  <p className="italic">💬 Replying to:</p>
                  <p className="mt-1">{originalEmail.body}</p>
                </div>
              )}

              {isLoadingAiReply && (
                <div className="mb-4 flex items-center justify-between p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <BlueDots text="AI is generating draft" />
                  {activeRequests.draft && (
                    <button
                      onClick={() => {
                        if (activeRequests.draft) {
                          activeRequests.draft();
                          // Reset loading states when cancelling
                          setIsLoadingAiReply(false);
                          setIsDraftingReply(false);
                          setAiMessage("Draft generation was cancelled.");
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                      title="Cancel AI draft generation"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {/* AI Action Menu */}
              <div className="relative mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-2 rounded-full shadow hover:from-blue-400 hover:to-teal-400 focus:outline-none"
                  onClick={() => setShowMenu((prev) => !prev)}
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold text-sm">AI</span>
                </motion.button>

                {/* AI Dropdown */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-12 left-0 z-20 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-3 w-72"
                    >
                      <h4 className="text-sm font-semibold mb-2 text-white">AI Actions</h4>
                      <ul className="flex flex-col gap-2 text-white">
                        <li>
                          {isPolishing ? (
                            <div className="w-full text-left px-3 py-2 rounded-md bg-gray-800 opacity-75">
                              <BlueSpinnerWithCancel 
                                size="sm" 
                                text="Polishing..." 
                                onCancel={() => {
                                  if (activeRequests.polish) {
                                    activeRequests.polish();
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <button
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isPolishing || !message.trim()}
                              onClick={async () => {
                                setShowMenu(false);
                                if (message.trim()) {
                                  setIsPolishing(true);
                                  setAiMessage(""); // Clear previous message
                                  try {
                                    console.log("Calling polishDraft with:", message);
                                    const { request, cancel } = await emailAPI.polishDraft(message);
                                    setActiveRequests(prev => ({ ...prev, polish: cancel }));
                                    const result = await request;
                                    console.log("Polish result:", result);
                                    setAiMessage(result.result || result.text || result.reply || "AI polish failed.");
                                  } catch (err) {
                                    console.error("AI Polish error:", err);
                                    if (err.message.includes('cancelled')) {
                                      setAiMessage("Polish request was cancelled.");
                                    } else if (err.message.includes('timed out')) {
                                      setAiMessage("Polish request timed out. The AI service may be slow or unavailable.");
                                    } else {
                                      setAiMessage("AI failed to polish your message. Please check if the AI service is running.");
                                    }
                                  } finally {
                                    setIsPolishing(false);
                                    setActiveRequests(prev => ({ ...prev, polish: null }));
                                  }
                                }
                              }}
                            >
                              ✒️ Polish & Enhance
                            </button>
                          )}
                        </li>

                        <li>
                          {isAnalyzing ? (
                            <div className="w-full text-left px-3 py-2 rounded-md bg-gray-800 opacity-75">
                              <BlueSpinnerWithCancel 
                                size="sm" 
                                text="Analyzing..." 
                                onCancel={() => {
                                  if (activeRequests.analyze) {
                                    activeRequests.analyze();
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <button
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isAnalyzing || !message.trim()}
                              onClick={async () => {
                                setShowMenu(false);
                                if (message.trim()) {
                                  setIsAnalyzing(true);
                                  setAiMessage(""); // Clear previous message
                                  try {
                                    console.log("Calling analyzeEmail with:", message, subject);
                                    const { request, cancel } = await emailAPI.analyzeEmail(message, subject);
                                    setActiveRequests(prev => ({ ...prev, analyze: cancel }));
                                    const result = await request;
                                    console.log("Analyze result:", result);
                                    setAiMessage(result.result || result.text || result.reply || "AI grammar check failed.");
                                  } catch (err) {
                                    console.error("AI Analyze error:", err);
                                    if (err.message.includes('cancelled')) {
                                      setAiMessage("Analysis request was cancelled.");
                                    } else if (err.message.includes('timed out')) {
                                      setAiMessage("Analysis request timed out. The AI service may be slow or unavailable.");
                                    } else {
                                      setAiMessage("AI failed to analyze your message. Please check if the AI service is running.");
                                    }
                                  } finally {
                                    setIsAnalyzing(false);
                                    setActiveRequests(prev => ({ ...prev, analyze: null }));
                                  }
                                }
                              }}
                            >
                              📚 Organize + Grammar Check
                            </button>
                          )}
                        </li>

                        <li>
                          <button
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition"
                            onClick={() => {
                              setShowMenu(false);
                              setShowPromptBox(true);
                              setPromptTarget(originalEmail);
                            }}
                          >
                            🧾 Compose from Prompt
                          </button>
                        </li>

                        {mode === "reply" && (
                          <li>
                            {isDraftingReply ? (
                              <div className="w-full text-left px-3 py-2 rounded-md bg-gray-800 opacity-75">
                                <BlueSpinnerWithCancel 
                                  size="sm" 
                                  text="Drafting..." 
                                  onCancel={() => {
                                    if (activeRequests.draft) {
                                      activeRequests.draft();
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <button
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoadingAiReply}
                                onClick={async () => {
                                  setShowMenu(false);
                                  setIsDraftingReply(true); // Set button loading state
                                  setIsLoadingAiReply(true); // This triggers the blue dots loading indicator
                                  setAiMessage("Thinking...");
                                  try {
                                    console.log("Starting AI draft generation with original email:", originalEmail);
                                    const replyPrompt = originalEmail?.body 
                                      ? `Reply to: "${originalEmail.body.substring(0, 200)}..." - Write a professional response acknowledging their message.`
                                      : "Write a professional email response.";
                                    
                                    const { request, cancel } = await emailAPI.generateAIDraft(
                                      originalEmail?.body || "",
                                      originalEmail?.subject || "",
                                      "reply",
                                      replyPrompt
                                    );
                                    setActiveRequests(prev => ({ ...prev, draft: cancel }));
                                    const result = await request;
                                    console.log("AI Reply result:", result);
                                    if (result && result.success) {
                                      console.log("Setting AI message to:", result.result);
                                      setAiMessage(result.result || "AI failed to generate reply.");
                                    } else {
                                      console.log("AI generation failed:", result);
                                      setAiMessage(`AI Error: ${result?.result || "Unknown error"}`);
                                    }
                                  } catch (err) {
                                    console.error("AI Reply error:", err);
                                    if (err.message.includes('cancelled')) {
                                      setAiMessage("Draft generation was cancelled.");
                                    } else if (err.message.includes('timed out')) {
                                      setAiMessage("Draft generation timed out. The AI service may be slow or unavailable.");
                                    } else {
                                      setAiMessage("AI failed to generate reply. Please try again.");
                                    }
                                  } finally {
                                    setIsDraftingReply(false); // Clear button loading state
                                    setIsLoadingAiReply(false); // Stop the loading indicator
                                    setActiveRequests(prev => ({ ...prev, draft: null }));
                                  }
                                }}
                              >
                                🤖 Draft Full Reply (AI)
                              </button>
                            )}
                          </li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Message */}
              <TextareaAutosize
                minRows={8}
                maxRows={20}
                placeholder="Start typing your email..."
                className="w-full px-4 py-3 rounded-md resize-none bg-black text-white placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Footer Buttons - Always Visible */}
            <div className="p-6 border-t border-gray-700 bg-[#0F172A]">
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition"
                  onClick={onClose}
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSend}
                  disabled={isSending || !to.trim() || !subject.trim() || !message.trim()}
                >
                  <BluePulse isLoading={isSending} loadingText="Sending...">
                    Send
                  </BluePulse>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EmailModal;
