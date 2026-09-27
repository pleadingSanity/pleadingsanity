// games.js – Pleading Sanity Mini Game Links
// Renders game cards into #game-list. Our own games only: no ads,
// no tracking, and they keep working offline once the app is installed.

document.addEventListener("DOMContentLoaded", () => {
  const gameContainer = document.getElementById("game-list");

  const games = [
    {
      title: "🔢 Number Nebula",
      description: "Boost your brainpower with calm, levelled maths challenges.",
      url: "/number-nebula.html",
    },
    {
      title: "🌊 Memory Ocean",
      description: "Flip and match in a peaceful memory game. No timers, no pressure.",
      url: "/memory-ocean.html",
    },
    {
      title: "🌈 Pattern Galaxy",
      description: "Spot the shapes and flows — trains focus and intuition.",
      url: "/pattern-galaxy.html",
    },
    {
      title: "🥁 Rhythm Resonance",
      description: "Listen, repeat and match the beat. Great for settling busy minds.",
      url: "/rhythm-resonance.html",
    }
  ];

  if (gameContainer) {
    games.forEach(game => {
      const card = document.createElement("article");
      card.className = "cosmic-card game-card";
      const title = document.createElement("h3");
      title.textContent = game.title;
      const desc = document.createElement("p");
      desc.textContent = game.description;
      const link = document.createElement("a");
      link.className = "btn btn-primary";
      link.href = game.url;
      link.textContent = "Play Now";
      card.append(title, desc, link);
      gameContainer.appendChild(card);
    });
  }
});
