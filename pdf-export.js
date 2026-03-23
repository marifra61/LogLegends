// PDF Export functionality - FREE with weather conditions

// Main PDF export function
window.exportToPDF = async function() {
    try {
        // Get all data
        const data = window.exportAllData ? window.exportAllData() : null;
        if (!data) {
            alert('No data to export!');
            return;
        }
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header with professional styling
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('DRIVING LOG RECORD', 105, 20, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('State-Compliant Driving Hours Documentation', 105, 28, { align: 'center' });
        
        // Decorative line
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(1);
        doc.line(20, 33, 190, 33);
        
        // Student Information
        let yPos = 45;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('STUDENT INFORMATION', 20, yPos);
        
        yPos += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${data.user.name || '___________________________'}`, 20, yPos);
        
        yPos += 7;
        doc.text(`Email: ${data.user.email || '___________________________'}`, 20, yPos);
        
        yPos += 7;
        doc.text(`Permit Number: ___________________________`, 20, yPos);
        
        yPos += 7;
        doc.text(`Date of Birth: ___________________________`, 20, yPos);
        
        // Hours Summary
        yPos += 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('HOURS SUMMARY', 20, yPos);
        
        yPos += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Create summary box using dynamic requirements
        const reqs = window.getRequirements ? window.getRequirements() : { totalHours: 60, nightHours: 10, weeklyHours: 10 };
        
        // Calculate total distance
        let totalDistance = 0;
        data.stats.trips.forEach(trip => {
            if (trip.distance) {
                totalDistance += trip.distance;
            }
        });
        
        const summaryData = [
            ['Total Hours:', `${data.stats.totalHours.toFixed(2)} hours`, `Requirement: ${reqs.totalHours} hours`],
            ['Night Hours (6pm-6am):', `${data.stats.nightHours.toFixed(2)} hours`, `Requirement: ${reqs.nightHours} hours`],
            ['Total Trips:', `${data.stats.trips.length}`, ''],
            ['Total Distance:', `${totalDistance.toFixed(1)} miles`, ''],
        ];
        
        summaryData.forEach((row) => {
            doc.setFont('helvetica', 'bold');
            doc.text(row[0], 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(row[1], 80, yPos);
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(row[2], 130, yPos);
            doc.setTextColor(0);
            doc.setFontSize(11);
            yPos += 7;
        });
        
        // Trip Log Header
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DETAILED TRIP LOG', 20, yPos);
        
        yPos += 8;
        
        // Trip table headers - adjusted positions for weather column
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Date', 20, yPos);
        doc.text('Start', 42, yPos);
        doc.text('End', 60, yPos);
        doc.text('Hrs', 78, yPos);
        doc.text('Night', 92, yPos);
        doc.text('Miles', 108, yPos);
        doc.text('Weather', 125, yPos);
        doc.text('Conditions', 160, yPos);
        
        yPos += 3;
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);
        
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        
        // Add trips (with page breaks if needed)
        const trips = data.stats.trips.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        for (let i = 0; i < trips.length; i++) {
            const trip = trips[i];
            
            // Check if we need a new page
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                
                // Repeat headers on new page
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('Date', 20, yPos);
                doc.text('Start', 42, yPos);
                doc.text('End', 60, yPos);
                doc.text('Hrs', 78, yPos);
                doc.text('Night', 92, yPos);
                doc.text('Miles', 108, yPos);
                doc.text('Weather', 125, yPos);
                doc.text('Conditions', 160, yPos);
                
                yPos += 3;
                doc.line(20, yPos, 190, yPos);
                yPos += 5;
                doc.setFont('helvetica', 'normal');
            }
            
            const date = new Date(trip.startTime);
            const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
            const startTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(trip.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const duration = trip.duration.toFixed(1) + 'h';
            const night = trip.isNight ? 'Yes' : 'No';
            
            // Get distance - calculate from start/end if not available
            let distance = 'N/A';
            if (trip.distance && trip.distance > 0) {
                distance = trip.distance.toFixed(1);
            } else if (trip.startLocation && trip.endLocation) {
                // Estimate straight-line distance
                const estDist = getDistanceBetweenPoints(
                    trip.startLocation.lat, trip.startLocation.lng,
                    trip.endLocation.lat, trip.endLocation.lng
                );
                if (estDist > 0) {
                    distance = estDist.toFixed(1) + '*';
                }
            }
            
            // Weather info
            let weatherTemp = '';
            let weatherCond = '';
            if (trip.weather) {
                weatherTemp = trip.weather.temp + 'F';
                weatherCond = trip.weather.condition || '';
                // Truncate long conditions
                if (weatherCond.length > 12) {
                    weatherCond = weatherCond.substring(0, 11) + '.';
                }
            }
            
            doc.setFontSize(8);
            doc.text(dateStr, 20, yPos);
            doc.text(startTime, 42, yPos);
            doc.text(endTime, 60, yPos);
            doc.text(duration, 78, yPos);
            doc.text(night, 92, yPos);
            doc.text(distance, 108, yPos);
            doc.text(weatherTemp, 125, yPos);
            doc.text(weatherCond, 155, yPos);
            
            yPos += 5;
        }
        
        // Add footnote if estimated distances were used
        const hasEstimatedDistances = trips.some(t => 
            (!t.distance || t.distance === 0) && t.startLocation && t.endLocation
        );
        
        if (hasEstimatedDistances) {
            yPos += 5;
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text('* Distance estimated from start/end points (straight-line)', 20, yPos);
            doc.setTextColor(0);
        }
        
        // Signature section (new page if needed)
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        } else {
            yPos += 20;
        }
        
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICATION', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('I certify that the above driving hours are accurate and complete.', 20, yPos);
        
        yPos += 20;
        doc.text('Student Signature: _______________________________  Date: __________', 20, yPos);
        
        yPos += 15;
        doc.text('Parent/Guardian Signature: ________________________  Date: __________', 20, yPos);
        
        yPos += 15;
        doc.text('Instructor Signature (if applicable): _______________  Date: __________', 20, yPos);
        
        // Footer on every page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Generated by LogLegends on ${new Date().toLocaleDateString('en-US')}`, 105, 290, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: 'right' });
        }
        
        // Save the PDF
        const userName = data.user.name || 'Driver';
        const filename = `DrivingLog_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        console.log('PDF exported successfully:', filename);
        
        // Show success toast
        showExportSuccess();
        
        // Trigger tip modal after successful export
        if (typeof TipSystem !== 'undefined') {
            setTimeout(() => TipSystem.showTipModal('pdf_export'), 1500);
        }
        
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Error exporting PDF. Please try again.');
    }
};

// Calculate distance between two GPS points (Haversine formula)
function getDistanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Show success toast
function showExportSuccess() {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #00e676, #00c853);
        color: white;
        padding: 15px 30px;
        border-radius: 30px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0, 230, 118, 0.4);
        animation: slideUp 0.3s ease-out;
    `;
    toast.textContent = '✓ PDF Downloaded!';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

console.log('PDF export module loaded (with weather support)');
