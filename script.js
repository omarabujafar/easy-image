let selectedFormat = 'PNG'; // Default format
let uploadedFiles = []; // Store uploaded files

// Trigger file input click when upload area is clicked
document.getElementById('uploadArea').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

// Handle file input change event
document.getElementById('fileInput').addEventListener('change', handleFiles);

// Add dragover event to upload area
document.getElementById('uploadArea').addEventListener('dragover', (event) => {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('uploadArea').classList.add('dragover');
});

// Remove dragover class when dragging leaves the upload area
document.getElementById('uploadArea').addEventListener('dragleave', (event) => {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('uploadArea').classList.remove('dragover');
});

// Handle file drop event
document.getElementById('uploadArea').addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('uploadArea').classList.remove('dragover');
  const files = event.dataTransfer.files;
  handleFiles({ target: { files } });
});

// Function to handle file selection
function handleFiles(event) {
  const files = event.target.files;
  const fileList = document.getElementById('fileList');
  for (const file of files) {
    uploadedFiles.push(file); // Store the file
    const fileItem = document.createElement('div');
    fileItem.className = 'flex flex-col items-start justify-between p-2 border-b border-gray-700';
    fileItem.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)</span>
        <button class="removeFile text-red-500"><i class="fas fa-trash"></i></button>
      </div>
      <div class="w-full bg-gray-600 rounded-full h-2.5 mt-2">
        <div class="bg-teal-500 h-2.5 rounded-full progressBar" style="width: 0%"></div>
      </div>
    `;
    fileList.appendChild(fileItem);
  }
  addRemoveFileListeners();
}

// Function to add event listeners to remove file buttons
function addRemoveFileListeners() {
  const removeFileButtons = document.querySelectorAll('.removeFile');
  removeFileButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      uploadedFiles.splice(index, 1); // Remove the file from the array
      button.parentElement.parentElement.remove(); // Remove the file item from the list
    });
  });
}

document.querySelectorAll('.format-option').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.format-option').forEach(btn => btn.classList.remove('bg-teal-500', 'text-white', 'selected'));
    button.classList.add('bg-teal-500', 'text-white', 'selected');
    selectedFormat = button.getAttribute('data-format');
  });
});

document.getElementById('more-button').addEventListener('click', () => {
  const dropdown = document.getElementById('more-dropdown');
  dropdown.classList.toggle('show');
});

function adjustFormatOptions() {
  const formatSelection = document.getElementById('format-selection');
  const moreButton = document.getElementById('more-button');
  const formatOptions = document.querySelectorAll('.format-option');
  let totalWidth = 0;
  formatOptions.forEach(option => {
    totalWidth += option.offsetWidth + 8; // 8px for the gap
  });
  if (totalWidth > formatSelection.offsetWidth) {
    moreButton.classList.remove('hidden');
  } else {
    moreButton.classList.add('hidden');
  }
}

window.addEventListener('resize', adjustFormatOptions);
window.addEventListener('load', adjustFormatOptions);

document.getElementById('start-conversion').addEventListener('click', () => {
  const fileList = document.getElementById('file-list');
  const files = fileList.children;
  if (files.length === 0) {
    alert('No files to convert.');
    return;
  }
  const zip = new JSZip();
  let completedConversions = 0;

  for (let i = 0; i < uploadedFiles.length; i++) {
    const file = uploadedFiles[i];
    const progressBar = files[i].querySelector('.progress-bar');
    const reader = new FileReader();
    reader.onload = function(e) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
          clearInterval(interval);
          const originalFileName = file.name.split('.')[0];
          const newFileName = `${originalFileName}-${selectedFormat.toLowerCase()}.${selectedFormat.toLowerCase()}`;
          if (uploadedFiles.length === 1) {
            downloadFile(newFileName, e.target.result);
            clearFileList();
          } else {
            zip.file(newFileName, e.target.result.split(',')[1], { base64: true });
            completedConversions++;
            if (completedConversions === uploadedFiles.length) {
              zip.generateAsync({ type: 'blob' }).then(function(content) {
                saveAs(content, 'converted-images.zip');
                clearFileList();
              });
            }
          }
        }
      }, 200);
    };
    reader.readAsDataURL(file);
  }
});

function clearFileList() {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';
  uploadedFiles = [];
}

function downloadFile(filename, dataUrl) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Dark Mode/Light Mode Toggle
const toggleMode = () => {
  const body = document.body;
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  }
};

document.getElementById('theme-toggle').addEventListener('change', toggleMode);

// Load theme preference from localStorage
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
  document.body.classList.add('light-mode');
  document.getElementById('theme-toggle').checked = true;
} else {
  document.body.classList.add('dark-mode');
}