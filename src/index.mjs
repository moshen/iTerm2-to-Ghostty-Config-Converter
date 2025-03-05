const Plist = await Module();
const getOutput = Plist.cwrap("run", "string", ["number"]);

/**
 * @param {Uint8Array} bytes - Bytes representing xml
 * @returns {Document}
 */
function getXmlFromBytes(bytes) {
  const text = new TextDecoder().decode(bytes);
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");
  return xml;
}

/**
 * @param {Uint8Array} bytes - Bytes representing some kind of plist
 * @returns {Uint8Array} Bytes representing xml plist
 */
function getPlistXmlBytes(bytes) {
  Plist.FS.writeFile("/data.plist", bytes);
  const res = getOutput(0);

  if (res !== "") {
    throw new Error(res);
  }

  return Plist.FS.readFile("/data.output");
}

/**
 * @param {Uint8Array} bytes - Bytes representing a json string
 * @returns {object} JSON object
 */
function getPlistJson(bytes) {
  Plist.FS.writeFile("/data.plist", bytes);
  const res = getOutput(1);

  if (res !== "") {
    throw new Error(res);
  }

  const output = new TextDecoder().decode(Plist.FS.readFile("/data.output"));
  const outJson = JSON.parse(output);
  return outJson;
}

/**
 * @param {number} value
 * @returns {string}
 */
function floatToHex(value) {
  return Math.round(value * 255)
    .toString(16)
    .padStart(2, "0");
}

function rgbToHex(color) {
  return `#${floatToHex(color["Red Component"])}${floatToHex(color["Green Component"])}${floatToHex(color["Blue Component"])}`;
}

class Config {
  static stringFromJson(jsonObj) {
    return new Config(jsonObj).getConfigString();
  }

  constructor(jsonObj) {
    this.jsonObj = jsonObj;
  }

  getConfigString() {
    const fields = [
      "Normal Font",
      "Horizontal Spacing",
      "Vertical Spacing",
      "Use Bright Bold",
      "Transparency",
      "Blur",
      "Ansi 0 Color",
      "Ansi 1 Color",
      "Ansi 2 Color",
      "Ansi 3 Color",
      "Ansi 4 Color",
      "Ansi 5 Color",
      "Ansi 6 Color",
      "Ansi 7 Color",
      "Ansi 8 Color",
      "Ansi 9 Color",
      "Ansi 10 Color",
      "Ansi 11 Color",
      "Ansi 12 Color",
      "Ansi 13 Color",
      "Ansi 14 Color",
      "Ansi 15 Color",
      "Background Color",
      "Foreground Color",
      "Cursor Color",
      "Selection Color",
      "Selected Text Color",
    ];

    const configString = [];
    for (const field of fields) {
      if (Object.hasOwn(this.jsonObj, field)) {
        const fieldConfig = this[field]();
        if (fieldConfig !== "") {
          configString.push(fieldConfig);
        }
      }
    }

    return `${configString.join("\n")}\n`;
  }

