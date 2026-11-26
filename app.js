const stories = [
    {
        id: 1,
        title: "Not in This Life, Monsieur",
        author: "Ann",
        cover:"images/covers/Not_in_this_life.cover.jpeg",
        chapters: [
            {
                id: 1,
                title: "Treason",
                file: "stories/Treason.txt",
                text: ""
            },
            {
                id: 2,
                title: "The bargain",
                file: "stories/the bargain.txt",
                text: ""
            },
            {
                id: 3,
                title: "A second chance",
                file: "stories/A second chance.txt",
                text: ""
            },
            
            {
                id:4,
                title:"As i should",
                text: "to be continued....",
            },
        
        ]
    },

    
];

// Current reading position
let currentStory = stories[0];
let currentChapter = 0;
let readingMode = "novel";

// Save interaction information separately for each story.
let chapterData = JSON.parse(
    localStorage.getItem("alarasChapterData") || "{}"
);

const reader = document.getElementById("reader");
const library = document.getElementById("library");
const storyGrid = document.getElementById("storyGrid");

const chapterList = document.getElementById("chapterList");
const chapterNumber = document.getElementById("chapterNumber");
const chapterTitle = document.getElementById("chapterTitle");
const novelContent = document.getElementById("novelContent");

const likeButton = document.getElementById("likeButton");
const saveButton = document.getElementById("saveButton");
const commentButton = document.getElementById("commentButton");

const commentsArea = document.getElementById("commentsArea");
const commentList = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");

function saveData() {
    localStorage.setItem(
        "alarasChapterData",
        JSON.stringify(chapterData)
    );
}
const savedChapters = document.getElementById("savedChapters");

// Display all saved chapters.
function displaySavedChapters() {
    savedChapters.innerHTML = "";

    let hasSavedChapters = false;

    stories.forEach(story => {
        story.chapters.forEach(chapter => {
            const key = `${story.id}-${chapter.id}`;
            const data = chapterData[key];

            if (data && data.saved) {
                hasSavedChapters = true;

                const card = document.createElement("article");
                card.className = "saved-chapter-card";

                const storyTitle = document.createElement("p");
                storyTitle.textContent = story.title;

                const chapterTitle = document.createElement("h3");
                chapterTitle.textContent = chapter.title;

                const openButton = document.createElement("button");
                openButton.textContent = "Continue reading →";

                openButton.addEventListener("click", () => {
                    currentStory = story;
                    currentChapter = story.chapters.findIndex(
                        item => item.id === chapter.id
                    );

                    reader.hidden = false;
                    library.hidden = true;
                    savedChapters.closest(".my-library").scrollIntoView();

                    showChapter();
                    reader.scrollIntoView({ behavior: "smooth" });
                });

                card.append(storyTitle, chapterTitle, openButton);
                savedChapters.appendChild(card);
            }
        });
    });

    if (!hasSavedChapters) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-library";
        emptyMessage.textContent =
            "Your library is waiting for its first saved chapter. ✧";

        savedChapters.appendChild(emptyMessage);
    }
}

// Give every chapter a unique identifier.
function getChapterKey() {
    return `${currentStory.id}-${currentStory.chapters[currentChapter].id}`;
}

function getChapterData() {
    const key = getChapterKey();

    if (!chapterData[key]) {
        chapterData[key] = {
            liked: false,
            saved: false,
            comments: []
        };
    }

    return chapterData[key];
}

// Open a selected story.
function openStoryDetails(storyId) {
    const selectedStory = stories.find(
        story => story.id === storyId
    );

    if (!selectedStory) return;

    currentStory = selectedStory;

    const storyDetails = document.getElementById("storyDetails");

    document.getElementById("detailsCover").src = selectedStory.cover;
    document.getElementById("detailsCover").alt = `Cover of ${selectedStory.title}`;

    document.getElementById("detailsTitle").textContent = selectedStory.title;
    document.getElementById("detailsAuthor").textContent = `By ${selectedStory.author}`;
    document.getElementById("detailsChapterCount").textContent =
        `${selectedStory.chapters.length} CHAPTERS`;

    document.getElementById("detailsChapterList").innerHTML = "";

    selectedStory.chapters.forEach((chapter, index) => {
        const chapterButton = document.createElement("button");

        chapterButton.textContent = `${String(index + 1).padStart(2, "0")} — ${chapter.title}`;

        chapterButton.addEventListener("click", () => {
            openStory(selectedStory.id, index);
        });

        document.getElementById("detailsChapterList").appendChild(chapterButton);
    });

    library.hidden = true;
    storyDetails.hidden = false;

    storyDetails.scrollIntoView({ behavior: "smooth" });
}


// Open the actual reader.
function openStory(storyId, chapterIndex = 0) {
    const selectedStory = stories.find(
        story => story.id === storyId
    );

    if (!selectedStory) return;

    currentStory = selectedStory;
    currentChapter = chapterIndex;
    readingMode = "novel";

    document.getElementById("storyDetails").hidden = true;
    reader.hidden = false;

    showChapter();
    reader.scrollIntoView({ behavior: "smooth" });
}


