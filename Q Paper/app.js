const uploadForm = document.getElementById('uploadForm');
const messageDiv = document.getElementById('message');
const papersList = document.getElementById('papersList');
const breadcrumbs = document.getElementById('breadcrumbs');
const STORAGE_KEY = 'questionPapers';
function getPapers() {
  const papers = localStorage.getItem(STORAGE_KEY);
  return papers ? JSON.parse(papers) : [];
}
function savePapers(papers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
}
// Upload Page Logic
if (uploadForm) {
  uploadForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const college = e.target.college.value.trim();
    const department = e.target.department.value.trim();
    const academicYear = e.target.academicYear.value.trim();
    const subject = e.target.subject.value.trim();
    const exam = e.target.exam.value.trim();
    const yearMonth = e.target.yearMonth.value.trim();
    const fileInput = e.target.file;
    if (fileInput.files.length === 0) {
      showMessage('Please select a PDF file.', 'error');
      return;
    }
    const file = fileInput.files[0];
    if (file.type !== 'application/pdf') {
      showMessage('Only PDF files are allowed.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      const papers = getPapers();
      papers.push({
        id: Date.now(),
        college,
        department,
        academicYear,
        subject,
        exam,
        yearMonth,
        fileName: file.name,
        fileData: reader.result,
      });
      savePapers(papers);
      showMessage('✅ Upload successful!', 'success');
      uploadForm.reset();
    };
    reader.readAsDataURL(file);
  });
}
function showMessage(text, type) {
  if (messageDiv) {
    messageDiv.textContent = text;
    messageDiv.style.color = type === 'success' ? 'green' : 'red';
  }
}
// View Page Logic
if (papersList) {
  renderColleges();
}
function renderColleges() {
  const papers = getPapers();
  const colleges = [...new Set(papers.map(p => p.college))];
  papersList.innerHTML = '';
  breadcrumbs.innerHTML = `<a href="#" onclick="renderColleges()">Colleges</a>`;
  if (colleges.length === 0) {
    papersList.innerHTML = '<p>No colleges found.</p>';
    return;
  }
  const listHtml = colleges.map(c =>
    `<div class="list-container">
      <h3 onclick="renderDepartments('${c}')">${c}</h3>
    </div>`
  ).join('');
  papersList.innerHTML = listHtml;
}
function renderDepartments(college) {
  const papers = getPapers().filter(p => p.college === college);
  const departments = [...new Set(papers.map(p => p.department))];
  papersList.innerHTML = '';
  breadcrumbs.innerHTML = `
    <a href="#" onclick="renderColleges()">Colleges</a>
    <span>/</span>
    <a href="#" onclick="renderDepartments('${college}')">${college}</a>
  `;
  if (departments.length === 0) {
    papersList.innerHTML = '<p>No departments found for this college.</p>';
    return;
  }
  const listHtml = departments.map(d =>
    `<div class="list-container">
      <h4 onclick="renderAcademicYears('${college}', '${d}')">${d}</h4>
    </div>`
  ).join('');
  papersList.innerHTML = listHtml;
}
function renderAcademicYears(college, department) {
  const papers = getPapers().filter(p => p.college === college && p.department === department);
  const academicYears = [...new Set(papers.map(p => p.academicYear))];
  papersList.innerHTML = '';
  breadcrumbs.innerHTML = `
    <a href="#" onclick="renderColleges()">Colleges</a>
    <span>/</span>
    <a href="#" onclick="renderDepartments('${college}')">${college}</a>
    <span>/</span>
    <a href="#" onclick="renderAcademicYears('${college}', '${department}')">${department}</a>
  `;
  if (academicYears.length === 0) {
    papersList.innerHTML = '<p>No academic years found for this department.</p>';
    return;
  }
  const listHtml = academicYears.map(ay =>
    `<div class="list-container">
      <h4 onclick="renderSubjects('${college}', '${department}', '${ay}')">${ay}</h4>
    </div>`
  ).join('');
  papersList.innerHTML = listHtml;
}
function renderSubjects(college, department, academicYear) {
  const papers = getPapers().filter(p => p.college === college && p.department === department && p.academicYear === academicYear);
  const subjects = [...new Set(papers.map(p => p.subject))];
  papersList.innerHTML = '';
  breadcrumbs.innerHTML = `
    <a href="#" onclick="renderColleges()">Colleges</a>
    <span>/</span>
    <a href="#" onclick="renderDepartments('${college}')">${college}</a>
    <span>/</span>
    <a href="#" onclick="renderAcademicYears('${college}', '${department}')">${department}</a>
    <span>/</span>
    <a href="#" onclick="renderSubjects('${college}', '${department}', '${academicYear}')">${academicYear}</a>
  `;
  if (subjects.length === 0) {
    papersList.innerHTML = '<p>No subjects found for this academic year.</p>';
    return;
  }
  const listHtml = subjects.map(s =>
    `<div class="list-container">
      <h4 onclick="renderPaperDetails('${college}', '${department}', '${academicYear}', '${s}')">${s}</h4>
    </div>`
  ).join('');
  papersList.innerHTML = listHtml;
}
function renderPaperDetails(college, department, academicYear, subject) {
  const papers = getPapers().filter(p => p.college === college && p.department === department && p.academicYear === academicYear && p.subject === subject);
  papersList.innerHTML = '';
  breadcrumbs.innerHTML = `
    <a href="#" onclick="renderColleges()">Colleges</a>
    <span>/</span>
    <a href="#" onclick="renderDepartments('${college}')">${college}</a>
    <span>/</span>
    <a href="#" onclick="renderAcademicYears('${college}', '${department}')">${department}</a>
    <span>/</span>
    <a href="#" onclick="renderSubjects('${college}', '${department}', '${academicYear}')">${academicYear}</a>
    <span>/</span>
    <span>${subject}</span>
  `;
  if (papers.length === 0) {
    papersList.innerHTML = '<p>No papers found for this subject.</p>';
    return;
  }
  const listHtml = papers.map(p => `
    <div class="paper-item">
      <h5>${p.exam} (${p.yearMonth})</h5>
      <a href="${p.fileData}" download="${p.fileName}">⬇️ Download PDF</a>

    </div>
  `).join('');
  papersList.innerHTML = listHtml;
}
function deletePaper(id, college, department, academicYear, subject) {
  let papers = getPapers();
  papers = papers.filter((p) => p.id !== id);
  savePapers(papers);
  renderPaperDetails(college, department, academicYear, subject);

}