  "Normal Font"() {
    const fontRecord = this.jsonObj["Normal Font"];
    const match = fontRecord.match(/^(.+) ([0-9]+)$/);
    if (!match) {
      return `# Unknown font\n#font-family = ${fontRecord}`;
    }

    let fontName = match[1];
    const fontSize = match[2];

    // Check if exact font name is in recent fonts
    if (!this.jsonObj["Recent Fonts"].includes(fontName)) {
      // Try to find the closest match
      const fontNameNoSpaces = fontName.replace(/\s/g, "");
      fontName = this.jsonObj["Recent Fonts"].reduce(
        (memo, font) => {
          const fontNoSpaces = font.replace(/\s/g, "");
          let i = 0;
          for (; i < fontNoSpaces.length && i < fontNameNoSpaces.length; i++) {
            if (fontNoSpaces[i] !== fontNameNoSpaces[i]) {
              break;
            }
          }

          if (i > memo.i) {
            return { font, i };
          }

          return memo;
        },
        { i: -1 },
      ).font;
    }

    return `font-family = ${fontName}\nfont-size = ${fontSize}`;
  }
  "Horizontal Spacing"() {
    const spacing = this.jsonObj["Horizontal Spacing"];

    if (spacing === 1) {
      // We don't want to adjust the spacing
      return "";
    }

    return `adjust-cell-width = ${(spacing * 100) - 100}%`;
  }
  "Vertical Spacing"() {
    const spacing = this.jsonObj["Vertical Spacing"];

    if (spacing === 1) {
      // We don't want to adjust the spacing
      return "";
    }

    return `adjust-cell-height = ${(spacing * 100) - 100}%`;
  }
  "Use Bright Bold"() {
    return `bold-is-bright = ${this.jsonObj["Use Bright Bold"]}`;
  }
  "Transparency"() {
    return `background-opacity = ${1 - +this.jsonObj.Transparency}`;
  }
  "Blur"() {
    if (this.jsonObj.Blur) {
      return `background-blur = ${Number.parseInt(this.jsonObj["Blur Radius"], 10)}`;
    }

    return "background-blur = false";
  }
  "Ansi 0 Color"() {
    return `palette = 0=${rgbToHex(this.jsonObj["Ansi 0 Color"])}`;
  }
  "Ansi 1 Color"() {
    return `palette = 1=${rgbToHex(this.jsonObj["Ansi 1 Color"])}`;
  }
  "Ansi 2 Color"() {
    return `palette = 2=${rgbToHex(this.jsonObj["Ansi 2 Color"])}`;
  }
  "Ansi 3 Color"() {
    return `palette = 3=${rgbToHex(this.jsonObj["Ansi 3 Color"])}`;
  }
  "Ansi 4 Color"() {
    return `palette = 4=${rgbToHex(this.jsonObj["Ansi 4 Color"])}`;
  }
  "Ansi 5 Color"() {
    return `palette = 5=${rgbToHex(this.jsonObj["Ansi 5 Color"])}`;
  }
  "Ansi 6 Color"() {
    return `palette = 6=${rgbToHex(this.jsonObj["Ansi 6 Color"])}`;
  }
  "Ansi 7 Color"() {
    return `palette = 7=${rgbToHex(this.jsonObj["Ansi 7 Color"])}`;
  }
  "Ansi 8 Color"() {
    return `palette = 8=${rgbToHex(this.jsonObj["Ansi 8 Color"])}`;
  }
  "Ansi 9 Color"() {
    return `palette = 9=${rgbToHex(this.jsonObj["Ansi 9 Color"])}`;
  }
  "Ansi 10 Color"() {
    return `palette = 10=${rgbToHex(this.jsonObj["Ansi 10 Color"])}`;
  }
  "Ansi 11 Color"() {
    return `palette = 11=${rgbToHex(this.jsonObj["Ansi 11 Color"])}`;
  }
  "Ansi 12 Color"() {
    return `palette = 12=${rgbToHex(this.jsonObj["Ansi 12 Color"])}`;
  }
  "Ansi 13 Color"() {
    return `palette = 13=${rgbToHex(this.jsonObj["Ansi 13 Color"])}`;
  }
  "Ansi 14 Color"() {
    return `palette = 14=${rgbToHex(this.jsonObj["Ansi 14 Color"])}`;
  }
  "Ansi 15 Color"() {
    return `palette = 15=${rgbToHex(this.jsonObj["Ansi 15 Color"])}`;
  }
  "Background Color"() {
    return `background = ${rgbToHex(this.jsonObj["Background Color"])}`;
  }
  "Foreground Color"() {
    return `foreground = ${rgbToHex(this.jsonObj["Foreground Color"])}`;
  }
  "Cursor Color"() {
    return `cursor-color = ${rgbToHex(this.jsonObj["Cursor Color"])}`;
  }
  "Selection Color"() {
    return `selection-background = ${rgbToHex(this.jsonObj["Selection Color"])}`;
  }
  "Selected Text Color"() {
    return `selection-foreground = ${rgbToHex(this.jsonObj["Selected Text Color"])}`;
  }
}

const aboutLinkElement = document.getElementById("aboutLink");
const aboutTextElement = document.getElementById("aboutText");
aboutLinkElement.addEventListener("click", () => {
  if (aboutTextElement.classList.contains("hidden")) {
    aboutLinkElement.textContent = "→ About";
    aboutTextElement.classList.remove("hidden");
  } else {
    aboutLinkElement.textContent = "← About";
    aboutTextElement.classList.add("hidden");
  }
});

