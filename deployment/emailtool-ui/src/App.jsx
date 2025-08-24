import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import EmailModal from "./EmailModal";
import PromptBox from "./PromptBox";
import { emailAPI } from "./api";

// Default categories
const defaultCategories = [
  "Urgent / Action Required",
  "Work / Professional", 
  "Personal",
  "Finance",
  "Newsletters & Subscriptions",
  "Social & Notifications",
  "Shopping & Orders",
  "Travel & Bookings",
  "Reference / Archives",
  "Scheduled"
];

function CalmingVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
      className="w-12 h-12 flex items-center justify-center"
      aria-label="Calming visual"
    >
      <svg
        className="w-10 h-10"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="rgba(96,165,250,0.6)"
          strokeWidth="10"
          className="animate-pulse"
        />
      </svg>
    </motion.div>
  );
}

function App() {
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [modalMode, setModalMode] = useState("compose");
  const [replyEmail, setReplyEmail] = useState(null);
  const [aiMessage, setAiMessage] = useState("");
  const [aiDropdown, setAiDropdown] = useState(null);
  const [aiIntent, setAiIntent] = useState("");
  const [selectedPromptEmail, setSelectedPromptEmail] = useState(null);
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [isLoadingAiReply, setIsLoadingAiReply] = useState(false);
  const [promptTarget, setPromptTarget] = useState(null);
  const [fullscreenEmailIndex, setFullscreenEmailIndex] = useState(null);
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load emails and categories on component mount
// ...state and logic above...

useEffect(() => {
  loadEmails();
}, []);

const loadEmails = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await emailAPI.getEmails();
    // Backend returns {emails: [...], total: X}, we need just the emails array
    setEmails(data.emails || []);
  } catch (err) {
    setError('Failed to load emails. Please check if the backend is running.');
  } finally {
    setIsLoading(false);
  }
};

// Get available categories from actual email data (excluding "Other"/"uncategorized")
const availableCategories = Array.from(
  new Set(
    emails
      .map(email => {
        let cat = (email.category || "").trim();
        if (cat.toLowerCase() === "other") return "Uncategorized";
        if (cat.toLowerCase() === "gov") return "Work/Professional";
        return cat;
      })
      .filter(
        cat =>
          cat &&
          cat.toLowerCase() !== "uncategorized"
      )
  )
).sort();

const handleCloseModal = () => {
  setIsModalOpen(false);
  setModalMode("compose");
  setReplyEmail(null);
  setAiMessage("");
};

const toggleSidebar = () => {
  setIsSidebarOpen((prev) => !prev);
};

const toggleCategory = (cat) => {
  setSelectedCategories((prev) =>
    prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
  );
  if (activeTab === cat) setActiveTab(null);
};

// Filter emails for display
const normalizeCategory = (cat) => {
  if (!cat) return "Uncategorized";
  const c = cat.trim().toLowerCase();
  if (c === "other") return "Uncategorized";
  if (c === "gov") return "Work/Professional";
  return cat.trim();
};

