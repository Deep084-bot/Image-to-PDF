const imageUpload = document.getElementById('imageUpload');
const preview = document.getElementById('preview');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const orientationSelect = document.getElementById('orientation');
const sizeSelect = document.getElementById('size');
const themeToggle = document.getElementById('themeToggle');
const uploadArea = document.getElementById('upload-area');

const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const pdfPreview = document.getElementById('pdfPreview');

let images = [];
let generatedPDF = null;

// Theme
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
});

// Upload
imageUpload.addEventListener('change', handleFiles);
uploadArea.addEventListener('dragover', (e) => e.preventDefault());
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  handleFiles({ target: { files: e.dataTransfer.files } });
});

function handleFiles(event) {
  const files = event.target.files;
  preview.innerHTML = '';
  images = [];

  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        images.push(e.target.result);
        renderImages();
      };
      reader.readAsDataURL(file);
    }
  });
}

function renderImages() {
  preview.innerHTML = '';
  images.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.draggable = true;

    img.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', i);
    });

    img.addEventListener('drop', (e) => {
      e.preventDefault();
      const from = e.dataTransfer.getData('text/plain');
      const to = i;
      [images[from], images[to]] = [images[to], images[from]];
      renderImages();
    });

    img.addEventListener('dragover', (e) => e.preventDefault());

    preview.appendChild(img);
  });
}

// Generate and preview PDF
convertBtn.addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const orientation = orientationSelect.value;
  const pageSize = sizeSelect.value;

  const pdf = new jsPDF({ orientation, format: pageSize });

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage();
    const img = new Image();
    img.src = images[i];
    await new Promise((resolve) => {
      img.onload = () => {
        const w = pdf.internal.pageSize.getWidth();
        const h = pdf.internal.pageSize.getHeight();
        pdf.addImage(images[i], 'JPEG', 10, 10, w - 20, h - 20);
        resolve();
      };
    });
  }

  generatedPDF = pdf;
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);

  pdfPreview.src = url;
  modal.classList.remove('hidden');
});

// Download
downloadBtn.addEventListener('click', () => {
  if (generatedPDF) {
    generatedPDF.save('converted.pdf');
  }
});

closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
  pdfPreview.src = '';
});
