document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        alert('Please upload an image.');
        return;
    }
    
    Tesseract.recognize(
        fileInput,
        'eng',
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        console.log('OCR Output:', text); // Check the OCR output here

        const parsedData = parseTextToTable(text);
        console.log('Parsed Data:', parsedData); // Check the parsed data here
        generateExcel(parsedData);

        // Download OCR text as a .txt file
        downloadOCRText(text);
    });
});


function parseTextToTable(text) {
    const rows = text.trim().split('\n');
    const parsedData = rows.map(row => {
        const cleanedRow = row.replace(/[|\[\]]/g, '').trim();
        const data = cleanedRow.split(/\s+/);
        const name = data.slice(0, 2).join(' ');
        const attendanceData = data.slice(2);
        const totalAttendance = attendanceData.filter(status => status.toLowerCase() === 'p').length;
        return [name, totalAttendance];
    });

    return parsedData.filter(item => item[0]);
}


function generateExcel(data) {
    const wb = XLSX.utils.book_new();
    const wsData = [['Name', 'Total Attendance']];

    data.forEach(item => {
        wsData.push(item);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.getElementById('downloadLink');
    a.href = url;
    a.download = 'Attendance.xlsx';
    a.style.display = 'block';
}


