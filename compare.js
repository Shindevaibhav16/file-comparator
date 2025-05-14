export function compareFiles(content1, content2, type) {
    switch (type) {
      case 'json':
        return compareJSON(content1, content2);
      case 'csv':
        return compareCSV(content1, content2);
      case 'xml':
        return compareXML(content1, content2);
      default:
        return "Unsupported file type.";
    }
  }
  
  function compareJSON(c1, c2) {
    const o1 = JSON.parse(c1);
    const o2 = JSON.parse(c2);
    return diffObjects(o1, o2);
  }
  
  function diffObjects(obj1, obj2, path = "") {
    let result = "";
    for (let key in obj1) {
      const fullPath = path ? `${path}.${key}` : key;
      if (!(key in obj2)) {
        result += `Missing in second file: ${fullPath}\n`;
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        result += `Different at ${fullPath}: ${JSON.stringify(obj1[key])} vs ${JSON.stringify(obj2[key])}\n`;
      }
    }
    for (let key in obj2) {
      if (!(key in obj1)) {
        result += `Missing in first file: ${path ? `${path}.${key}` : key}\n`;
      }
    }
    return result || "No differences found.";
  }
  
  function compareCSV(c1, c2) {
    const rows1 = c1.trim().split('\n');
    const rows2 = c2.trim().split('\n');
    let result = "";
  
    const len = Math.max(rows1.length, rows2.length);
    for (let i = 0; i < len; i++) {
      const row1 = rows1[i] || "";
      const row2 = rows2[i] || "";
      if (row1 !== row2) {
        result += `Line ${i + 1} differs:\nFile1: ${row1 || "MISSING"}\nFile2: ${row2 || "MISSING"}\n\n`;
      }
    }
    return result || "No differences found.";
  }
  
  function compareXML(xml1, xml2) {
    const parser = new DOMParser();
    const doc1 = parser.parseFromString(xml1, "application/xml");
    const doc2 = parser.parseFromString(xml2, "application/xml");
  
    const pretty1 = new XMLSerializer().serializeToString(doc1).replace(/></g, '>\n<').trim().split('\n');
    const pretty2 = new XMLSerializer().serializeToString(doc2).replace(/></g, '>\n<').trim().split('\n');
  
    let result = "";
    const maxLines = Math.max(pretty1.length, pretty2.length);
    for (let i = 0; i < maxLines; i++) {
      const line1 = pretty1[i] || "";
      const line2 = pretty2[i] || "";
      if (line1 !== line2) {
        result += `Line ${i + 1} differs:\nFile1: ${line1}\nFile2: ${line2}\n\n`;
      }
    }
  
    return result || "No differences found.";
  }
  
  // 🔁 Git-style diff
  export function gitDiff(content1, content2) {
    const a = content1.split('\n');
    const b = content2.split('\n');
    let result = "";
  
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      const line1 = a[i] || "";
      const line2 = b[i] || "";
  
      if (line1 === line2) {
        result += `<div class="unchanged">  ${escapeHtml(line1)}</div>`;
      } else {
        if (line1 && !line2) {
          result += `<div class="removed">- ${escapeHtml(line1)}</div>`;
        } else if (!line1 && line2) {
          result += `<div class="added">+ ${escapeHtml(line2)}</div>`;
        } else {
          result += diffWords(line1, line2);
        }
      }
    }
    return result || "<div class='unchanged'>No differences found.</div>";
  }
  
  function diffWords(line1, line2) {
    const words1 = line1.split(/(\s+)/); // include spaces
    const words2 = line2.split(/(\s+)/);
    let output1 = "", output2 = "";
  
    const len = Math.max(words1.length, words2.length);
    for (let i = 0; i < len; i++) {
      const w1 = words1[i] || "";
      const w2 = words2[i] || "";
      if (w1 === w2) {
        output1 += escapeHtml(w1);
        output2 += escapeHtml(w2);
      } else {
        if (w1) output1 += `<span class="removed">${escapeHtml(w1)}</span>`;
        if (w2) output2 += `<span class="added">${escapeHtml(w2)}</span>`;
      }
    }
  
    return `<div class="removed">- ${output1}</div><div class="added">+ ${output2}</div>`;
  }
  
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
  
  