// Begin reading button.
document.getElementById("startReading").addEventListener("click", () => {
    openStory(currentStory.id);
});


// Back to Library from Story Details.
document.getElementById("backFromDetails").addEventListener("click", () => {
    document.getElementById("storyDetails").hidden = true;
    library.hidden = false;

    library.scrollIntoView({ behavior: "smooth" });
});


// Back to Story Details from Reader.
document.getElementById("backToLibrary").addEventListener("click", () => {
    reader.hidden = true;
    document.getElementById("storyDetails").hidden = false;

    document.getElementById("storyDetails").scrollIntoView({
        behavior: "smooth"
    });
});


// Display all chapters belonging to the current story.
function showChapterList() {
    chapterList.innerHTML = "";

    currentStory.chapters.forEach((chapter, index) => {
        const button = document.createElement("button");

        button.className = "chapter-link";
        button.textContent = chapter.title;

        if (index === currentChapter) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            currentChapter = index;
            commentsArea.hidden = true;
            showChapter();
        });

        chapterList.appendChild(button);
    });
}

// Display the selected chapter.
async function showChapter() {
  const chapterIndex = currentChapter;
  const chapter = currentStory.chapters[chapterIndex];

  chapterNumber.textContent = `CHAPTER ${chapter.id}`;
  chapterTitle.textContent = chapter.title;
  window.scrollTo({
    top:reader.offsetTop,
    behavior: "smooth"
  });

  novelContent.textContent = "Loading chapter...";

  try {
    // Load the chapter text from its file.
    if (!chapter.text) {
      const response = await fetch(chapter.file);

      if (!response.ok) {
        throw new Error("Could not load chapter.");
      }

      chapter.text = await response.text();
    }

    // Make sure the user is still on this chapter.
    if (currentChapter !== chapterIndex) return;

    novelContent.textContent = chapter.text;

  } catch (error) {
    novelContent.textContent =
      "Sorry, this chapter could not be loaded.";
    console.error(error);
  }

  showChapterList();
  updateToolbar();
  showComments();
  updateReadingMode();

  document.getElementById("previousChapter").disabled =
    currentChapter === 0;

  document.getElementById("nextChapter").disabled =
    currentChapter === currentStory.chapters.length - 1;

}


// Update the interaction buttons.
function updateToolbar() {
    const data = getChapterData();

    likeButton.textContent = data.liked ? "♥ Liked" : "♡ Like";
    saveButton.textContent = data.saved ? "✓ Saved" : "＋ Save";

    likeButton.classList.toggle("selected", data.liked);
    saveButton.classList.toggle("selected", data.saved);

    saveData();
    displaySavedChapters();
}

// Like a chapter.
likeButton.addEventListener("click", () => {
    const data = getChapterData();
    data.liked = !data.liked;
    updateToolbar();
});

// Save a chapter.
saveButton.addEventListener("click", () => {
    const data = getChapterData();
    data.saved = !data.saved;
    updateToolbar();
});

// Open comments.
commentButton.addEventListener("click", () => {
    commentsArea.hidden = !commentsArea.hidden;
});

// Add a comment.
commentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = commentInput.value.trim();

  if (!message) return;

  const data = getChapterData();
  data.comments.push(message);
  console.log(data.comments);

  commentInput.value = "";

  commentsArea.hidden = false;

  saveData();
  showComments();
});

// Display comments belonging to this chapter.
function showComments() {
    console.log("displaying comments:",getChapterData().comments);
    const data = getChapterData();

    commentList.innerHTML = "";

    data.comments.forEach(message => {
        const comment = document.createElement("div");

        comment.className = "comment-item";
        comment.textContent = message;

        commentList.appendChild(comment);
    });
}

// Keep the reading experience in Novel mode.
function updateReadingMode() {
  novelContent.hidden = false;
}

// Navigate between chapters.
document.getElementById("previousChapter").addEventListener("click", () => {
    if (currentChapter > 0) {
        currentChapter--;
        commentsArea.hidden = true;
        showChapter();
    }
});

document.getElementById("nextChapter").addEventListener("click", () => {
    if (currentChapter < currentStory.chapters.length - 1) {
        currentChapter++;
        commentsArea.hidden = true;
        showChapter();
    }
});

// Generate story cards automatically.
function displayStories() {
    storyGrid.innerHTML = "";

    stories.forEach(story => {
        const card = document.createElement("article");
        card.className = "story-card";

        const cover = document.createElement("div");
        cover.className = "story-cover";

        const coverImage = document.createElement("img");
        coverImage.src = story.cover;
        coverImage.alt = `cover of ${story.title}`;
        
        cover.appendChild(coverImage);
        const info = document.createElement("div");
        info.className = "story-info";

        const genre = document.createElement("p");
        genre.className = "genre";
        genre.textContent = `${story.chapters.length} CHAPTERS`;

        const title = document.createElement("h3");
        title.textContent = story.title;

        const author = document.createElement("p");
        author.textContent = `By ${story.author}`;

        const button = document.createElement("button");
        button.className = "read-btn";
        button.textContent = "Discover story →";

        button.addEventListener("click", () => {
            openStoryDetails(story.id);
        });

        info.append(genre, title, author, button);
        card.append(cover, info);
        storyGrid.appendChild(card);
    });
}

