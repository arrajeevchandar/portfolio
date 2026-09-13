export const projects = [
  {
    id: "solenne", number: "01", name: "Solenne", short: "A little space. A clearer mind.", category: "MULTIMODAL AI · MOBILE", color: "#c2aaff", date: "Featured project · Prototype", title: ["A MOMENT", "TO YOURSELF."],
    intro: "What if a journal could listen beyond the words? A private video-journaling prototype that brings speech, voice, and visual signals into one reflection experience.",
    steps: [
      { label: "Capture", title: "Start with a real moment.", text: "Record or select a video journal. The Flutter client uploads media to Cloudinary and creates a Firestore-backed analysis job.", tech: "Flutter · Riverpod · Cloudinary" },
      { label: "Understand", title: "Many signals. One pipeline.", text: "A Python worker transcribes speech, samples visual signals, and analyzes voice and text. Processing happens asynchronously, with progress sent back to the app.", tech: "Whisper · MediaPipe · librosa · VADER" },
      { label: "Reflect", title: "Give the moment meaning.", text: "Transcripts, metrics, and reflection cards arrive through live Firestore listeners. Optional AI insights can draw on a human-approved research catalog.", tech: "Firestore · Groq · Grounding catalog" },
    ],
    challenge: "Video analysis spans several slow, failure-prone stages. A mobile interface needs to stay responsive while that work happens, and the resulting insights need careful boundaries.",
    approach: "Firestore is the seam between the client and the worker. The app queues a job; the Python worker claims it, processes the media, and writes progress and results back. Snapshot listeners update the journal without polling a custom REST API.",
    decisions: [
      ["Separate capture from computation", "A background worker keeps transcription and signal analysis outside the Flutter client, with journal status reflected in real time."],
      ["Combine complementary signals", "Speech-to-text, voice features, visual sampling, and text sentiment feed the analysis pipeline rather than relying on one input."],
      ["Keep reflection within its scope", "Structured insight cards and optional human-approved research grounding support non-clinical self-awareness. This prototype does not diagnose or treat conditions."],
    ],
    stack: ["Flutter", "Dart", "Riverpod", "Firebase Auth", "Firestore", "Cloudinary", "Python", "Docker", "faster-whisper", "MediaPipe", "OpenCV", "librosa", "Groq"],
    note: "Working prototype for non-clinical reflection. The walkthrough uses illustrative content; it does not capture or analyze your camera, microphone, or health data.",
  },
  {
    id: "cortexedu", number: "02", name: "CortexEdu", short: "Bring the classroom together.", category: "EDTECH · REAL-TIME SYSTEMS", color: "#c7ff6b", date: "Jan — Jun 2026", title: ["LESS ADMIN.", "MORE LEARNING."],
    intro: "A classroom has enough moving parts. CortexEdu connects interactive classes, attendance, internal assessment, and participation in a single mobile experience.",
    steps: [
      { label: "Connect", title: "One connected classroom.", text: "Real-time interactive classes give students and faculty a shared place to engage. QR-based attendance brings check-in into the same experience.", tech: "Flutter · Firebase · Node.js" },
      { label: "Measure", title: "Let assessment add up.", text: "Automated Continuous Internal Assessment calculations reduce manual work. Performance dashboards help students and faculty see the academic picture.", tech: "Assessment calculations · Analytics" },
      { label: "Engage", title: "Make participation count.", text: "A student token reward system recognizes active participation and encourages classroom engagement beyond attendance alone.", tech: "Student rewards · Provider" },
    ],
    challenge: "Attendance, classroom interaction, and assessment are closely related, yet handling them as separate tasks adds friction for both students and faculty.",
    approach: "Developed a Flutter application around the classroom lifecycle: join and participate, record attendance through QR codes, calculate assessment, and make performance visible through dashboards.",
    decisions: [
      ["Build around the class lifecycle", "Interactive classes and QR attendance bring the core classroom activities into the mobile application."],
      ["Automate repetitive calculations", "The Continuous Internal Assessment system computes results and feeds student and faculty performance dashboards."],
      ["Recognize active participation", "Student tokens create a reward mechanism for engagement. No adoption or engagement-growth metrics are claimed here."],
    ],
    stack: ["Flutter", "Dart", "Firebase", "Node.js", "Provider", "Cloudinary"],
    note: "The interactive preview demonstrates the class-to-assessment flow with illustrative class and reward data.",
  },
  {
    id: "dochain", number: "03", name: "DoChain", short: "A document. A verifiable trail.", category: "WEB3 · DISTRIBUTED STORAGE", color: "#8bd7ff", date: "Aug — Oct 2025", title: ["DOCUMENTS.", "WITH PROOF."],
    intro: "A decentralized application for transparent document transactions. Wallet identity, distributed file storage, and smart contracts work together in one flow.",
    steps: [
      { label: "Identify", title: "Start with a wallet.", text: "MetaMask authentication connects the application to the user's blockchain identity. Next.js provides the interface for document transactions.", tech: "Next.js · MetaMask" },
      { label: "Store", title: "Move the file off-chain.", text: "IPFS and Pinata provide decentralized file storage. Solidity contracts handle the blockchain side of the document transaction.", tech: "IPFS · Pinata · Solidity" },
      { label: "Record", title: "Leave a transparent trail.", text: "Smart contracts deployed on the Polygon test network bring the storage and wallet flow together for document transactions.", tech: "Polygon testnet · Hardhat" },
    ],
    challenge: "A document transaction needs both a usable file-storage experience and a clear blockchain interaction. These are distinct responsibilities within the application.",
    approach: "Built a Next.js dApp with MetaMask authentication, Solidity smart contracts, and IPFS/Pinata storage, then deployed the contracts to the Polygon test network.",
    decisions: [
      ["Use wallet-based authentication", "MetaMask connects the application interface to blockchain interactions."],
      ["Separate files from transactions", "IPFS and Pinata handle decentralized files while Solidity contracts handle transaction logic."],
      ["Validate on a test network", "Polygon testnet and Hardhat provide the deployment and development environment. This is not presented as a mainnet financial product."],
    ],
    stack: ["Next.js", "Solidity", "Hardhat", "MetaMask", "IPFS", "Polygon", "Prisma", "Pinata"],
    note: "This walkthrough simulates the flow locally. It never connects a real wallet, requests a signature, uploads a document, or submits a blockchain transaction.",
  },
  {
    id: "ai-fitness", number: "04", name: "AI Fitness", short: "Different goals. Different plans.", category: "GENERATIVE AI · FULL STACK", color: "#ffac75", date: "Jul — Aug 2025", title: ["YOUR GOALS.", "YOUR RHYTHM."],
    intro: "Generic workout lists start with the exercise. This AI-powered platform starts with the person, generating routines from individual goals and physical attributes.",
    steps: [
      { label: "Personalize", title: "Understand the starting point.", text: "User goals and physical attributes provide the context for a personalized workout routine, through a responsive Next.js interface.", tech: "Next.js · Tailwind CSS" },
      { label: "Generate", title: "Turn context into a plan.", text: "Google's Gemini API generates customized workout recommendations from the information provided by the user.", tech: "Gemini API · Prompt integration" },
      { label: "Deliver", title: "Make the plan usable.", text: "A responsive interface presents the generated routine, while MongoDB manages user information behind the experience.", tech: "MongoDB · Responsive UI" },
    ],
    challenge: "Personalization requires connecting a user's goals to the generated output while keeping the interface simple enough to make that output useful.",
    approach: "Integrated Gemini into a Next.js fitness platform, using Tailwind CSS for responsive interfaces and MongoDB for user information.",
    decisions: [
      ["Begin with individual context", "User goals and physical attributes inform workout generation rather than showing the same routine to everyone."],
      ["Integrate generative AI into a flow", "The Gemini API sits within the application experience, generating personalized workout routines."],
      ["Connect interface and data", "Next.js and Tailwind CSS handle the responsive experience, with MongoDB managing user information."],
    ],
    stack: ["Next.js", "Tailwind CSS", "MongoDB", "Gemini API"],
    note: "The portfolio preview switches between illustrative plan structures. It does not call Gemini or provide a personalized exercise prescription.",
  },
];
export type Project = (typeof projects)[number];
