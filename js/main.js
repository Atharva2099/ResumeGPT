import { GoogleGenerativeAI } from "@google/generative-ai";

let currentSection;

// Initialize the chat functionality
document.addEventListener("DOMContentLoaded", function () {
  console.log("Chat functionality initialized");
});

window.openChat = function (section, event) {
  event.preventDefault();
  currentSection = section;
  const chatContainer = document.getElementById("chat-container");

  const emojiRect = event.target.getBoundingClientRect();

  chatContainer.style.display = "block";
  chatContainer.style.top = `${emojiRect.bottom + window.scrollY}px`;
  chatContainer.style.left = `${emojiRect.left + window.scrollX}px`;

  const containerRect = chatContainer.getBoundingClientRect();
  if (containerRect.right > window.innerWidth) {
    chatContainer.style.left = `${window.innerWidth - containerRect.width - 20}px`;
  }

  document.getElementById("chat-messages").innerHTML =
    `Ask me about ${section}:`;
};

document.addEventListener("click", function (event) {
  const chatContainer = document.getElementById("chat-container");
  if (
    chatContainer.style.display === "block" &&
    !chatContainer.contains(event.target) &&
    !event.target.classList.contains("dialogue-box")
  ) {
    closeChat();
  }
});

window.closeChat = function () {
  document.getElementById("chat-container").style.display = "none";
};

window.askQuestion = async function () {
  const userInput = document.getElementById("user-input").value;
  const chatMessages = document.getElementById("chat-messages");

  if (!userInput.trim()) {
    chatMessages.innerHTML += `<p><strong>AI:</strong> Please ask a question.</p>`;
    return;
  }

  chatMessages.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

  const context = `You are an AI assistant specifically trained on Atharva Walawalkar's resume.
    Write outputs based on only the info provided and do not use any of your own knowledge to answer any of these questions.
    Keep all of the answers short 50-80 words nothing more than that. DO NOT ANSWER OUTSIDE THE INFORMATION PROVIDED `;

  const sectionalContext = {
    education: `For the Education section: Atharva has completed his Btech in ECE from PCCOE, Pune and is pursing a Masters in Data Science and AI from SFSU. He is particularly interested in the intersection of electronics and Machine Learning. He has taken additional online courses in machine learning and data science.`,
    experience: `For the Experience section: Atharva's role as Publicity Head involved creating social media campaigns and organizing events. As Technical Head, he led a team of 5 in developing technical workshops.`,
    projects: `For the Projects section: Atharva is passionate about applying AI in practical scenarios. He's currently working on a project involving natural language processing for local Indian languages.`,
    hackathons: `For the Hackathons section: Atharva enjoys the collaborative and high-pressure environment of hackathons. He's planning to participate in more AI and IoT focused hackathons in the future. He has participated in COEPs Neurohack which involved making a NMT for Hinglish to English`,
    skills: `For the Skills section: In addition to the listed skills, Atharva is proficient in Git for version control and has basic knowledge of cloud platforms like AWS and Google Cloud.`,
    interests: `For the Interests section: Atharva is an avid reader of science fiction, particularly works by Isaac Asimov and Arthur C. Clarke. He believes sci-fi often inspires real-world technological advancements.`,
  };

  const prompt =
    context + sectionalContext[currentSection] + " Question: " + userInput;

  try {
    console.log("Sending prompt to Gemini model:", prompt);
    chatMessages.innerHTML += `<p><strong>AI:</strong> Thinking...</p>`;

    const response = await fetch("/api/generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    const result = await response.json();

    if (response.ok) {
      chatMessages.innerHTML = chatMessages.innerHTML.replace(
        `<p><strong>AI:</strong> Thinking...</p>`,
        `<p><strong>AI:</strong> ${result.response}</p>`,
      );
    } else {
      throw new Error(
        result.error || "An error occurred while generating the response.",
      );
    }
  } catch (error) {
    console.error("Error generating response:", error);
    chatMessages.innerHTML = chatMessages.innerHTML.replace(
      `<p><strong>AI:</strong> Thinking...</p>`,
      `<p><strong>AI:</strong> I'm sorry, I couldn't generate a response. Error: ${error.message}</p>`,
    );
  }

  document.getElementById("user-input").value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;
};
