document.getElementById("xmlInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const xmlText = e.target.result;
    const xml = new DOMParser().parseFromString(xmlText, "text/xml");
    renderCharacter(xml);
  };

  if (file) {
    reader.readAsText(file);
  }
});

function renderCharacter(xml) {
  const get = (path) => xml.querySelector(path)?.textContent || "";

  // Infos générales
  document.getElementById("char-name").textContent = get("root > character > name");
  document.getElementById("class-level").textContent = [...xml.querySelectorAll("root > character > classes > *")]
    .map(cls => `${getText(cls, "name")} (${getText(cls, "level")})`).join(" / ");
  document.getElementById("background").textContent = get("root > character > background");
  document.getElementById("race").textContent = get("root > character > race");
  document.getElementById("alignment").textContent = get("root > character > alignment");
  document.getElementById("xp").textContent = get("root > character > exp");

  // Abilities
  const abilities = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
  abilities.forEach(ab => {
    const short = ab.slice(0, 3);
    document.getElementById(`${short}-score`).textContent = get(`root > character > abilities > ${ab} > score`);
    document.getElementById(`${short}-mod`).textContent = formatMod(get(`root > character > abilities > ${ab} > bonus`));
  });

  document.getElementById("inspiration").textContent = get("root > character > inspiration");
  document.getElementById("prof-bonus").textContent = formatMod(get("root > character > profbonus"));

  // Saving Throws
  abilities.forEach(ab => {
    const short = ab.slice(0, 3);
    document.getElementById(`save-${short}`).textContent = formatMod(get(`root > character > abilities > ${ab} > save`));
    document.getElementById(`saveprof-${short}`).checked = get(`root > character > abilities > ${ab} > saveprof`) === "1";
  });

  // Skills - dynamic parsing by reading name field inside each id-XXXXX node
  const skillNodes = xml.querySelectorAll("root > character > skilllist > *");

  skillNodes.forEach(node => {
    const name = node.querySelector("name")?.textContent?.toLowerCase();
    const total = node.querySelector("total")?.textContent || "";
    const prof = node.querySelector("prof")?.textContent === "1";

    if (!name) return;

    // some XML skill names may include spaces, but our IDs use no spaces
    const id = name.replace(/\s+/g, "");

    const span = document.getElementById(`skill-${id}`);
    const checkbox = document.getElementById(`skill-${id}-prof`);

    if (span) span.textContent = formatMod(total);
    if (checkbox) checkbox.checked = prof;
  });

  document.getElementById("passive-perception").textContent = get("root > character > perception");

  // Languages and Other Proficiencies
  const languages = [...xml.querySelectorAll("root > character > languagelist > *")]
  .map(el => el.querySelector("name")?.textContent?.trim())
  .filter(Boolean);

  const proficiencies = [...xml.querySelectorAll("root > character > proficiencylist > *")]
  .map(el => el.querySelector("name")?.textContent?.trim())
  .filter(Boolean);

  // Fusionne et rend unique
  const allProfs = [...new Set([...languages, ...proficiencies])];

  // Affiche dans la fiche
  document.getElementById("proficiencies").textContent = allProfs.join(", ");

// Mid column values
// Armor Class
document.getElementById("ac").textContent = get("root > character > defenses > ac > total");
// Initiative
document.getElementById("initiative").textContent = formatMod(get("root > character > initiative > total"));
// Speed
document.getElementById("speed").textContent = get("root > character > speed > total") + 'ft.';

  document.getElementById("hp-max").textContent = get("root > character > hp > total");
  document.getElementById("hp-current").textContent =  get("root > character > hp > total") - get("root > character > hp > wounds");
  document.getElementById("hp-temp").textContent = get("root > character > hp > temporary");

// Compute Hit Dice string from classes
const hitDiceNodes = xml.querySelectorAll("root > character > classes > *");
const hitDiceParts = [];

hitDiceNodes.forEach(node => {
  const level = node.querySelector("level")?.textContent || "0";
  let die = node.querySelector("hddie")?.textContent || "";

  // Nettoie : ne garde que ce qui suit le dernier 'd'
  const dieValue = die.split("d").pop();  // ex: "dd10" => "10", "d1d12" => "12"

  if (level && dieValue) {
    hitDiceParts.push(`${level}d${dieValue}`);
  }
});

document.getElementById("hit-dice").textContent = hitDiceParts.join(" + ");

  // Death Saves
  const successCount = parseInt(get("root > character > deathsavesuccess"), 10);
  const failCount = parseInt(get("root > character > deathsavefail"), 10);

  for (let i = 1; i <= 3; i++) {
    document.getElementById(`death-success-${i}`).checked = i <= successCount;
    document.getElementById(`death-fail-${i}`).checked = i <= failCount;
  }
  
}

function getText(parent, tag) {
  return parent.querySelector(tag)?.textContent || "";
}

function formatMod(value) {
  return value && !value.startsWith("-") && !value.startsWith("+") ? `+${value}` : value;
}
