document.getElementById('compareBtn').addEventListener('click', async () => {
  const file1 = document.getElementById('file1').files[0];
  const file2 = document.getElementById('file2').files[0];
  const type = document.getElementById('fileType').value;
  const resultBox = document.getElementById('result');

  if (!file1 || !file2) {
    resultBox.textContent = 'Please select two files.';
    return;
  }

  const text1 = await file1.text();
  const text2 = await file2.text();
  let diffText = '';

  try {
    if (type === 'json') {
      const obj1 = JSON.parse(text1);
      const obj2 = JSON.parse(text2);
      const delta = jsondiffpatch.diff(obj1, obj2);
      diffText = JSON.stringify(delta, null, 2);
    } else if (type === 'csv') {
      const rows1 = Papa.parse(text1, { header: true }).data;
      const rows2 = Papa.parse(text2, { header: true }).data;
      diffText = compareCSV(rows1, rows2);
    } else if (type === 'xml') {
      diffText = compareXML(text1, text2);
    }
    resultBox.textContent = diffText || 'No differences found.';
    document.getElementById('downloadBtn').style.display = 'block';
  } catch (e) {
    resultBox.textContent = 'Error: ' + e.message;
  }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const blob = new Blob([document.getElementById('result').textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diff_report.txt';
  a.click();
  URL.revokeObjectURL(url);
});

function compareCSV(arr1, arr2) {
  const only1 = arr1.filter(a => !JSON.stringify(arr2).includes(JSON.stringify(a)));
  const only2 = arr2.filter(a => !JSON.stringify(arr1).includes(JSON.stringify(a)));
  return `Only in File 1:\n${JSON.stringify(only1, null, 2)}\n\nOnly in File 2:\n${JSON.stringify(only2, null, 2)}`;
}

function compareXML(xml1, xml2) {
  const parser = new DOMParser();
  const xmlDoc1 = parser.parseFromString(xml1, "application/xml");
  const xmlDoc2 = parser.parseFromString(xml2, "application/xml");

  // Check for errors in XML parsing
  if (xmlDoc1.getElementsByTagName('parsererror').length || xmlDoc2.getElementsByTagName('parsererror').length) {
    return 'Error: Invalid XML';
  }

  const json1 = xmlToJson(xmlDoc1);
  const json2 = xmlToJson(xmlDoc2);

  // Compare both XML objects
  const delta = jsondiffpatch.diff(json1, json2);
  return JSON.stringify(delta, null, 2) || "No differences found.";
}

function xmlToJson(xml) {
  const obj = {};
  if (xml.nodeType === 1) { // Element node
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) { // Text node
    obj["#text"] = xml.nodeValue;
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      if (typeof(obj[nodeName]) === "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof(obj[nodeName].push) === "undefined") {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}
