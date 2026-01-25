// PDF Export functionality for driving logs (DMV-ready format)

// Check if user has premium access (for freemium gate)
function hasPremiumAccess() {
    const premiumStatus = localStorage.getItem('premium_user');
    return premiumStatus === 'true';
}

// Main PDF export function
window.exportToPDF = async function() {
    // Check premium status (will be gated in freemium setup)
    if (!hasPremiumAccess()) {
        showPremiumModal();
        return;
    }
    
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
        
        // Header with professional styling (no emoji)
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234); // Purple/blue color
        doc.text('DRIVING LOG RECORD', 105, 20, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0); // Back to black
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
        
        // Create summary box
        const summaryData = [
            ['Total Hours:', `${data.stats.totalHours.toFixed(2)} hours`, 'Requirement: 60 hours'],
            ['Night Hours (6pm-6am):', `${data.stats.nightHours.toFixed(2)} hours`, 'Requirement: 10 hours'],
            ['Total Trips:', `${data.stats.trips.length}`, ''],
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
        
        // Trip table headers
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Date', 20, yPos);
        doc.text('Start', 50, yPos);
        doc.text('End', 75, yPos);
        doc.text('Duration', 95, yPos);
        doc.text('Night', 120, yPos);
        doc.text('Distance', 140, yPos);
        doc.text('Speed', 165, yPos);
        
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
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('Date', 20, yPos);
                doc.text('Start', 50, yPos);
                doc.text('End', 75, yPos);
                doc.text('Duration', 95, yPos);
                doc.text('Night', 120, yPos);
                doc.text('Distance', 140, yPos);
                doc.text('Speed', 165, yPos);
                
                yPos += 3;
                doc.line(20, yPos, 190, yPos);
                yPos += 5;
                doc.setFont('helvetica', 'normal');
            }
            
            const date = new Date(trip.startTime);
            const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
            const startTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(trip.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const duration = trip.duration.toFixed(2) + 'h';
            const night = trip.isNight ? 'Yes' : 'No';
            const distance = trip.distance ? trip.distance.toFixed(1) + ' mi' : 'N/A';
            const avgSpeed = trip.distance && trip.duration > 0 ? 
                (trip.distance / trip.duration).toFixed(0) + ' mph' : 'N/A';
            
            doc.text(dateStr, 20, yPos);
            doc.text(startTime, 50, yPos);
            doc.text(endTime, 75, yPos);
            doc.text(duration, 95, yPos);
            doc.text(night, 120, yPos);
            doc.text(distance, 140, yPos);
            doc.text(avgSpeed, 165, yPos);
            
            yPos += 6;
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
        const filename = `DrivingLog_${data.user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        console.log('PDF exported successfully:', filename);
        alert('✅ PDF exported successfully!');
        
    } catch (error) {
        console.error('PDF export error:', error);
        alert('❌ Error exporting PDF. Please try again.');
    }
};

// Show premium modal (for non-premium users)
function showPremiumModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            border-radius: 20px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        ">
            <h2 style="color: white; font-size: 2rem; margin-bottom: 15px;">✨ Premium Feature</h2>
            <p style="color: white; font-size: 1.1rem; margin-bottom: 25px; opacity: 0.9;">
                PDF export is available with LogLegends Premium
            </p>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <p style="color: white; font-weight: bold; margin-bottom: 10px;">Premium includes:</p>
                <p style="color: white; font-size: 0.95rem; margin: 8px 0;">✅ DMV-ready PDF exports</p>
                <p style="color: white; font-size: 0.95rem; margin: 8px 0;">✅ Unlimited cloud storage</p>
                <p style="color: white; font-size: 0.95rem; margin: 8px 0;">✅ Advanced route analytics</p>
                <p style="color: white; font-size: 0.95rem; margin: 8px 0;">✅ Priority support</p>
            </div>
            <button onclick="upgradeToPremium()" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 15px 40px;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 10px;
                width: 100%;
            ">Upgrade to Premium</button>
            <button onclick="this.closest('div').parentElement.remove()" style="
                background: transparent;
                color: white;
                border: 2px solid white;
                padding: 12px 30px;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
            ">Maybe Later</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Temporary function to enable premium (will be replaced with payment processing)
window.upgradeToPremium = function() {
    // Close modal
    const modals = document.querySelectorAll('body > div');
    modals.forEach(modal => {
        if (modal.style.position === 'fixed' && modal.style.zIndex === '10000') {
            modal.remove();
        }
    });
    
    // Navigate to upgrade page (placeholder)
    alert('This will redirect to the payment page.\n\nFor now, upgrading to premium for testing...');
    localStorage.setItem('premium_user', 'true');
    alert('✅ Premium activated! You can now export PDFs.');
};

console.log('PDF export module loaded');
