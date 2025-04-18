// Initialize Supabase client
const supabaseUrl = 'https://arnvjwxafssjqewtgoaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybnZqd3hhZnNzanFld3Rnb2FmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE5NDU1MywiZXhwIjoyMDU5NzcwNTUzfQ.5miLC8aFSxAp3qT7wm1mieWuDgTuocSalWC1AGX0hmQ'; // ⚠️ Hide this in production
const client = supabase.createClient(supabaseUrl, supabaseKey);

// Shows Articles on the page
// This function will be called after fetching articles from the server
function showArticles(articles) {
  const container = document.getElementById("recommended-topics");
  container.innerHTML = "<h3 class='text-2xl font-bold mb-4'>Generated Articles</h3>";

  if (!articles || Object.keys(articles).length === 0) {
      container.innerHTML += "<p class='text-gray-500'>No articles available.</p>";
      return;
  }

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6";

  Object.keys(articles).forEach((key, index) => {
      
      const articleContent = articles[key];
      const match = articleContent.match(/##\s*([^:]+):/);
      const articleTitle = match ? match[1].trim() : `Article ${index + 1}`;


      localStorage.setItem(`article_${index}`, articleContent);

      const card = document.createElement("a");
      card.href = `/article_viewer.html?id=${index}`;  // Pass ID in URL
      card.target = "_blank"
      card.className = "rounded-xl overflow-hidden shadow bg-white hover:scale-105 transition";

      card.innerHTML = `
          <div class="p-4">
              <h4 class="text-lg font-semibold text-gray-800">${articleTitle}</h4>
              <p class="text-sm text-gray-600">Click to read more</p>
          </div>
      `;

      grid.appendChild(card);
  });

  container.appendChild(grid);
}

// Show user info on the top-right
function showUserInfo(user) {
  const userInfo = document.getElementById("user-info");
  const userEmail = document.getElementById("user-email");
  const userPic = document.getElementById("user-pic");
  const signInBtn = document.getElementById("sign-in-btn");

  userEmail.textContent = user.email;

  // Fallback to default avatar if none exists
  const avatar = user.user_metadata?.avatar_url;
  userPic.src = avatar ? avatar : "default-avatar.png";

  // Toggle visibility
  userInfo.classList.remove("hidden");
  signInBtn.classList.add("hidden");
}

// Check for logged-in user on page load
client.auth.getUser().then(({ data: { user }, error }) => {
  if (user) {
    console.log('User logged in:', user.email);
    showUserInfo(user);
  } else {
    console.log('No user logged in.');
  }
});

// Google Sign-In function
async function signInWithGoogle() {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin // dynamic redirect for dev/production
    }
  });

  if (error) {
    console.error('Sign-in error:', error);
  } else {
    console.log('Redirecting to Google...', data);
  }
}

