import { useParams, useNavigate } from "react-router-dom";
import Records from "../Records";
import { motion } from "framer-motion";

export default function StaffRecordsView() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Wrap Records with navigation capability
  const handleBack = () => {
    navigate("/staff");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button overlay */}
      <div className="fixed top-20 left-6 z-10">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-white border border-[#b9c8b4] rounded-lg shadow-sm hover:bg-[#f0f5ef] transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Records component with Provider role */}
      <Records patientId={patientId} role="Provider" />
    </motion.div>
  );
}