const filteredEmails = emails.filter(email => {
  const emailCat = normalizeCategory(email.category);
  if (activeTab === "Leftover" || !activeTab) {
    if (selectedCategories.length === 0) return true;
    return !selectedCategories.includes(emailCat);
  }
  return emailCat === activeTab;
}).filter(email =>
  (email.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (email.body || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (email.sender || '').toLowerCase().includes(searchTerm.toLowerCase())
);

// Show the "Leftover" tab if there are any emails not in selected categories
const showLeftover = emails.some(email => {
  const emailCat = (email.category || "").trim();
  return !selectedCategories.includes(emailCat);
});

const EmailCard = ({ email, index }) => {
  // Normalize label for display
  let displayCategory = (email.category || "").trim();
  if (displayCategory.toLowerCase() === "other") displayCategory = "Uncategorized";
  if (displayCategory.toLowerCase() === "gov") displayCategory = "Work/Professional";
  return (
    <div
      className="bg-gray-800 p-4 rounded-lg shadow hover:scale-[1.01] transition-all cursor-pointer"
      onClick={() => setFullscreenEmailIndex(index)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">
          {email.subject ? email.subject.substring(0, 50) + (email.subject.length > 50 ? '...' : '') : 'No subject'}
        </h3>
        <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
          {displayCategory || 'Uncategorized'}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-2">From: {email.sender}</p>
      <p className="text-gray-300 mb-4 text-sm">
        {email.body ? email.body.substring(0, 150) + (email.body.length > 150 ? '...' : '') : 'No content'}
      </p>
      {email.timestamp && (
        <p className="text-gray-500 text-xs mb-3">
          Received: {new Date(email.timestamp).toLocaleString()}
        </p>
      )}
      <div className="flex gap-2">
        <button
          className="btn btn-sm btn-outline btn-info"
          onClick={(e) => {
            e.stopPropagation();
            setModalMode("reply");
            setReplyEmail(email);
            setIsModalOpen(true);
          }}
        >
          ↩️ Reply
        </button>
      </div>
    </div>
  );
}
const FullscreenEmail = ({ email }) => (
  <div className="fixed inset-0 bg-black bg-opacity-95 text-white z-50 p-8 overflow-auto">
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-4">
        <button
          className="text-4xl text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={fullscreenEmailIndex === 0}
          onClick={() => setFullscreenEmailIndex((i) => i - 1)}
          title="Previous email"
        >
          ‹
        </button>
        <button
          className="text-4xl text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={fullscreenEmailIndex === filteredEmails.length - 1}
          onClick={() => setFullscreenEmailIndex((i) => i + 1)}
          title="Next email"
        >
          ›
        </button>
      </div>
      <button
        className="text-4xl text-red-400 hover:text-red-300 transition-colors bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
        onClick={() => setFullscreenEmailIndex(null)}
        title="Close"
      >
        ✕
      </button>
    </div>
    <div className="mb-4">
      <span className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full">
        {email.category || 'Uncategorized'}
      </span>
    </div>
    <h2 className="text-xl font-bold mb-2">
      {email.subject ? email.subject.substring(0, 100) + (email.subject.length > 100 ? '...' : '') : 'No subject'}
    </h2>
    <p className="text-gray-400 text-sm mb-4">From: {email.sender}</p>
    {email.timestamp && (
      <p className="text-gray-500 text-sm mb-4">
        Received: {new Date(email.timestamp).toLocaleString()}
      </p>
    )}
    <p className="text-gray-200 whitespace-pre-wrap mb-8">{email.body || 'No content'}</p>
    <button
      className="btn btn-outline btn-info"
      onClick={() => {
        setModalMode("reply");
        setReplyEmail(email);
        setIsModalOpen(true);
      }}
    >
      ↩️ Reply
    </button>
  </div>
);

// --- THE RETURN BLOCK AND REST OF THE CODE ---
return (
  <div className="min-h-screen bg-black text-white">
    {fullscreenEmailIndex !== null && (
      <FullscreenEmail email={filteredEmails[fullscreenEmailIndex]} />
    )}

    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 shadow-md">
      <div className="flex items-center gap-3 min-w-[240px]">
        <button
          className="text-2xl hover:scale-110 transition-transform focus:outline-none"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          title="Open Menu"
        >
          ☰
        </button>

        <Mail className="text-blue-400 w-6 h-6 hover:scale-110 transition-transform duration-300 cursor-pointer" />

        <h1 className="text-xl font-bold whitespace-nowrap">
          AD&apos; Email Assistant
        </h1>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <input
          type="text"
          placeholder="Search emails by sender, subject, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full px-4 py-2 bg-black text-white placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      <div className="flex items-center gap-6">
        <CalmingVisual />
      </div>
    </header>

    <div className={`flex ${!isSidebarOpen ? "pl-4" : ""}`}>
      {isSidebarOpen && (
        <aside className="w-64 bg-gray-900 p-4 flex flex-col gap-8 min-h-screen">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-full shadow-md flex items-center justify-center gap-2"
            onClick={() => {
              setModalMode("compose");
              setReplyEmail(null);
              setAiMessage("");
              setIsModalOpen(true);
            }}
          >
            <span className="text-lg">✏️</span> Compose
          </button>

          <div className="flex flex-col gap-8">
            <h2 className="text-gray-300 text-sm font-semibold">
              Select Categories:
            </h2>

            <div className="flex flex-col gap-8">
              {availableCategories.map((cat, index) => {
                const isSelected = selectedCategories.includes(cat);

                return (
                  <motion.label
                    key={index}
                    className="flex items-center gap-3 cursor-pointer text-white select-none"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => toggleCategory(cat)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-sm border-2 transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : "border-blue-400"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{cat}</span>
                  </motion.label>
                );
              })}
            </div>
          </div>

          <EmailModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            mode={modalMode}
            originalEmail={replyEmail}
            aiMessage={aiMessage}
            setAiMessage={setAiMessage}
            setShowPromptBox={setShowPromptBox}
            setPromptTarget={setPromptTarget}
            isLoadingAiReply={isLoadingAiReply}
            setIsLoadingAiReply={setIsLoadingAiReply}
          />
        </aside>
      )}

      <PromptBox
        isOpen={showPromptBox}
        onClose={() => {
          setShowPromptBox(false);
          setPromptText("");
          setPromptTarget(null);

          if (promptTarget) {
            setModalMode("reply");
          } else {
            setModalMode("compose");
          }

          setReplyEmail(promptTarget || null);
          // Don't clear aiMessage here - let it be passed to EmailModal
        }}

        prompt={promptText}
        setPrompt={setPromptText}
        originalEmail={promptTarget}
        setAiMessage={setAiMessage}
        isLoadingAiReply={isLoadingAiReply}
        setIsLoadingAiReply={setIsLoadingAiReply}
        onSubmit={async () => {
          setIsLoadingAiReply(true);
          try {
            const { request, cancel } = await emailAPI.generateAIDraft(
              promptTarget?.body || "",
              promptTarget?.subject || "",
              modalMode,
              promptText
            );
            const result = await request;
            if (result.success) {
              setAiMessage(result.result || "AI failed to generate.");
            } else {
              setAiMessage(`AI Error: ${result.result || "Unknown error"}`);
            }
            
            // Close PromptBox and open EmailModal
            setShowPromptBox(false);
            setIsModalOpen(true);
          } catch (err) {
            console.error("AI Draft error:", err);
            if (err.message.includes('cancelled')) {
              setAiMessage("Draft generation was cancelled.");
            } else if (err.message.includes('timed out')) {
              setAiMessage("Draft generation timed out. The AI service may be slow or unavailable.");
            } else {
              setAiMessage("AI failed to generate a draft.");
            }
          } finally {
            setPromptText("");
            setPromptTarget(null);
            setIsLoadingAiReply(false);
          }
        }}
      />

      <main className="flex-1 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mb-4 p-4 bg-blue-900 border border-blue-700 rounded-lg text-blue-200">
            Loading emails...
          </div>
        )}

        <p className="text-gray-400 mb-6 text-sm">
          Select categories to filter your inbox. Emails will appear in tabs.
          AI replies will be draftable from each view.
        </p>

        <section className="flex flex-wrap gap-3 border-b border-gray-700 pb-4 mb-6">
          <AnimatePresence>
            {selectedCategories.map((cat) => {
              const unreadCount = emails.filter(
                (email) => normalizeCategory(email.category) === cat
              ).length;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border shadow-sm cursor-pointer transition-all ${
                      activeTab === cat
                        ? "bg-blue-600 text-white font-semibold border-blue-500"
                        : "bg-gray-900 text-white border-gray-700 hover:bg-gray-800"
                    }`}
                    onClick={() => setActiveTab(cat)}
                  >
                    <span>{cat}</span>

                    {unreadCount > 0 && (
                      <span className="text-xs px-2 py-1 bg-teal-500 text-black rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}

                    <button
                      className="ml-1 text-gray-400 hover:text-red-400 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newCats = selectedCategories.filter((c) => c !== cat);
                        setSelectedCategories(newCats);
                        if (activeTab === cat) {
                          setActiveTab(newCats[0] || null);
                        }
                      }}
                      aria-label={`Close ${cat} tab`}
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {showLeftover && (
              <motion.div
                key="Leftover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer border shadow-sm transition-all ${
                    activeTab === "Leftover"
                      ? "bg-gray-800 text-white border-gray-600"
                      : "bg-black text-gray-400 border-gray-700 hover:bg-gray-800"
                  }`}
                  onClick={() => setActiveTab("Leftover")}
                >
                  <span>🧺 Leftover</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {!activeTab ? (
          <p className="text-gray-500 text-sm">Select a tab to view your emails.</p>
        ) : (
          <div className="grid gap-4">
            {filteredEmails.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {activeTab === "Leftover" 
                  ? "No emails found in leftover." 
                  : `No emails found in ${activeTab} category.`}
              </p>
            ) : (
              filteredEmails.map((email, index) => (
                <EmailCard key={`${activeTab}-${index}`} email={email} index={index} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  </div>
);
}


export default App;