// Wikipedia topic connection function
async function getRelatedTopics() {
  const topic = document.getElementById("topicInput").value.trim();
  if (!topic) return;

  const resultsDiv = document.getElementById("results");
  const graphDiv = document.getElementById("graph");
  resultsDiv.innerHTML = "Loading...";
  graphDiv.innerHTML = "";

  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
    topic
  )}&prop=links&format=json&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const links = data.parse?.links || [];

    const filteredLinks = links
      .filter(link =>
        link.ns === 0 &&
        !link["*"].startsWith("Help:") &&
        !link["*"].startsWith("File:")
      )
      .slice(0, 10);

    if (filteredLinks.length === 0) {
      resultsDiv.innerHTML = "No related topics found.";
      return;
    }

    resultsDiv.innerHTML = "<h3>Related Topics:</h3>";
    filteredLinks.forEach((link, index) => {
      const a = document.createElement("a");
      a.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(link["*"])}`;
      a.target = "_blank";
      a.textContent = link["*"];
      a.className = "result-link";
      a.style.animationDelay = `${index * 100}ms`;
      resultsDiv.appendChild(a);
    });

    // Create graph nodes and edges
    const nodes = new vis.DataSet([
      { id: topic, label: topic, color: "#6a11cb" },
      ...filteredLinks.map(link => ({
        id: link["*"],
        label: link["*"],
        color: "#ffffff",
        font: { color: '#000' }
      }))
    ]);

    const edges = filteredLinks.map(link => ({
      from: topic,
      to: link["*"]
    }));

    const dataVis = { nodes, edges };
    const options = {
      nodes: {
        shape: "dot",
        size: 20,
        font: {
          size: 14,
          color: "#fff"
        }
      },
      edges: {
        color: "#ccc"
      },
      physics: {
        stabilization: false
      }
    };

    new vis.Network(graphDiv, dataVis, options);
  } catch (err) {
    resultsDiv.innerHTML = "Something went wrong. Try a different topic.";
    console.error(err);
  }
}


// Google Sign-In function
async function signInWithGoogle() {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:5500'
    }
  });

  if (error) {
    console.error('Sign-in error:', error);
  } else {
    console.log('Redirecting to Google...', data);
  }
}

// Optional: Check if user is already logged in
client.auth.getUser().then(({ data: { user } }) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('No user logged in.');
  }
});

// 🚀 Subtopic selection logic
const subtopicsMap = {
  science: {
    title: "Pick Your Favorite Science Topics",
    topics: [
      "Astrophysics", "Quantum Mechanics", "Genetics", "Biotech", "Organic Chem",
      "Neuroscience", "Planetary Science", "Climate", "Material Science", "Space Medicine"
    ]
  },
  arts: {
    title: "Pick Your Favorite Arts Topics",
    topics: [
      "Painting", "Sculpture", "Photography", "Film", "Dance",
      "Theatre", "Poetry", "Literature", "Design", "Calligraphy"
    ]
  },
  law: {
    title: "Pick Your Favorite Law Topics",
    topics: [
      "Constitutional Law", "Criminal Law", "International Law", "Corporate Law", "Cyber Law",
      "Environmental Law", "IPR", "Labor Law", "Civil Rights", "Legal Theory"
    ]
  },
  commerce: {
    title: "Pick Your Favorite Commerce Topics",
    topics: [
      "Accounting", "Finance", "Marketing", "Entrepreneurship", "E-commerce",
      "Stock Market", "Economics", "Logistics", "Human Resources", "Business Analytics"
    ]
  },
  math: {
    title: "Pick Your Favorite Math Topics",
    topics: [
      "Algebra", "Calculus", "Linear Algebra", "Probability", "Statistics",
      "Geometry", "Number Theory", "Game Theory", "Discrete Math", "Topology"
    ]
  }
};

function selectSubject(subject) {
  const config = subtopicsMap[subject];
  if (!config) return;

  document.getElementById("subject-screen").classList.add("hidden");
  document.getElementById("subtopic-screen").classList.remove("hidden");

  document.getElementById("subtopic-title").textContent = config.title;

  const list = document.getElementById("subtopic-list");
  list.innerHTML = "";
  config.topics.forEach(topic => {
    const btn = document.createElement("button");
    btn.textContent = topic;
    btn.className =
      "bg-white text-black px-4 py-2 rounded-xl shadow transition-all duration-200 border-2 border-transparent hover:bg-blue-100";
  
      btn.onclick = () => {
        const isSelected = btn.classList.toggle("selected");
      
        if (isSelected) {
          btn.classList.add("bg-blue-600", "text-white", "border-white", "ring-4"); // <- Add ring-4
          btn.classList.remove("bg-white", "text-black");
        } else {
          btn.classList.remove("bg-blue-600", "text-white", "border-white", "ring-4"); // <- Remove ring-4
          btn.classList.add("bg-white", "text-black");
        }
      };
      
  
    list.appendChild(btn);
  });
  
  
}

function goBackToSubjects() {
  document.getElementById("subtopic-screen").classList.add("hidden");
  document.getElementById("subject-screen").classList.remove("hidden");
}


async function submitSubtopics() {
  const selected = Array.from(document.querySelectorAll("#subtopic-list button.ring-4")).map(btn => btn.textContent);
  const subject = Object.keys(subtopicsMap).find(subject =>
      subtopicsMap[subject].topics.some(topic => selected.includes(topic))
  );

  localStorage.setItem("selectedSubject", subject);
  localStorage.setItem("selectedSubtopics", JSON.stringify(selected));

  console.log("Selected subject:", subject);
  console.log("Selected subtopics:", selected);
  const loadingBar = document.getElementById("loading-bar");
  loadingBar.classList.remove("hidden"); // Show the loading bar


  try {
      const { data, error } = await client.auth.getUser();
      if (error || !data || !data.user) {
          console.error("User not authenticated:", error);
          alert("You need to log in first.");
          return;
      }

      const userId = data.user.id;
      console.log("Logged in userId:", userId);

      const { data: dbData, error: dbError } = await client
          .from("users")
          .upsert([{ user_id: userId, current_interests: [subject, ...selected] }]);

      if (dbError) {
          console.error("Supabase DB Error:", dbError);
          alert("Error saving interests: " + dbError.message);
          return;
      }

      console.log("Data saved to Supabase!", dbData);
      

      // 🔥 Fetch articles after saving user interests
      fetchGeneratedArticles(userId);

      // Switch screens after success
      document.getElementById("subtopic-screen").classList.add("hidden");
      document.getElementById("main-app").classList.remove("hidden");

  } catch (e) {
      console.error("Unexpected error:", e);
      alert("Something went wrong: " + e.message);
  }
}

async function fetchGeneratedArticles(userId) {
  const loadingBar = document.getElementById("loading-bar");
  loadingBar.classList.remove("hidden");

  try {
    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🔍 API Response:", data);

    if (!data.articles || Object.keys(data.articles).length === 0) {
      throw new Error("No articles found.");
    }

    const articles = data.articles;
    const articlesArray = Object.entries(articles);

    articlesArray.forEach(([key, value], index) => {
      const content = value.content;
      const interests = value.interests || [];

      // Save content and interests per article
      localStorage.setItem(`article_${index}`, content);
      localStorage.setItem(`article_interests_${index}`, JSON.stringify(interests));
    });

    showArticles(
      Object.fromEntries(
        articlesArray.map(([key, value], index) => [index, value.content])
      )
    );

  } catch (error) {
    console.error("🚨 Error fetching articles:", error);
    alert(error.message);
  } finally {
    loadingBar.classList.add("hidden");
  }
}


function formatArticle(articleContent) {
  const articleContainer = document.getElementById("article-content");

  // Clear previous content
  articleContainer.innerHTML = "";

  // Extract the title
  const match = articleContent.match(/##\s*([^:]+):/);
  const articleTitle = match ? match[1].trim() : "Untitled Article";

  // Add title to the article
  const titleElement = document.createElement("h1");
  titleElement.className = "text-3xl font-bold text-gray-800 mb-4";
  titleElement.textContent = articleTitle;
  articleContainer.appendChild(titleElement);

  // Split content into paragraphs (excluding the title)
  const contentWithoutTitle = articleContent.replace(/##\s*([^:]+):/, "").trim();
  const paragraphs = contentWithoutTitle.split("\n").filter(line => line.trim() !== "");
  
  paragraphs.forEach(paragraph => {
    const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    const paragraphElement = document.createElement("p");
    paragraphElement.className = "text-gray-700 text-base mb-4 leading-relaxed";
    paragraphElement.innerHTML = formattedParagraph; // Use innerHTML to preserve <strong> tags
    articleContainer.appendChild(paragraphElement);
  });
}

function goBackToSubtopics() {
  document.getElementById("main-app").classList.add("hidden");
  document.getElementById("subtopic-screen").classList.remove("hidden");
}

const dummyRecommendations = [
  { title: "Cosmology", image: "https://source.unsplash.com/400x300/?cosmos", link: "cosmology.html" },
  { title: "Ancient Civilizations", image: "https://source.unsplash.com/400x300/?history", link: "ancient.html" },
  { title: "Knitting", image: "https://source.unsplash.com/400x300/?knitting", link: "knitting.html" },
  { title: "Literary Criticism", image: "https://source.unsplash.com/400x300/?books", link: "literary.html" },
  { title: "Linear Algebra", image: "https://source.unsplash.com/400x300/?math", link: "linear-algebra.html" },
  { title: "Philosophy", image: "https://source.unsplash.com/400x300/?philosophy", link: "philosophy.html" }
];


function showRecommendedTopics(recommendations) {
  const container = document.getElementById("recommended-topics");
  container.innerHTML = "<h3 class='text-2xl font-bold mb-4'>Recommended Topics</h3>";

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6";

  recommendations.forEach(topic => {
    const card = document.createElement("a");
    card.href = topic.link;
    card.className = "rounded-xl overflow-hidden shadow hover:shadow-lg transition transform hover:scale-105 bg-white";
    
    card.innerHTML = `
      <img src="${topic.image}" alt="${topic.title}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h4 class="text-lg font-semibold text-gray-800">${topic.title}</h4>
      </div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

