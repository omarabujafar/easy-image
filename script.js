let selectedFormat = 'PNG'; // Default format
let uploadedFiles = []; // Store uploaded files

document.getElementById('upload-area').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', handleFiles);

document.getElementById('upload-area').addEventListener('dragover', (event) => {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('upload-area').classList.add('border-teal-500');
});

document.getElementById('upload-area').addEventListener('dragleave', (event) => {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('upload-area').classList.remove('border-teal-500');
});

document.getElementById('upload-area').addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('upload-area').classList.remove('border-teal-500');
  const files = event.dataTransfer.files;
  handleFiles({ target: { files } });
});

function handleFiles(event) {
  const files = event.target.files;
  const fileList = document.getElementById('file-list');
  for (const file of files) {
    uploadedFiles.push(file); // Store the file
    const fileItem = document.createElement('div');
    fileItem.className = 'flex flex-col items-start justify-between p-2 border-b border-gray-700';
    fileItem.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)</span>
        <button class="remove-file text-red-500"><i class="fas fa-trash"></i></button>
      </div>
      <div class="w-full bg-gray-600 rounded-full h-2.5 mt-2">
        <div class="bg-teal-500 h-2.5 rounded-full progress-bar" style="width: 0%"></div>
      </div>
    `;
    fileList.appendChild(fileItem);
  }
  addRemoveFileListeners();
}

function addRemoveFileListeners() {
  document.querySelectorAll('.remove-file').forEach((button, index) => {
    button.addEventListener('click', () => {
      const fileItem = button.closest('div');
      const fileName = fileItem.querySelector('span').innerText.split(' ')[0];
      uploadedFiles = uploadedFiles.filter(file => file.name !== fileName); // Remove the file from the array
      fileItem.remove(); // Remove the file item from the list
    });
  });
}

document.querySelectorAll('.format-option').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.format-option').forEach(btn => btn.classList.remove('bg-teal-500', 'text-white'));
    button.classList.add('bg-teal-500', 'text-white');
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
    // Simulate conversion process
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

document.getElementById('download-all').addEventListener('click', () => {
  alert('Download all files as ZIP.');
});