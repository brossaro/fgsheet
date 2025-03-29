document.getElementById("xmlInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const xmlText = e.target.result;
    loadCharacterXML(xmlText);
  };

  if (file) {
    reader.readAsText(file);
  }
});

function loadCharacterXML(xmlString) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "text/xml");

  const charName = xml.querySelector("root > character > name")?.textContent || "";
  const classNodes = xml.querySelectorAll("root > character > classes > *");
  const background = xml.querySelector("root > character > background")?.textContent || "";
  const alignment = xml.querySelector("root > character > alignment")?.textContent || "";
  const race = xml.querySelector("root > character > race")?.textContent || "";

  const classes = [];
  classNodes.forEach(cls => {
    const name = cls.querySelector("name")?.textContent;
    const level = cls.querySelector("level")?.textContent;
    if (name && level) {
      classes.push(`${name} (${level})`);
    }
  });

  document.getElementById("char-name").textContent = charName;
  document.getElementById("class-level").textContent = classes.join(" / ");
  document.getElementById("background").textContent = background;
  document.getElementById("alignment").textContent = alignment;
  document.getElementById("race").textContent = race;
}