// Display the stories when the page loads.
displayStories();


// Start with the first story ready.
showChapter();
displaySavedChapters();

// ALARAS — The Forgotten Reader
(() => {
    const entrance = document.getElementById("mysteryEntrance");
    console.log("ALARAS mystery code is running!");
    const card = document.querySelector(".mystery-card");
    const beginButton = document.getElementById("beginInvestigation");
    console.log("Mystery button found:",beginButton);

    if (!entrance || !card || !beginButton) return;

    // Remember visitors who have already unlocked ALARAS.
    if (localStorage.getItem("alarasUnlocked") === "true") {
        entrance.style.display = "none";
        return;
    }

  const clues = [
    {
        title: "Clue I — The First Trace",
        story: "I hold countless voices, yet I have no voice of my own. I can take you to places you have never been. What am I?",
        answer: "book",
        hint: "You turn my pages to discover stories."
    },
    {
        title: "Clue II — The Silent Witness",
        story: "I follow every reader, but I never read. I appear when light is near, yet disappear in darkness. What am I?",
        answer: "shadow",
        hint: "Look down when the sun shines."
    },
    {
        title: "Clue III — The Last Secret",
        story: "I can be written, shared, and kept. I can open doors without a key, and I am what ALARAS was built to protect. What am I?",
        answer: "story",
        hint: "Every book has one."
    }
];
    let currentClue = 0;

    function showClue() {
        const clue = clues[currentClue];

        card.innerHTML = `
            <p class="eyebrow">✦ ALARAS ARCHIVES · CASE 001 ✦</p>
            <h1>${clue.title}</h1>
            <p class="mystery-subtitle">${clue.story}</p>

            <input id="clueAnswer" type="text"
                placeholder="Enter your answer...">

            <button id="submitClue">Submit answer ✦</button>

            <p id="clueFeedback"></p>
            <button id="showHint" class="hint-button">
                Need a hint?
            </button>
        `;

        document.getElementById("submitClue").addEventListener("click", checkAnswer);

        document.getElementById("showHint").addEventListener("click", () => {
            document.getElementById("clueFeedback").textContent = clue.hint;
        });
    }

  function checkAnswer() {
    const answer = document.getElementById("clueAnswer")
        .value.trim().toLowerCase();

    const feedback = document.getElementById("clueFeedback");

    if (answer === clues[currentClue].answer) {

        if (currentClue < clues.length - 1) {
            feedback.textContent = "Correct! The next clue has been revealed...";

            setTimeout(() => {
                currentClue++;
                showClue();
            }, 1200);

        } else {
            showFinalCode();
        }

    } else {
        feedback.textContent =
            "Not quite. Examine the evidence and try again.";
    }
}
    beginButton.onclick = showClue;
  function showFinalCode() {
    let personalCode = localStorage.getItem("alarasPersonalCode");

    if (!personalCode) {
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        personalCode = `STORY-${randomNumber}`;
        localStorage.setItem("alarasPersonalCode", personalCode);
    }

    localStorage.setItem("alarasUnlocked", "true");

    card.innerHTML = `
        <p class="eyebrow">✦ ALARAS ARCHIVES · CASE CLOSED ✦</p>
        <h1>The Secret Is Yours</h1>

        <div class="mystery-letter">
            <p>Your investigation is complete.</p>
            <p>Your personal reader pass:</p>
            <h2>${personalCode}</h2>
            <p>Keep it safe. Your universe awaits.</p>
        </div>

        <button id="continueToWelcome">Continue ✦</button>
    `;

    document.getElementById("continueToWelcome").addEventListener("click", () => {
        card.innerHTML = `
            <p class="eyebrow">✦ ALARAS · YOUR UNIVERSE ✦</p>
            <h1>Before You Enter...</h1>
            <p class="mystery-subtitle">What should we call you?</p>

            <input id="readerName" type="text" placeholder="Your name...">

            <button id="welcomeButton">Enter my universe ✦</button>
            <p id="nameFeedback"></p>
        `;

        document.getElementById("welcomeButton").addEventListener("click", () => {
            const name = document.getElementById("readerName").value.trim();
            const feedback = document.getElementById("nameFeedback");

            if (!name) {
                feedback.textContent = "Please enter your name first.";
                return;
            }

            localStorage.setItem("alarasUsername", name);

            card.innerHTML = `
                <p class="eyebrow">✦ ALARAS ✦</p>
                <h1>Welcome, ${name}!</h1>
                <p class="mystery-subtitle">
                    Your universe is waiting. Your story begins here.
                </p>
                <p>✨ Welcome to ALARAS ✨</p>
            `;

            setTimeout(() => {
                entrance.style.display = "none";
                document.getElementById("home").scrollIntoView({
                    behavior: "smooth"
                });
            }, 2500);
        });
    });
  }
})();