const configNameElement = document.getElementById("configName");
const profileSectionElement = document.getElementById("profileSection");
const outputElement = document.getElementById("output");
const downloadElement = document.getElementById("downloadButton");
const errorMessageElement = document.getElementById("errorMessage");

const BPLIST_HEADER = new Uint8Array([
  0x62, 0x70, 0x6c, 0x69, 0x73, 0x74, 0x30, 0x30,
]);
/**
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
function isBplist(bytes) {
  for (let i = 0; i < BPLIST_HEADER.length; i++) {
    if (bytes[i] !== BPLIST_HEADER[i]) {
      return false;
    }
  }
  return true;
}

/**
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
function isPlistXml(bytes) {
  try {
    const xml = getXmlFromBytes(bytes);
    return xml.doctype.name === "plist";
  } catch (err) {
    return false;
  }
}

/**
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
function isJson(bytes) {
  try {
    JSON.parse(new TextDecoder().decode(bytes));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * @param {Document} xml
 * @returns { profileNames: string[], colorSchemeNames: string[] }
 */
function getProfileNames(xml) {
  const profileNames = [];
  const colorSchemeNames = [];

  // Check if profile, get profile names
  for (const key of xml.querySelectorAll("plist > dict > key")) {
    if (key.textContent === "New Bookmarks") {
      // <array> node
      const profiles = key.nextElementSibling;
      for (const profile of profiles.children) {
        for (const profileKey of profile.querySelectorAll(":scope > key")) {
          if (profileKey.textContent === "Name") {
            const profileName = profileKey.nextElementSibling.textContent;
            profileNames.push(profileName);
            break;
          }
        }
      }
    }

    if (key.textContent === "Custom Color Presets") {
      // <dict> node
      const colorPresents = key.nextElementSibling;
      for (const colorKey of colorPresents.querySelectorAll(":scope > key")) {
        colorSchemeNames.push(colorKey.textContent);
      }
    }
  }

  return { profileNames, colorSchemeNames };
}

/**
 * @param {Element} xmlElement
 * @returns {string}
 */
