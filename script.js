document.getElementById('processBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', 'K82488128788957');
    formData.append('isTable', 'true');

    try {
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.IsErroredOnProcessing) {
            alert('Error processing image: ' + result.ErrorMessage[0]);
            return;
        }

        const parsedText = result.ParsedResults[0].ParsedText;
        const tableData = parseTable(parsedText);

        displayTable(tableData);
        generateExcel(tableData);
    } catch (error) {
        console.error('Error:', error);
    }
});

function parseTable(text) {
    const rows = text.trim().split('\n');
    const tableData = [];
    console.log(rows);          
    rows.forEach(row => {
        const columns = row.split('\t');
        const enroll = columns[0];
        const attendanceData = columns.slice(2);
        const totalAttendance = attendanceData.filter(att => att.trim().toUpperCase() === 'P').length;
        tableData.push({ enroll, totalAttendance });
    });

    return tableData;
}

function displayTable(data) {
    const output = document.getElementById('output');
    const table = document.createElement('table');

    const headerRow = document.createElement('tr');
    const headers = ['Enrollment Number', 'Total Attendance'];
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    data.forEach(row => {
        const tr = document.createElement('tr');
        const tdEnroll = document.createElement('td');
        tdEnroll.textContent = row.enroll;
        const tdAttendance = document.createElement('td');
        tdAttendance.textContent = row.totalAttendance;

        tr.appendChild(tdEnroll);
        tr.appendChild(tdAttendance);
        table.appendChild(tr);
    });

    output.innerHTML = '';
    output.appendChild(table);
}

function generateExcel(data) {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data, { header: ['enroll', 'totalAttendance'] });
    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    // Write workbook to file and trigger download
    XLSX.writeFile(wb, 'attendance.xlsx');
}