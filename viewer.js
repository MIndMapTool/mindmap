// viewer.js
// import { client } from './supabaseclient.js';
import { restoreSession, getCurrentUser } from './auth.js';

await restoreSession();

const articleId = new URLSearchParams(window.location.search).get("id");
const articleContent = localStorage.getItem(`article_${articleId}`);
const articleInterests = JSON.parse(localStorage.getItem(`article_interests_${articleId}`));

function formatArticle(content) {
  const container = document.getElementById("article-content");
  container.innerHTML = "";

  const match = content.match(/##\s*([^:]+):/);
  const title = match ? match[1].trim() : "Untitled Article";

  const titleElem = document.createElement("h1");
  titleElem.className = "text-3xl font-bold mb-4";
  titleElem.textContent = title;
  container.appendChild(titleElem);

  const paragraphs = content.replace(/##\s*[^:]+:/, "").trim().split("\n").filter(Boolean);
  paragraphs.forEach(p => {
    const para = document.createElement("p");
    para.className = "text-base mb-4 leading-relaxed text-gray-700";
    para.innerHTML = p.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    container.appendChild(para);
  });
}

if (articleContent) {
  formatArticle(articleContent);
} else {
  document.getElementById("article-content").textContent = "⚠️ Article not found.";
}

document.getElementById("read-button").onclick = async () => {
  console.log("🟢 Read clicked:", articleInterests);

  const { user, error } = await getCurrentUser();
  if (error || !user?.id) {
    alert("You must be signed in.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        read_interests: articleInterests
      })
    });

    const result = await res.json();
    console.log("🧠 Response:", result);

    if (result.status === "success") {
      alert("✅ Marked as read!");
    } else {
      alert("⚠️ Not learned: " + result.message);
    }
  } catch (err) {
    console.error("❌ Read request failed:", err);
    alert("Server error while marking as read.");
  }
};