function templatePlistXml(xmlElement) {
  const xml = new XMLSerializer().serializeToString(xmlElement);
  const encoder = new TextEncoder();
  return encoder.encode(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
${xml}
</plist>
`);
}

/**
 * @param {Document} xml - iTerm2 plist xml
 * @returns {string[]} Array of recent fonts from a profile
 */
function getRecentFonts(xml) {
  const recentFonts = [];
  for (const key of xml.querySelectorAll("plist > dict > key")) {
    if (key.textContent === "NoSyncBFPRecents") {
      const recentFontsArray = key.nextElementSibling;
      for (const font of recentFontsArray.children) {
        recentFonts.push(font.textContent);
      }
      return recentFonts;
    }
  }

  // Didn't find any recent fonts
  return recentFonts;
}

/**
 * @param {Element} xml
 * @param {string} profileName
 * @returns {object}
 */
function getProfileJson(xml, profileName) {
  for (const key of xml.querySelectorAll("plist > dict > key")) {
    if (key.textContent === "New Bookmarks") {
      // <array> node
      const profiles = key.nextElementSibling;
      for (const profile of profiles.children) {
        for (const profileKey of profile.querySelectorAll(":scope > key")) {
          if (
            profileKey.textContent === "Name" &&
            profileKey.nextElementSibling.textContent === profileName
          ) {
            const obj = getPlistJson(templatePlistXml(profile));
            obj["Recent Fonts"] = getRecentFonts(xml);
            return obj;
          }
        }
      }
    }
  }

  throw new Error("Profile not found");
}

/**
 * @param {Element} xml
 * @param {string} colorSchemeName
 * @returns {object}
 */
function getColorSchemeJson(xml, colorSchemeName) {
  for (const key of xml.querySelectorAll("plist > dict > key")) {
    if (key.textContent === "Custom Color Presets") {
      // <dict> node
      const colorPresents = key.nextElementSibling;
      for (const colorKey of colorPresents.querySelectorAll(":scope > key")) {
        if (colorKey.textContent === colorSchemeName) {
          return getPlistJson(templatePlistXml(colorKey.nextElementSibling));
        }
      }
    }
  }

  throw new Error("Color Scheme not found");
}

/**
 * @param {Document} xml
 * @returns {boolean}
 */
function isColorScheme(xml) {
  for (const key of xml.querySelectorAll("plist > dict > key")) {
    if (key.textContent.endsWith("Color")) {
      return true;
    }
  }

  return false;
}

function enableForm() {
  configNameElement.disabled = false;
  outputElement.disabled = false;
  downloadElement.disabled = false;
}

function disableForm() {
  window._currentFile = undefined;
  errorMessageElement.classList.add("hidden");
  configNameElement.disabled = true;
  configNameElement.value = "config";
  profileSectionElement.disabled = true;
  profileSectionElement.innerHTML = "";
  outputElement.disabled = true;
  outputElement.textContent = "";
  downloadElement.disabled = true;
}

const DEFAULT_ERROR_MESSAGE =
  "Error parsing file, please make sure it's a valid iTerm2 config or theme file.";
/**
 * @param {Error} err
 */
function showErrorMsg(err) {
  console.error(err);
  errorMessageElement.textContent = DEFAULT_ERROR_MESSAGE;
  errorMessageElement.classList.remove("hidden");
}

disableForm();

/**
 * @param {File} file
 * @returns {Promise<void>}
 */
async function processFile(file) {
  disableForm();

  try {
    // file is way too big
    if (file.size > 1024 * 1024 * 10) {
      throw new Error("File is too big");
    }

    let bytes = new Uint8Array(await file.arrayBuffer());
    let xml = null;
    let jsonObj = null;

    if (isBplist(bytes)) {
      bytes = getPlistXmlBytes(bytes);
    }

    if (isPlistXml(bytes)) {
      xml = getXmlFromBytes(bytes);

      if (isColorScheme(xml)) {
        jsonObj = getPlistJson(bytes);
        outputElement.textContent = Config.stringFromJson(jsonObj);
        enableForm();
      } else {
        window._currentFile = xml;

        const { profileNames, colorSchemeNames } = getProfileNames(xml);
        if (profileNames.length > 0) {
          const optionGroup = document.createElement("optgroup");
          optionGroup.label = "Profiles";
          profileSectionElement.appendChild(optionGroup);

          for (const name of profileNames) {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            option.dataset.type = "profile";
            optionGroup.appendChild(option);
          }

          profileSectionElement.disabled = false;
        }

        if (colorSchemeNames.length > 0) {
          const optionGroup = document.createElement("optgroup");
          optionGroup.label = "Color Schemes";
          profileSectionElement.appendChild(optionGroup);

          for (const name of colorSchemeNames) {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            option.dataset.type = "colorscheme";
            optionGroup.appendChild(option);
          }

          profileSectionElement.disabled = false;
        }

        if (profileSectionElement.disabled === false) {
          processSelected(profileSectionElement.selectedOptions[0]);
        }
      }
    } else if (isJson(bytes)) {
      jsonObj = JSON.parse(new TextDecoder().decode(bytes));
      outputElement.textContent = Config.stringFromJson(jsonObj);
      enableForm();
    } else {
      // We couldn't parse the file
      throw new Error(DEFAULT_ERROR_MESSAGE);
    }
  } catch (err) {
    showErrorMsg(err);
  }
}

/**
 * @param {HTMLOptionElement} selectedOption
 */
function processSelected(selectedOption) {
  try {
    const type = selectedOption.dataset.type;
    let jsonObj = null;

    if (type === "profile") {
      jsonObj = getProfileJson(window._currentFile, selectedOption.value);
    } else if (type === "colorscheme") {
      jsonObj = getColorSchemeJson(window._currentFile, selectedOption.value);
    }

    outputElement.textContent = Config.stringFromJson(jsonObj);
    enableForm();
  } catch (err) {
    showErrorMsg(err);
  }
}
profileSectionElement.addEventListener("change", (event) => {
  const selectedOption = event.target.selectedOptions[0];
  if (!selectedOption) {
    return;
  }

  processSelected(selectedOption);
});

document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
});
