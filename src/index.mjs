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

function ghosttyTemplate(colors) {
  return `palette = 0=${colors.ansi0}
palette = 1=${colors.ansi1}
palette = 2=${colors.ansi2}
palette = 3=${colors.ansi3}
palette = 4=${colors.ansi4}
palette = 5=${colors.ansi5}
palette = 6=${colors.ansi6}
palette = 7=${colors.ansi7}
palette = 8=${colors.ansi8}
palette = 9=${colors.ansi9}
palette = 10=${colors.ansi10}
palette = 11=${colors.ansi11}
palette = 12=${colors.ansi12}
palette = 13=${colors.ansi13}
palette = 14=${colors.ansi14}
palette = 15=${colors.ansi15}
background = ${colors.background}
foreground = ${colors.foreground}
cursor-color = ${colors.cursor}
selection-background = ${colors.selection_bg}
selection-foreground = ${colors.selection_fg}
`;
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

function iterm2ghosttyColors(config) {
  return {
    ansi0: rgbToHex(config["Ansi 0 Color"]),
    ansi1: rgbToHex(config["Ansi 1 Color"]),
    ansi2: rgbToHex(config["Ansi 2 Color"]),
    ansi3: rgbToHex(config["Ansi 3 Color"]),
    ansi4: rgbToHex(config["Ansi 4 Color"]),
    ansi5: rgbToHex(config["Ansi 5 Color"]),
    ansi6: rgbToHex(config["Ansi 6 Color"]),
    ansi7: rgbToHex(config["Ansi 7 Color"]),
    ansi8: rgbToHex(config["Ansi 8 Color"]),
    ansi9: rgbToHex(config["Ansi 9 Color"]),
    ansi10: rgbToHex(config["Ansi 10 Color"]),
    ansi11: rgbToHex(config["Ansi 11 Color"]),
    ansi12: rgbToHex(config["Ansi 12 Color"]),
    ansi13: rgbToHex(config["Ansi 13 Color"]),
    ansi14: rgbToHex(config["Ansi 14 Color"]),
    ansi15: rgbToHex(config["Ansi 15 Color"]),
    background: rgbToHex(config["Background Color"]),
    foreground: rgbToHex(config["Foreground Color"]),
    cursor: rgbToHex(config["Cursor Color"]),
    selection_bg: rgbToHex(config["Selection Color"]),
    selection_fg: rgbToHex(config["Selected Text Color"]),
  };
}

function getConfig(obj) {
  return ghosttyTemplate(iterm2ghosttyColors(obj));
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
            return getPlistJson(templatePlistXml(profile));
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
        outputElement.textContent = getConfig(jsonObj);
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
      outputElement.textContent = getConfig(jsonObj);
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

    outputElement.textContent = getConfig(jsonObj);
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
