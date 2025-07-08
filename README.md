
# 🎨 AI Prompt Artisan ✨

Transform your raw ideas from text, voice, or drawings into powerful, structured prompts for any AI model. This tool acts as your personal prompt engineering expert, refining your concepts into optimized formats for general use, chatbots, and image generation.
## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| ✍️ **Multi-Modal Input** | Go beyond text. Use your voice to speak your mind or sketch an idea on the canvas. The AI interprets your input in any form. |
| 🌐 **Multi-Language Genius** | Think and create in your native language (supports Hindi, Spanish, Japanese, and more). The app automatically translates and refines your ideas into professional English prompts. |
| 🔮 **Expert Enhancement** | Leverages the power of the Gemini API with advanced system instructions to apply prompt engineering best practices, crafting clear and effective prompts tailored for different use cases. |
| 💡 **Creative Spark** | Stuck for an idea? Use the "Generate Idea" feature to get a random, creative prompt to kickstart your imagination. |
| 💾 **Save & Reuse** | Build your personal library of powerful prompts. Save your favorites with one click, categorized by type, and easily copy them for later use. |

## 🤔 How It Works

AI Prompt Artisan is a frontend application built with React and Vite that interacts directly with the Google Gemini API.

### Input
You provide a creative idea through text, voice (using the Web Speech API), or a drawing.

### Processing
- **For Text/Voice:** The text is sent directly to the Gemini API for enhancement.
- **For Drawing:** The canvas sketch is converted to a JPEG, sent to the Gemini multi-modal endpoint to generate a text description, and that description is then used as the input for enhancement.

### Enhancement
A carefully crafted system prompt instructs the Gemini model to act as a "world-class prompt engineering expert." It translates the input to English if necessary and then generates a JSON object containing three optimized prompt variations:
- **Generic:** A clear, well-structured, general-purpose prompt.
- **Chatbot:** A detailed prompt for conversational AIs (like ChatGPT or Gemini), often including role, context, and formatting instructions.
- **Image Generation:** A descriptive, comma-separated prompt perfect for models like DALL-E, Midjourney, or Stable Diffusion.

### Output
The application parses the JSON response and displays the three enhanced prompts in a clean, user-friendly interface, ready for you to copy or save.

## 🛠️ Technologies Used

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Bundler | Vite |
| Language | TypeScript |
| AI | Google Gemini API (gemini-2.5-flash-preview-04-17) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Speech Recognition | Web Speech API |

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- Node.js (v18 or higher recommended)
- A Google Gemini API Key. You can get one for free at [Google AI Studio](https://ai.google/).

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KesavGopan10/AI-Prompt-Artisan.git
   cd AI-Prompt-Artisan
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your API Key:**
   The application needs your Gemini API key to function. You have two options:

   - **Option A (Recommended): Environment Variable**
     Create a file named `.env.local` in the root of the project and add your API key:
     ```env
     GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
     ```
     This key will be available during development.

   - **Option B: In-App Settings**
     Run the app and click the settings icon (⚙️) in the header. This will open a modal where you can paste and save your API key. The key will be securely encrypted and stored in your browser's local storage.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the URL provided in your terminal (usually [http://localhost:5173](http://localhost:5173)) to view the app.**

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server with hot-reloading. |
| `npm run build` | Builds the app for production to the `dist` folder. |
| `npm run preview` | Serves the production build locally to preview it. |

