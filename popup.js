import { compareFiles, gitDiff } from "./compare.js";

document.getElementById("compareBtn").addEventListener("click", async () => {
  const file1 = document.getElementById("file1").files[0];
  const file2 = document.getElementById("file2").files[0];
  const fileType = document.getElementById("fileType").value;
  const useGitStyle = document.getElementById("gitStyle").checked;
  const outputEl = document.getElementById("output");

  outputEl.innerHTML = ""; // Clear old output

  if (!file1 || !file2) {
    outputEl.innerHTML = "<span class='removed'>Please select both files.</span>";
    return;
  }

  outputEl.innerHTML = "<div>Comparing...</div>";

  try {
    const content1 = await file1.text();
    const content2 = await file2.text();

    let result;
    if (useGitStyle) {
      result = gitDiff(content1, content2);
      outputEl.innerHTML = result;
    } else {
      result = compareFiles(content1, content2, fileType);
      outputEl.textContent = result || "No differences found.";
    }
  } catch (error) {
    outputEl.innerHTML = `<div class='removed'>Error during comparison: ${error.message}</div>`;
  }
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const useGitStyle = document.getElementById("gitStyle").checked;
  const output = document.getElementById("output");
  const text = useGitStyle ? output.innerText : output.textContent;

  if (!text.trim()) {
    alert("No comparison result to download.");
    return;
  }

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "comparison_result.txt";
  a.click();
  URL.revokeObjectURL(url);
});
